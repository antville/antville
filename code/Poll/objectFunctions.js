function isOnline() {
   if (parseInt(this.online,10))
      return true;
   return false;
}


function evalPoll(param, creator) {
   var result;
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
				newChoice.poll = this;
				newChoice.title = title;
				newChoice.createtime = new Date();
				newChoice.modifytime = new Date();
				this.add(newChoice);
			}

      result = getConfirm("pollCreate");
      result.url = path.site.polls.href();
      result.id = this._id;
   } else
      result = getError("pollMissingValues");
   return(result);
}


function evalVote(param, usr) {
	var result;
	if (param.choice) {
		var c = this.get(param.choice);
		var v = session.user ? this.votes.get(session.user.name) : null;
		if (v) {
			v.choice = c;
			v.modifytime = new Date();
		}
		else {
			var v = new vote();
			v.poll = this;
			v.choice = c;
			v.user = session.user;
			v.username = session.user.name;
			v.createtime = new Date();
			v.modifytime = new Date();
			this.votes.add(v);
		}
		result = getConfirm("vote");
	} else
		result = getConfirm("noVote");
	result.url = this.href();
	return(result);
}


function calcPercent(param) {
	var sum = this.votes.size();
	var p = param.count / (sum / 100);
	return(Math.round(p*100)/100);
}
