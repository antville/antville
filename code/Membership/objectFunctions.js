/**
 * constructor function for membership objects
 */
function constructor(usr, level) {
   this.user = usr;
   this.username = usr.name;
   this.level = level ? level : SUBSCRIBER;
   this.createtime = new Date();
   return this;
}


/**
 * function updates a membership
 * @param Int Integer representing role of user
 * @param Obj User-object modifying this membership
 * @return Obj Object containing two properties:
 *             - error (boolean): true if error happened, false if everything went fine
 *             - message (String): containing a message to user
 */

function updateMembership(lvl, modifier) {
   if (isNaN(lvl))
      throw new Exception("memberNoRole");
   // editing the own membership is denied
   if (this.user == modifier)
      throw new DenyException("memberEditSelf");
   if (lvl != this.level) {
      this.level = lvl;
      this.modifier = modifier;
      this.modifytime = new Date();
      sendMail(root.sys_email,
               this.user.email,
               getMessage("mail.statusChange", this.site.title),
               this.renderSkinAsString("mailstatuschange")
              );
   }
   return new Message("update");
}
