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
      this.title = param.title;
      this.text = param.text;
      this.modifytime = new Date();
      result.message = "Changes were saved successfully!";
      result.error = false;
   } else {
      result.message = "You need at least some text!";
      result.error = true;
   }
   return (result);
}

/**
 * check if the reply is ok; if true, save reply
 * @param Obj Object containing the properties needed for creating a reply
 * @param Obj User-Object creating this reply
 * @return Obj Object containing two properties:
 *             - error (boolean): true if error happened, false if everything went fine
 *             - message (String): containing a message to user
 */

function evalComment(param,creator) {
   var result = new Object();
   if (!param.text) {
      result.message = "You need at least some text!";
      result.error = true;
   } else {
      var r = new comment();
      r.text = param.text;
      r.title = param.title;
      r.author = user;
      r.createtime = r.modifytime = new Date();
      r.weblog = this.weblog;
      r.story = this.story;
      r.online = 1;
      r.parent = this;
      this.add(r);
      this.weblog.lastupdate = new Date();
      result.message = "Your posting was saved successfully!";
      result.error = false;
   }
   return (result);
}

/**
 * function deletes a comment
 * @param Obj Comment-Object that should be deleted
 * @return String Message indicating success/failure
 */

function deleteComment(currComment) {
   if (this.remove(currComment))
      return ("The comment was deleted successfully!");
   else
      return ("Couldn't delete the comment!");
}

/**
 * function checks if the text of the comment was already cached
 * and if it's still valid
 * if true, it returns the cached version
 * if false, it caches it again
 * @return String cached text of comment
 */

function getText() {
   if (this.cache.lrText <= this.modifytime) {
      // cached version of text is too old, so we cache it again
      var s = createSkin(format(activateLinks(this.text)));
      this.allowTextMacros(s);
      this.cache.lrText = new Date();
      this.cache.rText = this.renderSkinAsString(s);
   }
   return (doWikiStuff(this.cache.rText));
}