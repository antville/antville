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

function evalNewPoll(param, creator) {
   var result;
   var choiceInput = param.choice;
   if (param.choice_array) {
       var choiceCnt = 0;
      for (var i=0; i<param.choice_array.length; i++) {
         if (param.choice_array[i])
            choiceCnt++;
      }
   }
   if (param.question && creator && choiceCnt > 1) {
      var newPoll = new poll();
      newPoll.site = this._parent;
      newPoll.question = param.question;
      newPoll.closed = 0;
      newPoll.creator = creator;
      newPoll.createtime = new Date();
      newPoll.modifytime = new Date();

      this.add(newPoll);
      for (var i=0; i<param.choice_array.length; i++) {
         var title = param.choice_array[i];
         if (!title)
            continue;
         var newChoice = new choice();
         newChoice.poll = newPoll;
         newChoice.title = title;
         newChoice.createtime = new Date();
         newChoice.modifytime = new Date();
         newPoll.add(newChoice);
      }
      result = getConfirm("pollCreate");
      result.error = false;
   } else
      result = getError("pollMissing");
   return(result);
}


/**
 * delete a poll and all its choices and votes
 * @param Object the poll to be removed
 * @return Object containing the properties
 *                - error (boolean): true if error occured, false otherwise
 *                - message (String): an error or a confirmation message
 */

function deletePoll(currPoll) {
   var result;
   for (var i=currPoll.size(); i>0; i--) {
      var ch = currPoll.get(i-1);
      for (var n=ch.size(); n>0; n--) {
         var vt = ch.get(n-1);
         ch.remove(vt);
      }
      currPoll.remove(ch);
   }
   currPoll.setParent(this._parent);
   if (this._parent.remove(currPoll))
      result = getConfirm("pollDelete");
   else
      result = getError("pollDelete");
   return (result);
}


/**
 * set a poll to closed state
 * @param Object the poll to be closed
 * @return Object containing the properties
 *                - error (boolean): true if error occured, false otherwise
 *                - message (String): an error or a confirmation message
 */

function closePoll(currPoll) {
   var result;
   currPoll.closed = 1;
   result = getConfirm("pollClose");
   return(result);
}
