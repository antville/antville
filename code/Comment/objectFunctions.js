/**
 * function evaluates changes to posting
 * @param Obj Object containing the properties needed for creating a reply
 * @return Obj Object containing two properties:
 *             - error (boolean): true if error happened, false if everything went fine
 *             - message (String): containing a message to user
 */

function updateComment(param) {
   var result = new Object();
   if (param.content_text) {
      // check if there's a difference between old and
      // new text of more than 50 characters:
      var oldtext = this.getContentPart("text");
      var majorUpdate = Math.abs(oldtext.length - param.content_text.length) > 50;

      var cont = this.getContent();
      for (var i in param) {
         if (i.indexOf ("content_") == 0)
             cont[i.substring(8)] = param[i].trim();
      }
      this.setContent (cont);

      // let's keep the comment title property:
      this.title = param.content_title;
      // this.text = param.text;
      if (majorUpdate)
         this.modifytime = new Date();
      this.cache.modifytime = new Date();
      this.ipaddress = param.http_remotehost;
      result = getConfirm("update");
   } else {
      result = getError("textMissing");
   }
   return (result);
}
