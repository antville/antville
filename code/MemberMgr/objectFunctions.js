/**
 * check if a login attempt is ok
 * @param String username
 * @param String password
 * @return Obj Object containing two properties:
 *             - error (boolean): true if error happened, false if everything went fine
 *             - message (String): containing a message to user
 */
function evalLogin(username, password) {
   // check if login is successful
   if (!session.login(username, password))
      throw new Exception("loginTypo");
   // login was successful
   session.user.lastVisit = new Date();
   if (req.data.remember) {
      // user allowed us to set permanent cookies for auto-login
      res.setCookie("avUsr", session.user.name, 365);
      var ip = req.data.http_remotehost.clip(getProperty ("cookieLevel","4"),"","\\.");
      res.setCookie("avPw", (session.user.password + ip).md5(), 365);   
   }
   return new Message("welcome", [res.handlers.context.getTitle(), session.user.name]);
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
   // check if username is existing and is clean
   // can't use isClean() here because we accept
   // special characters like umlauts and spaces
   var invalidChar = new RegExp("[^a-zA-Z0-9äöüß\\.\\-_ ]");
   if (!param.name)
      throw new Exception("usernameMissing");
   else if (param.name.length > 30)
      throw new Exception("usernameTooLong");
   else if (invalidChar.exec(param.name))
      throw new Exception("usernameNoSpecialChars");
   else if (this[param.name] || this[param.name + "_action"])
      throw new Exception("usernameExisting");

   // check if passwords match
   if (!param.password1 || !param.password2)
      throw new Exception("passwordTwice");
   else if (param.password1 != param.password2)
      throw new Exception("passwordNoMatch");

   // check if email-address is valid
   if (!param.email)
      throw new Exception("emailMissing");
   evalEmail(param.email);

   var newUser = app.registerUser(param.name, param.password1);
   if (!newUser)
      throw new Exception("memberExisting");
   newUser.email = param.email;
   newUser.publishemail = param.publishemail;
   newUser.url = evalURL(param.url);
   newUser.registered = new Date();
   newUser.blocked = 0;
   // grant trust and sysadmin-rights if there's no sysadmin 'til now
   if (root.manage.sysadmins.size() == 0)
      newUser.sysadmin = newUser.trusted = 1;
   else
      newUser.sysadmin = newUser.trusted = 0;
   if (path.Site) {
      var welcomeWhere = path.Site.title;
      // if user registered within a public site, we subscribe
      // user to this site
      if (path.Site.online)
         this.add(new Membership(newUser));
   } else
      var welcomeWhere = root.getTitle();
   return new Message("welcome", [welcomeWhere, newUser.name], newUser);
}


/**
 * update user-profile
 * @param Obj Object containing form values
 * @return Obj Object containing two properties:
 *             - error (boolean): true if error happened, false if everything went fine
 *             - message (String): containing a message to user
 */
function updateUser(param) {
   if (param.oldpwd) {
      if (session.user.password != param.oldpwd)
         throw new Exception("accountOldPwd");
      if (!param.newpwd1 || !param.newpwd2)
         throw new Exception("accountNewPwdMissing");
      else if (param.newpwd1 != param.newpwd2)
         throw new Exception("passwordNoMatch");
      session.user.password = param.newpwd1;
   }
   session.user.url = evalURL(param.url);
   session.user.email = evalEmail(param.email);
   session.user.publishemail = param.publishemail;
   return new Message("update");
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
   if (!email)
      throw new Exception("emailMissing");
   var sqlClause = "select USER_NAME,USER_PASSWORD from AV_USER where USER_EMAIL = '" + email + "'";
   var dbConn = getDBConnection("antville");
   var dbResult = dbConn.executeRetrieval(sqlClause);
   var cnt = 0;
   var pwdList = "";
   while (dbResult.next()) {
      pwdList += getMessage("MemberMgr.userName") + ": " + dbResult.getColumnItem("USER_NAME") + "\n";
      pwdList += getMessage("MemberMgr.password") + ": " + dbResult.getColumnItem("USER_PASSWORD") + "\n\n";
      cnt++;
   }
   dbResult.release;
   if (!cnt)
      throw new Exception("emailNoAccounts");
   // now we send the mail containing all accounts for this email-address
   var mailbody = this.renderSkinAsString("mailpassword", {text: pwdList});
   sendMail(root.sys_email, email, getMessage("mail.sendPwd"), mailbody);
   return new Message("mailSendPassword");
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
   var dbConn = getDBConnection("antville");
   var dbError = dbConn.getLastError();
   if (dbError)
      throw new Exception("database", dbError);
   var query = "select USER_NAME,USER_URL from AV_USER ";
   query += "where USER_NAME like '%" + key + "%' order by USER_NAME asc";
   var searchResult = dbConn.executeRetrieval(query);
   var dbError = dbConn.getLastError();
   if (dbError)
      throw new Exception("database", dbError);
   var found = 0;
   res.push();
   while (searchResult.next() && found < 100) {
      var name = searchResult.getColumnItem("USER_NAME");
      var url = searchResult.getColumnItem("USER_URL");
      // do nothing if the user is already a member
      if (this.get(name))
         continue;
      var sp = {name: name,
                description: (url ? Html.linkAsString({href: url}, url) : null)};
      this.renderSkin("searchresultitem", sp);
      found++;
   }
   dbConn.release();
   switch (found) {
      case 0:
         throw new Exception("resultNoUser");
      case 1:
         return new Message("resultOneUser", null, res.pop());
      case 100:
         return new Message("resultTooManyUsers", null, res.pop());
      default:
         return new Message("resultManyUsers", found, res.pop());
   }
}


/**
 * function adds a user with a given username to the list of members
 * of this site
 * @param String Name of user to add to members
 * @return Obj Object containing two properties:
 *             - error (boolean): true if error happened, false if everything went fine
 *             - message (String): containing a message to user
 */
function evalNewMembership(username, creator) {
   var newMember = root.users.get(username);
   if (!newMember)
      throw new Exception("resultNoUser");
   else if (this.get(username))
      throw new Exception("userAlreadyMember");
   try {
      var ms = new Membership(newMember);
      this.add(ms);
      return new Message("memberCreate", ms.user.name, ms);
   } catch (err) {
      throw new Exception("memberCreate", username);
   }
   return;
}


/**
 * function deletes a member
 * @param Obj Membership-Object to delete
 * @param Obj User-Object about to delete membership
 * @return Obj Object containing two properties:
 *             - error (boolean): true if error happened, false if everything went fine
 *             - message (String): containing a message to user
 */
function deleteMembership(membership) {
   if (!membership)
      throw new Error("memberDelete");
   else if (membership.level == ADMIN)
      throw new Error("adminDelete");
   membership.remove();
   return new Message("memberDelete");
}


/**
 * function deletes all members
 */
function deleteAll() {
   for (var i=this.size();i>0;i--)
      this.get(i-1).remove();
   return true;
}


/**
 * function retrieves the level of a users membership
 */
function getMembershipLevel(usr) {
   var ms = this.get(usr.name);
   if (!ms)
      return null;
   return ms.level;
}
