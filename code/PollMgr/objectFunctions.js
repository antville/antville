function evalNewPoll(param, creator) {
   var result = new Object();
   var choiceInput = param.choice;
   if (param.choice_array) {
   	 var choiceCnt = 0;
	   for (var i=0; i<param.choice_array.length; i++) {
	   		if (param.choice_array[i]) {
	   		  choiceCnt++;
	   		}
	   }
	 }
   if (param.title && param.question && creator && choiceCnt > 1) {
      result.url = this.href();
      var newPoll = new poll();
      var online = parseInt(param.online,10);
      var editableby = parseInt(param.editableby,10);
 
      newPoll.weblog = this._parent;
      newPoll.title = param.title;
      newPoll.question = param.question;
			newPoll.closed = 0;
      newPoll.creator = creator;
      newPoll.createtime = new Date();
      newPoll.modifytime = new Date();

      this._parent.add(newPoll);

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

      if (newPoll.online) {
         this._parent.lastupdate = newPoll.createtime;
         result.url = newPoll.href();
      } else
         result.url = this.href();
      result.message = "The poll was created successfully!";
      result.id = newPoll._id;
      result.error = false;
   }
   else {
      result.message = "Please fill out the form to create a new poll";
      result.error = true;
   }
   return(result);
}


function deletePoll(currPoll) {
   var result = new Object();
   for (var i=currPoll.size(); i>0; i--) {
   		var ch = currPoll.get(i-1);
   		for (var n=ch.size(); n>0; n--) {
   			var vt = ch.get(i-1);
   			ch.remove(vt);
   		}
   		currPoll.remove(ch);
   }
   currPoll.setParent(this._parent);
   if (this._parent.remove(currPoll)) {
      //this._parent.lastupdate = new Date();
      result.message = "The poll was deleted successfully!";
      result.error = false;
   } else {
      result.message = "Ooops! Couldn't delete the poll!";
      result.error = true;
   }
   return (result);
}


function closePoll(currPoll) {
   var result = new Object();
   currPoll.closed = 1;
   result.message = "The poll successfully was closed.";
   result.error = false;
   return(result);
}
