function isOnline() {
   if (parseInt(this.online,10))
      return true;
   return false;
}


function evalPoll(param, creator) {
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
      var online = parseInt(param.online,10);
      var editableby = parseInt(param.editableby,10);
 
      this.title = param.title;
      this.question = param.question;
      this.modifytime = new Date();

			for (var i=this.size(); i>0; i--) {
				var ch = this.get(i-1);
				this.remove(ch);
			}

			for (var i=0; i<param.choice_array.length; i++) {
				var title = param.choice_array[i];
				if (!title)
					continue;
				var newChoice = new choice();
				newChoice.poll = newPoll;
				newChoice.title = title;
				newChoice.createtime = new Date();
				newChoice.modifytime = new Date();
				this.add(newChoice);
			}

      result.url = path.weblog.polls.href();
      result.message = "The poll was updated successfully!";
      result.id = newPoll._id;
      result.error = false;
   }
   else {
      result.message = "Please fill out the form to update the poll.";
      result.error = true;
   }
   return(result);
}


function evalVote(param, usr) {
	var result = new Object();
	result.error = false;
	result.url = this.href();
	if (param.choice) {
		var c = this.get(param.choice);
		var v = this.votes.get(user.uid);
		if (v) {
			v.choice = c;
			v.modifytime = new Date();
		}
		else {
			var v = new vote();
			v.poll = this;
			v.choice = c;
			v.user = user;
			v.username = user.uid;
			v.createtime = new Date();
			v.modifytime = new Date();
			this.votes.add(v);
		}
		result.message = "Your vote was registered. You can change your vote until the poll is closed.";
	}
	else
		result.message = "You did not vote, yet. You can vote until the poll is closed.";
	return(result);
}


function calcPercent(param) {
	var sum = this.votes.size();
	var p = param.count / (sum / 100);
	return(Math.round(p*100)/100);
}


function isClosed() {
	return(null);
	return("This poll is closed. Voting is not possible anymore.");
}
