/**
 * function checks if story is published in site
 * @param Obj story to check
 * @return Boolean true if online, false if not
 */

function isStoryOnline(st) {
   if (parseInt(st.online,10) == 2)
      return true;
   return false;
}

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