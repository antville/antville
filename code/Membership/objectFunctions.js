/**
 * function updates a membership
 * @param Int Integer representing role of user
 * @param Obj User-object modifying this membership
 * @return Obj Object containing two properties:
 *             - error (boolean): true if error happened, false if everything went fine
 *             - message (String): containing a message to user
 */

function updateMembership(lvl,modifier) {
   if (isNaN(lvl))
      return (getError("memberNoRole"));
   // editing the own membership is denied
   if (this.user == modifier)
      return (getError("memberEditSelfDenied"));
   if (lvl == 1)
      this.level = CONTRIBUTOR;
   else if (lvl == 2)
      this.level = CONTENTMANAGER;
   else if (lvl == 3)
      this.level = ADMIN;
   else
      this.level = 0;
   this.modifytime = new Date();
   this.modifier = modifier;
   this.sendConfirmationMail(modifier.email);
   return (getConfirm("update"));
}

/**
 * send a mail to confirm registration
 * @param String email-address of user who modified this member
 */

function sendConfirmationMail(fromEmail) {
	var mail = new Mail();
	mail.setFrom(fromEmail);
	mail.addTo(this.user.email);
	mail.setSubject(getMessage("mailsubject","statusChange",this.site.title));
	mail.setText(this.renderSkinAsString("mailbody"));
	mail.send();
}
