/**
 * check if a story is online or offline
 * and render the listitem view accordingly
 * @param Object story object to render
 */
function renderManagerView(story) {
   var sp = {story: story.renderSkinAsString("mgrlistitem")};
   this.renderSkin(story.online == 0 ? "offlinestory" : "onlinestory", sp);
   return;
}