/**
 * check if poll is ok. if true, save new poll
 * @param Object the req.data object coming in from the action
 * @param Object the user as creator of the poll
 * @return Object containing the properties
 *                - error (boolean): true if error occured, false otherwise
 *                - message (String): an error or a confirmation message
 *                - url (String): the URL string of the poll
 *                - id (Number): the internal Hop ID of the poll
 */
function evalNewPoll(question, choices, creator) {
   if (!question || !choices || choices.length < 2)
      throw new Exception("pollMissing");
   var newPoll = new poll(question, creator);
   this.add(newPoll);
   for (var i=0; i<choices.length; i++)
      newPoll.add(choices[i]);
   return new Message("pollCreate");
}


/**
 * delete a poll and all its choices and votes
 * @param Object the poll to be removed
 * @return Object containing the properties
 *                - error (boolean): true if error occured, false otherwise
 *                - message (String): an error or a confirmation message
 */
function deletePoll(currPoll) {
   currPoll.deleteAll();
   if (!this.remove(currPoll))
      throw new Exception("pollDelete");
   return new Message("pollDelete");
}


/**
 * set a poll to closed state
 * @param Object the poll to be closed
 * @return Object containing the properties
 *                - error (boolean): true if error occured, false otherwise
 *                - message (String): an error or a confirmation message
 */

function closePoll(currPoll) {
   currPoll.closed = 1;
   return new Message("pollClose");
}
