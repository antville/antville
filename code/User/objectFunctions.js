/**
 * send a mail to confirm registration
 * @param String email-address used as sender-address
 */

function sendConfirmationMail(sender) {
   var mail = new Mail();
   mail.setFrom(sender);
   mail.addTo(this.email);
   mail.setSubject("Welcome to Antville!");
   var mailParam = new Object();
   mailParam.name = this.name;
   mailParam.password = this.password;
	mail.setText(this.renderSkinAsString("mailbody",mailParam));
	mail.send();
}


/**
 * check if user is blocked
 */

function isBlocked() {
   if (parseInt(this.blocked,10))
      return true;
   return false;
}
