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
 */

function updateMember() {
   if (req.data.level != null && req.data.level != "")
      this.level = req.data.level;
   this.modifytime = new Date();
   this.modifier = user;
   this.sendConfirmationMail();
   res.message = "Changes were saved successfully!";
   res.redirect(this.weblog.href("memberships"));
}

/**
 * send a mail to confirm registration
 */

function sendConfirmationMail() {
	var mail = new Mail();
	mail.setFrom(getProperty("adminEmail"));
	mail.addTo(this.user.email);
	mail.setSubject(this.weblog.title + " - Your status was changed!");
	mail.setText(this.renderSkinAsString("mailbody"));
	mail.send();

}

