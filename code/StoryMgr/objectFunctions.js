/**
 * function checks if story fits to the minimal needs (must have at least a text ;-)
 * @param Obj Object containing the properties needed for creating a new story
 * @param Obj User-Object creating this story
 * @return Obj Object containing three properties:
 *             - error (boolean): true if error happened, false if everything went fine
 *             - message (String): containing a message to user
 *             - id (Int): id of created story
 */

function evalNewStory(param,creator) {
   var result = new Object();
   if (param.text && creator) {
      result.url = this.href();
      var newStory = new story();
      newStory.prototype = "story";
      var online = parseInt(param.online,10);
      var editableby = parseInt(param.editableby,10);
      newStory.weblog = this._parent;
      newStory.title = param.title;
      newStory.text = param.text;
      if (param.newtopic)
         newStory.topic = param.newtopic;
      else if (parseInt(param.topic,10) > 0)
         newStory.topic = this._parent.space.get(parseInt(param.topic,10) -1).groupname;
      if (isNaN(online) || (online == 1 && !newStory.topic))
         newStory.online = 0;
      else
         newStory.online = online;
      newStory.editableby = !isNaN(editableby) ? editableby : 2;
      newStory.author = creator;
      newStory.createtime = new Date();
      newStory.modifytime = new Date();
      newStory.day = newStory.createtime.format("yyyyMMdd");
      newStory.ipaddress = param.http_remotehost;
      newStory.reads = 0;
      this._parent.add(newStory);
      if (newStory.online) {
         this._parent.lastupdate = newStory.createtime;
         if (newStory.topic)
            result.url = this._parent.space.href() + escape(newStory.topic);
         else
            result.url = newStory.href();
      } else
         result.url = this.href();
      result.message = "The story was created successfully!";
      result.id = newStory._id;
      result.error = false;
   } else {
      result.message = "Please fill out the form to create a new story";
      result.error = true;
   }
   return (result);
}


/**
 * delete a story
 * including all the comments
 * @param Obj Story-Object that should be deleted
 * @return Obj Object containing two properties:
 *             - error (boolean): true if error happened, false if everything went fine
 *             - message (String): containing a message to user
 */

function deleteStory(currStory) {
   var result = new Object();
   for (var i=currStory.size();i>0;i--)
      currStory.deleteComment(currStory.get(i-1));
   currStory.setParent(this._parent);
   if (this._parent.remove(currStory)) {
      this._parent.lastupdate = new Date();
      result.message = "The story was deleted successfully!";
      result.error = false;
   } else {
      result.message = "Ooops! Couldn't delete the story!";
      result.error = true;
   }
   return (result);
}
