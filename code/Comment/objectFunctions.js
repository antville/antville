/**
 * function returns true/false whether comment is online or not
 * @param Boolean true if comment is online, false if offline
 */

function isOnline() {
   if (parseInt(this.online,10))
      return true;
   return false;
}


/**
 * function evaluates changes to posting
 * @param Obj Object containing the properties needed for creating a reply
 * @return Obj Object containing two properties:
 *             - error (boolean): true if error happened, false if everything went fine
 *             - message (String): containing a message to user
 */

function updateComment(param) {
   var result = new Object();
   if (param.text) {

      // check if there's a difference between old and
      // new text of more than 50 characters:
      var majorUpdate = Math.abs(this.text.length - param.text.length) > 50;

      this.title = param.title;
      this.text = param.text;
      if (majorUpdate)
         this.modifytime = new Date();
      this.ipaddress = param.http_remotehost;
      result.message = "Changes were saved successfully!";
      result.error = false;
   } else {
      result.message = "You need at least some text!";
      result.error = true;
   }
   this.cache.lrText = null;
   return (result);
}
