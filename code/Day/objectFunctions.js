/**
 * function deletes all childobjects of a day (recursive!)
 */

function deleteAll() {
   for (var i=this.size();i>0;i--) {
      var story = this.get(i-1);
      story.deleteAll();
      this.remove(story);
   }
   return true;
}

/**
 * Return the groupname of a day-object formatted as
 * date-string to be used in the global linkedpath macro
 * @see hopobject.getNavigationName()
 */
function getNavigationName () {
   return (formatTimestamp(parseTimestamp(this.groupname,"yyyyMMdd"),"EEEE, dd.MM.yyyy"));
}

