/**
 * function returns true if the member has admin-status
 */

function isAdmin() {
   if (parseInt(this.admin,10))
      return true;
   return false;
}

/**
 * function returns true if the member has contributor-status
 */

function isContributor() {
   if (parseInt(this.contributor,10))
      return true;
   return false;
}


/**
 * function updates a membership
 */

function updateMember() {
   this.admin = (parseInt(req.data.admin) ? parseInt(req.data.admin) : 0);
   this.contributor = (parseInt(req.data.contributor) ? parseInt(req.data.contributor) : 0);
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
	mail.setTo(this.user.email);
	mail.setSubject(this.weblog.title + " - Your status was changed!");
	mail.setText(this.renderSkinAsString("mailbody"));
	mail.send();

}

