/**
 * function checks if story fits to the minimal needs (must have at least a text ;-)
 * @param Obj story-object to work on
 * @param Obj Object containing the properties needed for creating a new Story
 * @param Obj User-Object creating this story
 * @return Obj Object containing three properties:
 *             - error (boolean): true if error happened, false if everything went fine
 *             - message (String): containing a message to user
 *             - story (Obj): story-object containing assigned form-values
 *             - id (Int): id of created story
 */

function evalNewStory(param, creator) {
   var s = new Story(creator, param.http_remotehost);
   // collect content
   var content = extractContent(param);
   // if all story parts are null, return with error-message
   if (!content.exists)
      throw new Exception("textMissing");
   s.setContent(content.value);
   // let's keep the title property
   s.title = content.value.title;
   // check if the create date is set in the param object
   if (param.createtime) {
      try {
         s.createtime = param.createtime.toDate("yyyy-MM-dd HH:mm", this._parent.getTimeZone());
      } catch (error) {
         throw new Exception("timestampParse", param.createtime);
      }
   }
   s.editableby = !isNaN(parseInt(param.editableby, 10)) ?
                  parseInt(param.editableby, 10) : EDITABLEBY_ADMINS;
   s.discussions = param.discussions ? 1 : 0;
   // create day of story with respect to site-timezone
   s.day = formatTimestamp(s.createtime, "yyyyMMdd");

   // check name of topic (if specified)
   if (param.topic) {
       // FIXME: this should be solved more elegantly
      if (String.URLPATTERN.test(param.topic))
         throw new Exception("topicNoSpecialChars");
      if (this._parent.topics[param.topic] || this._parent.topics[param.topic + "_action"])
         throw new Exception("topicReservedWord");
      s.topic = param.topic;
   } else if (param.addToTopic)
      s.topic = param.addToTopic;
   // check the online-status of the story
   if (param.publish)
      s.online = param.addToFront ? 2 : 1;
   else
      s.online = 0;
   // store the story
   if (!this.add(s))
      throw new Exception("storyCreate");
   // send e-mail notification
   if (s.site.isNotificationEnabled()) 
      s.site.sendNotification("create", s);
   var result = new Message("storyCreate", null, s);
   result.id = s._id;
   if (s.online) {
      s.site.lastupdate = s.modifytime;
      result.url = s.href();
   } else
      result.url = this.href();
   return result;
}


/**
 * delete a story
 * including all the comments
 * @param Obj Story-Object that should be deleted
 * @return Obj Object containing two properties:
 *             - error (boolean): true if error happened, false if everything went fine
 *             - message (String): containing a message to user
 */
function deleteStory(storyObj) {
   storyObj.deleteAll();
   if (storyObj.online > 0)
      this._parent.lastupdate = new Date();
   storyObj.remove();
   return new Message("storyDelete");
}

/**
 * function loops over all stories and removes them (including their comments!)
 * @return Boolean true in any case
 */
function deleteAll() {
   for (var i=this.size();i>0;i--)
      this.deleteStory(this.get(i-1));
   return true;
}
