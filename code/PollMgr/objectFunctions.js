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
   if (param.title && param.question && creator && choiceCnt > 1) {
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
      if (newPoll.online) {
         this._parent.lastupdate = newPoll.createtime;
         result.url = newPoll.href();
      } else
         result.url = this.href();
      result.id = newPoll._id;
      result.error = false;
   } else
      result = getError("pollMissing");
   return(result);
}


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


function closePoll(currPoll) {
   var result;
   currPoll.closed = 1;
   result = getConfirm("pollClose");
   return(result);
}
