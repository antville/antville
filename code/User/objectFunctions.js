/**
 * send a mail to confirm registration
 */

function sendConfirmationMail() {
   var mail = new Mail();
   mail.setFrom(getProperty("adminEmail"));
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
   if (parseInt(this.blocked,10)) {
      res.message = "Sorry, you were blocked by an Administrator!";
      return true;
   } else
      return false;
}
