/**
 * function checks if user has permissions to edit/delete a posting
 */

function checkPermissions(action) {
   if (action == "delete") {
      if (this.weblog.owner != user) {
         res.message = "This is not your weblog, so you can't delete any postings!";
         res.redirect(this.story.href());
      }
      return true;
   } else {
      if (this.author != user) {
         res.message = "Sorry, you're not allowed to edit a posting of somebody else!";
         res.redirect(this.story.href());
      } else if (!this.weblog.hasDiscussions())
         res.redirect(this.story.href());
      return true;
   }
}
