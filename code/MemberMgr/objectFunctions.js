/**
 * check if a registration attempt is ok
 */

function evalRegistration() {
   var reg = this.checkReg();
   if (!reg.error) {
		var newUser = user.register(reg.name, reg.password1);
 		if (newUser) {
         newUser.name = reg.name;
			newUser.email = reg.email;
         newUser.url = reg.url;
         newUser.description = reg.description;
         newUser.registered = new Date();
         newUser.blocked = 0;
			user.login(reg.name, reg.password1);
         user.sendConfirmationMail();
			res.message = "Welcome " + user.name + ". Have fun!<br>";
			if (user.cache.referer) {
			   var redirectTo = user.cache.referer;
			   user.cache.referer = null;
			} else
			   var redirectTo = root.href();
			res.redirect(redirectTo);
		} else
 			res.message = "Sorry, we already have a member with that name.";
	}
	return (reg);
}


/**
 * check if all values necessary to register
 * are given and return them as properties of a
 * temporary HopObject
 */

function checkReg() {
   var reg = new HopObject();
	if (!res.message) res.message = "Please fill out the form completely and then click the button to register.";
   if (req.data.name)
      reg.name = req.data.name;
   else
      reg.error = true;
   // check if username contains any special characters
   if (!isClean(reg.name)) {
      res.message = "Please don't use any special characters in your username!";
      reg.error = true;
   }
   // check if passwords match
	if (req.data.password1 && req.data.password2) {
      if (req.data.password1 == req.data.password2) {
   	   reg.password1 = req.data.password1;
         reg.password2 = req.data.password2;
      } else {
         res.message = "Passwords didn't match! Please re-enter:";
         reg.error = true;
      }
   } else
      reg.error = true;
   // check if email-address is valid
   if (req.data.email) {
   	reg.email = req.data.email;
      if (!checkEmail(req.data.email)) {
         res.message = "Ooops! The email-address you entered is not valid!";
         reg.error = true;
      }
   } else
      reg.error = true;
   if (req.data.description)
      reg.description = req.data.description;
   if (req.data.url)
   	reg.url = req.data.url;

   return (reg);
}

/**
 * update user-profile
 */

function updateUser() {
   if (req.data.oldpwd && req.data.newpwd1 && req.data.newpwd2) {
      if (user.password != req.data.oldpwd) {
         res.message = "Old password incorrect!";
         res.redirect(this.href("edit"));
      } else if (req.data.newpwd1 != req.data.newpwd2) {
         res.message = "Ooops! Passwords didn't match! Please type in again!";
         res.redirect(this.href("edit"));
      } else
         user.password = req.data.newpwd1;
   }
   user.url = req.data.url;
   user.email = req.data.email;
   user.description = req.data.description;
   res.message = "Changes were saved successfully!";
   res.redirect(this.__parent__.href());
}