function title_macro(param) {
   if (!this.title && !param.as)
      return;
   res.write(param.prefix);
   if (param.as == "editor") {
   		var param2 = this.createInputParam("title", param);
   		if (req.data.title)
   			param2.value = req.data.title;
   		else
   			param2.value = this.title;
      this.renderInputText(param2);
   }
   else if (param.as == "link") {
      var linkParam = new Object();
      linkParam.linkto = "main";
      this.openLink(linkParam);
      if (this.title)
         res.write(this.title);
      this.closeLink();
   } else
      res.write(this.title);
   res.write(param.suffix);
}


function question_macro(param) {
   res.write(param.prefix);
   if (param.as == "editor") {
   		var param2 = this.createInputParam("question", param);
   		if (req.data.question)
   			param2.value = req.data.question;
   		else
   			param2.value = this.question;
      this.renderInputTextarea(param2);
   }
   else
      res.write(this.question);
   res.write(param.suffix);
}


function choices_macro(param) {
	if (param.as == "editor") {
		var re = new RegExp("<cnt>");
		var max = res.data.choices;
		for (var i=0; i<max; i++) {
			res.write(param.prefix.replace(re, i+1));
			var param2 = this.createInputParam("choice", param);
			if (req.data.choice) {
				if (req.data.choice_array) {
					if (req.data.choice_array.length > i)
						param2.value = req.data.choice_array[i];
				}
				else
					param2.value = req.data.choice;
			}
 	   	this.renderInputText(param2);
			res.write(param.suffix);
			res.write("\n");
		}
	}
	else {
		var chosen = -1;
		var v = this.votes.get(user.uid);
		if (v)
			chosen = v.choice._id;
		for (var i=0; i<this.size(); i++) {
			var c = this.get(i);
			param.name = "choice";
			param.title = c.title;
			param.value = c._id;
			if (c._id == chosen)
				param.checked = " checked";
			else
				param.checked = "";
			res.write(param.prefix);
			res.write(c.renderSkinAsString("main", param));
			res.write(param.suffix);
			res.write("\n");
		}
	}
}


function results_macro() {
	var str = "";
	for (var i=0; i<this.size(); i++) {
		var c = this.get(i);
		var param = new Object();
		param.title = c.title;
		param.count = c.size();
		param.percent = 0;
		if (param.count > 0) {
			param.percent = this.calcPercent(param);
			param.width = Math.round(param.percent * 2.5);
			param.graph = c.renderSkinAsString("graph", param);
		}
		str += c.renderSkinAsString("result", param);
	}
	return(str);
}


function total_macro() {
	return(this.votes.size());
}


function creator_macro(param) {
   if (!this.creator)
      return;
   res.write(param.prefix);
   if (param.as == "link" && this.creator.url) {
      var linkParam = new Object();
      linkParam.to = this.creator.url;
      this.openLink(linkParam);
      res.write(this.creator.name);
      this.closeLink();
   } else
      res.write(this.creator.name);
   res.write(param.suffix);
}


function createtime_macro(param) {
   if (!this.createtime)
      return;
   res.write(param.prefix);
   res.write(this.weblog.formatTimestamp(this.createtime,param));
   res.write(param.suffix);
}


function modifytime_macro(param) {
   if (this.modifytime) {
      res.write(param.prefix);
      res.write(this.weblog.formatTimestamp(this.modifytime,param));
      res.write(param.suffix);
   }
}


function editlink_macro(param) {
   if (!this.isEditDenied(user)) {
      res.write(param.prefix);
      var linkParam = new Object();
      linkParam.linkto = "edit";
      this.openLink(linkParam);
      if (param.image && this.weblog.images.get(param.image))
         this.weblog.renderImage(this.weblog.images.get(param.image),param);
      else
         res.write(param.text ? param.text : "edit");
      this.closeLink();
      res.write(param.suffix);
   }
}

/**
 * macro rendering a link to delete
 * if user is author of this poll
 */

function deletelink_macro(param) {
   if (!this.isDeleteDenied(user)) {
      res.write(param.prefix);
      var linkParam = new Object();
      linkParam.linkto = "delete";
      this.openLink(linkParam);
      if (param.image && this.weblog.images.get(param.image))
         this.weblog.renderImage(this.weblog.images.get(param.image),param);
      else
         res.write(param.text ? param.text : "delete");
      this.closeLink();
      res.write(param.suffix);
   }
}


/**
 * macro renders a link to the poll
 */

function viewlink_macro(param) {
   if (this.isViewDenied(user))
     return;
   res.write(param.prefix);
   var linkParam = new Object();
   if (this.closed || this.isVoteDenied(user)) {
   		linkParam.linkto = "results";
   		var str = "view";
   }
   else {
		  linkParam.linkto = "main";
		  var str = "vote";
	 }
   this.openLink(linkParam);
   if (param.image && this.weblog.images.get(param.image))
      this.weblog.renderImage(this.weblog.images.get(param.image),param);
   else
      res.write(param.text ? param.text : str);
   this.closeLink();
   res.write(param.suffix);
}


function closelink_macro(param) {
   if (!this.isDeleteDenied(user)) {
      res.write(param.prefix);
      var linkParam = new Object();
	    linkParam.linkto = "toggle";
      if (this.closed)
				var str = "re-open";
			else
		    var str = "close";
      this.openLink(linkParam);
      if (param.image && this.weblog.images.get(param.image))
         this.weblog.renderImage(this.weblog.images.get(param.image),param);
      else
         res.write(param.text ? param.text : str);
      this.closeLink();
      res.write(param.suffix);
   }
}


function state_macro(param) {
	if (this.closed) {
		return(param.text + this.weblog.formatTimestamp(this.modifytime, param));
	}
}
