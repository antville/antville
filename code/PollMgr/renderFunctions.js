/**
 * check if a story is online or offline
 * and render the listitem view accordingly
 * @param Object poll object to render
 */
function renderManagerView(poll) {
   var sp = {poll: poll.renderSkinAsString("mgrlistitem")};
   this.renderSkin(poll.closed == 1 ? "closedpoll" : "openpoll", sp);
   return;
}