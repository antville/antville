/**
 * function returns true if the member has admin-status
 */

function isAdmin() {
   if (parseInt(this.level,10) == 2)
      return true;
   return false;
}

/**
 * function returns true if the member has contributor-status
 */

function isContributor() {
   if (parseInt(this.level,10) == 1)
      return true;
   return false;
}


/**
 * function updates a membership
 * @param Int Integer representing role of user
 * @param Obj User-object modifying this member
 * @return Obj Object containing two properties:
 *             - error (boolean): true if error happened, false if everything went fine
 *             - message (String): containing a message to user
 */

function updateMember(lvl,modifier) {
   var result = new Object();
   if (!isNaN(lvl)) {
      this.level = lvl;
      this.modifytime = new Date();
      this.modifier = modifier;
      this.sendConfirmationMail(modifier.email);
      result.message = "Changes were saved successfully!";
      result.error = false;
   } else {
      result.message = "Please choose a role for this member!";
      result.error = true;
   }
   return (result);
}

/**
 * send a mail to confirm registration
 * @param String email-address of user who modified this member
 */

function sendConfirmationMail(fromEmail) {
	var mail = new Mail();
	mail.setFrom(fromEmail);
	mail.addTo(this.user.email);
	mail.setSubject(this.weblog.title + " - Your status was changed!");
	mail.setText(this.renderSkinAsString("mailbody"));
	mail.send();
}
