/**
 * check if a login attempt is ok
 * @param String username
 * @param String password
 * @return Obj Object containing two properties:
 *             - error (boolean): true if error happened, false if everything went fine
 *             - message (String): containing a message to user
 */

function evalLogin(username,password) {
   var result = new Object();
   result.error = true;

   // check if login is successful
   if (user.login(username, password)) {
      if (user.isBlocked()) {
         result.message = "Sorry, your account was disabled!";
         user.logout();
      }
      // login successful
      user.lastVisit = new Date();
      if (req.data.remember) {
         // user allowed us to set permanent cookies for auto-login
         res.setCookie("avUsr",user.name,365);
         res.setCookie("avPw",calcMD5(user.password),365);
      }
      result.message = "Welcome to Antville, " + user.name + "! Have fun!";
      result.error = false;
   } else
      result.message = "Login failed! Maybe a typo?";
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
   var result = new Object();
   result.error = true;

   // check if email-address is valid
   if (!param.email)
      result.message = "Please type in your email-address!";
   else if (!checkEmail(param.email))
      result.message = "Ooops! The email-address you entered is not valid!";

   // check if passwords match
	if (!param.password1 || !param.password2)
	   result.message = "Please type in your password twice!";
	else if (param.password1 != param.password2)
      result.message = "Passwords didn't match! Please re-enter:";

   // check if username is existing and is clean
   if (!param.name)
      result.message = "Please choose a username!";
   else if (!isClean(param.name))
      result.message = "Please don't use any special characters in your username!";

   if (!result.message) {
		var newUser = user.register(param.name, param.password1);
 		if (newUser) {
         newUser.name = param.name;
			newUser.email = param.email;
         newUser.url = evalURL(param.url);
         newUser.description = param.description;
         newUser.registered = new Date();
         newUser.blocked = 0;
			result.message = "Welcome " + newUser.name + ". Have fun!";
         result.error = false;
         result.username = newUser.name;
         result.password = newUser.password;
		} else
 			result.message = "Sorry, there is already a member with this name.";
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
   var result = new Object();
   if (param.oldpwd && param.newpwd1 && param.newpwd2) {
      if (user.password != param.oldpwd) {
         result.message = "Old password is incorrect!";
         result.error = true;
      } else if (param.newpwd1 != param.newpwd2) {
         result.message = "Ooops! Passwords didn't match! Please type in again!";
         result.error = true;
      } else
         user.password = param.newpwd1;
   }
   if (!checkEmail(param.email)) {
      result.message = "Your email-address is not valid!";
      result.error = true;
   }
   if (!result.error) {
      user.url = evalURL(param.url);
      user.email = param.email;
      // not in use right now: user.description = param.description;
      result.message = "Changes were saved successfully!";
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
   var result = new Object();
   if (!email) {
      result.message = "Please specify an email-address!";
      result.error = true;
   } else {
      var sqlClause = "select USERNAME,PASSWORD from USER where EMAIL = '" + email + "'";
      var dbConn = getDBConnection("antville");
      var dbResult = dbConn.executeRetrieval(sqlClause);
      var cnt = 0;
      var pwdList = "";
      while (dbResult.next()) {
         pwdList += "Username: " + dbResult.getColumnItem("USERNAME") + "\n";
         pwdList += "Password: " + dbResult.getColumnItem("PASSWORD") + "\n\n";
         cnt++;
      }
      dbResult.release;
      if (!cnt) {
         result.message = "No accounts found for this eMail-address!";
         result.error = true;
      }
   }
   if (!result.error) {
      // now we send the mail containing all accounts for this email-address
      var mail = new Mail();
      mail.setFrom(getProperty("adminEmail"));
      mail.addTo(email);
      mail.setSubject("Your Accounts for Antville");
      var mailParam = new Object();
      var now = new Date();
      mailParam.timestamp = this._parent.formatTimestamp(now,new Object());
      mailParam.text = pwdList;
   	mail.setText(this.renderSkinAsString("pwdmail",mailParam));
      var sendResult = mail.send();
      if (sendResult.status) {
         result.message = "An error occurred while trying to send the mail!";
         result.error = true;
      } else
         result.message = "A mail containing your the password(s) was sent successfully!";
   }
   return (result);
}