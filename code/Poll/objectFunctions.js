/**
 * constructor function for poll objects
 */
function constructor(question, creator) {
   this.question = question;
   this.creator = creator;
   this.closed = 0;
   this.createtime = this.modifytime = new Date();
   return this;
}


/**
 * check if poll is ok. if true, save modified poll
 * @param Object the req.data object coming in from the action
 * @param Object the user as creator of the poll modifications
 * @return Object containing the properties
 *                - error (boolean): true if error occured, false otherwise
 *                - message (String): an error or a confirmation message
 *                - url (String): the URL string of the poll
 *                - id (Number): the internal Hop ID of the poll
 */
function evalPoll(question, choices, creator) {
   if (!question || !choices || choices.length < 2)
      throw new Exception("pollMissingValues");
   this.question = question;
   this.modifytime = new Date();
   for (var i=this.size(); i>0; i--) {
      var c = this.get(i-1);
      this.remove(c);
   }
   for (var i=0;i<choices.length;i++)
      this.add(choices[i]);
   return new Message("pollCreate");
}


/**
 * check if a vote is ok. if true, save modified vote
 * @param Object the req.data object coming in from the action
 * @param Object the voting user object
 * @return Object containing the properties
 *                - error (boolean): true if error occured, false otherwise
 *                - message (String): an error or a confirmation message
 *                - url (String): the URL string of the poll
 */
function evalVote(param, usr) {
   this.checkVote(usr, req.data.memberlevel);
	if (!param.choice)
	   throw new Exception("noVote");
	var c = this.get(param.choice);
	var v = usr ? this.votes.get(usr.name) : null;
	if (v) {
		v.choice = c;
		v.modifytime = new Date();
	} else
		this.votes.add(new vote(c, usr));
	return new Message("vote");
}

/**
 * function loops over the choices of a poll
 * and removes them
 */
function deleteAll() {
   for (var i=this.size();i>0;i--) {
      var c = this.get(i-1);
      c.deleteAll();
      if (!this.remove(c))
         throw new Exception("choiceDelete");
   }
   return true;
}
