/**
 * constructor function for comment objects
 */
function constructor(site, creator, ipaddress) {
   this.site = site;
   this.online = 1;
   this.editableby = null;
   this.ipaddress = ipaddress;
   this.creator = creator;
   this.createtime = this.modifytime = new Date();
}

/**
 * function evaluates changes to posting
 * @param Obj Object containing the properties needed for creating a reply
 * @return Obj Object containing two properties:
 *             - error (boolean): true if error happened, false if everything went fine
 *             - message (String): containing a message to user
 */

function updateComment(param) {
   // collect content
   var content = extractContent(param, this.content.getAll());
   if (!content.exists)
      throw new Exception("textMissing");
   this.setContent(content.value);
   // let's keep the comment title property:
   this.title = content.value.title;
   if (content.isMajorUpdate) {
      this.modifytime = new Date();
      // send e-mail notification
      if (this.site.isNotificationEnabled()) 
         this.site.sendNotification("update", this);
   }
   this.cache.modifytime = new Date();
   this.ipaddress = param.http_remotehost;
   return new Message("update");
}
