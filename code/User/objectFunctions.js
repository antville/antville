/**
 * send a mail to confirm registration
 * @param String email-address used as sender-address
 */

function sendConfirmationMail(sender) {
   var mail = new Mail();
   mail.setFrom(sender);
   mail.addTo(this.email);
   mail.setSubject(getMsg("mailsubject","registration",root.getSysTitle()));
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

/**
 * check if user is trusted
 */

function isTrusted() {
   if (parseInt(this.trusted,10))
      return true;
   return false;
}

/**
 * check if user is sysAdmin
 */

function isSysAdmin() {
   if (parseInt(this.sysadmin,10))
      return true;
   return false;
}

/**
 * function for sorting member-objects by the lastupdate-timestamp
 * of the according site
 */

function sortSubscriptions(s1,s2) {
   if (s1.site.lastupdate < s2.site.lastupdate)
      return 1;
   else if (s1.site.lastupdate > s2.site.lastupdate)
      return -1;
   else
      return 0;
}
