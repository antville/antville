/**
 * check if a story is online or offline
 * and render the listitem view accordingly
 * @param Object poll object to render
 */
function renderManagerView(poll) {
   poll.renderSkin(poll.closed == 1 ? "closed" : "open");
   return;
}