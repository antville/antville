/**
 * function deletes all childobjects of a day (recursive!)
 */

function deleteAll() {
   for (var i=this.size();i>0;i--) {
      var story = this.get(i-1);
      story.deleteAll();
      if (!this._parent.stories.remove(story))
         throw new Exception("storyDelete");
   }
   return true;
}

/**
 * Return the groupname of a day-object formatted as
 * date-string to be used in the global linkedpath macro
 * @see hopobject.getNavigationName()
 */
function getNavigationName () {
   var ts = this.groupname.toDate("yyyyMMdd", this._parent.getTimeZone());
   return formatTimestamp(ts, "EEEE, dd.MM.yyyy");
}

