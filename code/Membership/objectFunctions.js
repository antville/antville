/**
 * function updates a membership
 * @param Int Integer representing role of user
 * @param Obj User-object modifying this member
 * @return Obj Object containing two properties:
 *             - error (boolean): true if error happened, false if everything went fine
 *             - message (String): containing a message to user
 */

function updateMember(lvl,modifier) {
   var result;
   if (!isNaN(lvl)) {
      if (lvl == 1)
         this.level = getContributorLvl();
      else if (lvl == 2)
         this.level = getContentManagerLvl();
      else if (lvl == 3)
         this.level = getAdminLvl();
      else
         this.level = 0;
      this.modifytime = new Date();
      this.modifier = modifier;
      this.sendConfirmationMail(modifier.email);
      result = getConfirm("update");
   } else
      result = getError("memberNoRole");
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
