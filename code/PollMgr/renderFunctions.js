/**
 * check if a story is online or offline
 * and render the listitem view accordingly
 * @param Object poll object to render
 */
function renderManagerView(poll) {
   var sp = {poll: poll.renderSkinAsString("listitem")};
   if (poll.closed == 1)
      return this.renderSkinAsString("closedpoll", sp);
   return this.renderSkinAsString("openpoll", sp);
}