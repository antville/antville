/**
 * check if a login attempt is ok
 * @param String username
 * @param String password
 * @return Obj Object containing two properties:
 *             - error (boolean): true if error happened, false if everything went fine
 *             - message (String): containing a message to user
 */

function evalLogin(username,password) {
   var result;
   // check if login is successful
   if (session.login(username, password)) {
      // login was successful
      session.user.lastVisit = new Date();
      if (req.data.remember) {
         // user allowed us to set permanent cookies for auto-login
         res.setCookie("avUsr",session.user.name,365);
         res.setCookie("avPw",Packages.helma.util.MD5Encoder.encode(session.user.password+req.data.http_remotehost),365);
      }
      result = getConfirm("welcome",new Array(path.site ? path.site.title : root.getSysTitle(),session.user.name));
   } else {
      result = getError("loginTypo");
   }
   return (result);
}

/**
 * check if a registration attempt is ok
 * @param Obj Object containing form-values needed for registration
 * @return Obj Object containing four properties:
 *             - error (boolean): true if error happened, false if everything went fine
 *             - message (String): containing a message to user
 *             - username: username of registered user
 *             - password: password of registered user
 */

function evalRegistration(param) {
   var result;
   // check if email-address is valid
   if (!param.email)
      result = getError("emailMissing");
   else if (!checkEmail(param.email))
      result = getError("emailInvalid");

   // check if passwords match
   if (!param.password1 || !param.password2)
      result = getError("passwordTwice");
   else if (param.password1 != param.password2)
      result = getError("passwordNoMatch");

   // check if username is existing and is clean
   // can't use global isClean() here because we accept
   // special characters like umlauts and spaces
   var invalidChar = new RegExp("[^a-zA-Z0-9äöüß\\.\\-_ ]");
   if (!param.name)
      result = getError("unameMissing");
   else if (invalidChar.exec(param.name))
      result = getError("unameNoSpecialChars");
   else {
      // check if username is similar to a built in function
      if (this[param.name] || this[param.name + "_action"])
         result = getError("unameExisting");
   }

   if (!result) {
      var newUser = app.registerUser(param.name, param.password1);
      if (newUser) {
         newUser.email = param.email;
         newUser.publishemail = param.publishemail;
         newUser.url = evalURL(param.url);
         newUser.description = param.description;
         newUser.registered = new Date();
         newUser.blocked = 0;
         // grant trust and sysadmin-rights if there's no sysadmin 'til now
         if (root.manage.sysadmins.size() == 0)
            newUser.sysadmin = newUser.trusted = 1;
         else
            newUser.sysadmin = newUser.trusted = 0;
         if (path.site) {
            var welcomeWhere = path.site.title;
            // if user registered within a public site, we add this site to favorites
            if (path.site.online)
               this.addMembership(newUser);
         } else
            var welcomeWhere = root.getSysTitle();
         result = getConfirm("welcome",new Array(welcomeWhere,newUser.name));
         result.username = newUser.name;
         result.password = newUser.password;
      } else
         result = getError("memberExisting");
   }
   return (result);
}



/**
 * update user-profile
 * @param Obj Object containing form values
 * @return Obj Object containing two properties:
 *             - error (boolean): true if error happened, false if everything went fine
 *             - message (String): containing a message to user
 */

function updateUser(param) {
   var result;
   if (param.oldpwd && param.newpwd1 && param.newpwd2) {
      if (session.user.password != param.oldpwd)
         result = getError("accountOldPwd");
      else if (param.newpwd1 != param.newpwd2)
         result = getError("passwordNoMatch");
      else
         session.user.password = param.newpwd1;
   }
   if (!checkEmail(param.email))
      result = getError("emailInvalid");
   if (!result) {
      session.user.url = evalURL(param.url);
      session.user.email = param.email;
      session.user.publishemail = param.publishemail;
      // not in use right now: user.description = param.description;
      result = getConfirm("update");
   }
   return (result);
}

/**
 * function retrieves a list of usernames/passwords for a submitted email-address
 * and sends them as mail
 * @param String email-address to search for accounts
 * @return Obj Object containing two properties:
 *             - error (boolean): true if error happened, false if everything went fine
 *             - message (String): containing a message to user
 */

function sendPwd(email) {
   var result;
   if (!email)
      result = getError("emailMissing");
   else {
      var sqlClause = "select USER_NAME,USER_PASSWORD from AV_USER where USER_EMAIL = '" + email + "'";
      var dbConn = getDBConnection("antville");
      var dbResult = dbConn.executeRetrieval(sqlClause);
      var cnt = 0;
      var pwdList = "";
      while (dbResult.next()) {
         pwdList += "Username: " + dbResult.getColumnItem("USER_NAME") + "\n";
         pwdList += "Password: " + dbResult.getColumnItem("USER_PASSWORD") + "\n\n";
         cnt++;
      }
      dbResult.release;
      if (!cnt)
         result = getError("emailNoAccounts");
   }
   if (!result) {
      // now we send the mail containing all accounts for this email-address
      var mail = new Mail();
      mail.setFrom(root.sys_email);
      mail.addTo(email);
      mail.setSubject(getMessage("mailsubject","sendPwd"));
      var mailParam = new Object();
      var now = new Date();
      mailParam.timestamp = formatTimestamp(now);
      mailParam.text = pwdList;
      mail.setText(this.renderSkinAsString("pwdmail",mailParam));
      mail.send();
      if (mail.status)
         result = getError("emailSend");
      else
         result = getConfirm("mailSendPassword");
   }
   return (result);
}

/**
 * function searches for users using part of username
 * @param String Part of username or email-address
 * @return Obj Object containing four properties:
 *             - error (boolean): true if error happened, false if everything went fine
 *             - message (String): containing a message to user
 *             - found (Int): number of users found
 *             - list (String): rendered list of users found
 */

function searchUser(key) {
   var result;
   if (!key) {
      // no keyword to search for
      return (getError("searchNoKeyword"));
   }
   var dbConn = getDBConnection("antville");
   var dbError = dbConn.getLastError();
   if (dbError)
      return (getError("database",dbError));
   var query = "select USER_NAME,USER_URL from AV_USER ";
   query += "where USER_NAME like '%" + key + "%' order by USER_NAME asc";
   var searchResult = dbConn.executeRetrieval(query);
   var dbError = dbConn.getLastError();
   if (dbError)
      return (getError("database",dbError));
   var found = 0;
   var list = "";
   while (searchResult.next() && found < 100) {
      var sp = new Object();
      sp.name = searchResult.getColumnItem("USER_NAME");
      var url = searchResult.getColumnItem("USER_URL");
      if (url)
         sp.description = "<a href=\"" + url + "\">" + url + "</a>";
      list += this.renderSkinAsString("searchresultitem",sp);
      found++;
   }
   dbConn.release();
   if (found == 0)
      result = getError("resultNoUser");
   else if (found == 1)
      result = getConfirm("resultOneUser");
   else if (found == 100)
      result = getConfirm("resultTooManyUsers");
   else
      result = getConfirm("resultManyUsers",found);
   result.list = list;
   result.found = found;
   return (result);
}

/**
 * function adds a user with a given username to the list of members
 * of this site
 * @param String Name of user to add to members
 * @return Obj Object containing two properties:
 *             - error (boolean): true if error happened, false if everything went fine
 *             - message (String): containing a message to user
 */

function evalNewMembership(uname,creator) {
   var result;
   var u = root.users.get(uname);
   if (!u)
      return (getError("resultNoUser"));
   else if (this.get(uname))
      return (getError("userAlreadyMember"));
   // send a confirmation mail to the new member
   var mail = new Mail();
   mail.setFrom(path.site.email ? path.site.email : creator.email);
   mail.setTo(u.email);
   mail.setSubject(getMessage("mailsubject","newMember",path.site.title));
   var skinParam = new Object();
   skinParam.site = path.site.title;
   skinParam.creator = creator.name;
   skinParam.url = path.site.href();
   skinParam.account = u.name;
   mail.setText(this.renderSkinAsString("mailnewmember",skinParam));
   mail.send();
   result = getConfirm("memberCreate",u.name);
   result.id = this.addMembership(u);
   result.username = u.name;
   return (result);
}

/**
 * function adds a member to a site
 * @param Obj User-object to add as member
 * @param Int optional level of this new member
 * @return Int ID of membership
 */

function addMembership(usr,level) {
   var newMembership = new membership();
   newMembership.site = this._parent;
   newMembership.user = usr;
   newMembership.username = usr.name;
   newMembership.level = level ? level : SUBSCRIBER;
   newMembership.createtime = new Date();
   this.add(newMembership);
   return (newMembership._id);
}

/**
 * function deletes a member
 * @param Obj Membership-Object to delete
 * @param Obj User-Object about to delete membership
 * @return Obj Object containing two properties:
 *             - error (boolean): true if error happened, false if everything went fine
 *             - message (String): containing a message to user
 */

function deleteMembership(membership,usr) {
   var result;
   if (!membership)
      result = getError("memberDelete");
   else if (membership.level == 3)
      result = getError("adminDelete");
   else {
      this.remove(membership);
      result = getConfirm("memberDelete");
   }
   return (result);
}

/**
 * function deletes all members
 */

function deleteAll() {
   for (var i=this.size();i>0;i--) {
      var member = this.get(i-1);
      this.remove(member);
   }
   return true;
}

/**
 * function retrieves the level of a users membership
 */
function getMembershipLevel(usr) {
   var ms = this.get(usr.name);
   if (!ms)
      return null;
   return (ms.level);
}
