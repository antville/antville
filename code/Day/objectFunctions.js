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