/**
 * macro renders the title of a poll
 * (either as text, link or editor)
 */

function title_macro(param) {
   if (!this.title && !param.as)
      return;
   if (param.as == "editor") {
      var param2 = this.createInputParam("title", param);
      if (req.data.title)
         param2.value = req.data.title;
      else
         param2.value = this.title;
      renderInputText(param2);
   }
   else if (param.as == "link") {
      openLink(this.href());
      if (this.title)
         res.write(this.title);
      closeLink();
   }
   else
      res.write(this.title);
}


/**
 * macro renders a poll's question
 * (either as text or editor)
 */

function question_macro(param) {
   if (param.as == "editor") {
      var param2 = this.createInputParam("question", param);
      if (req.data.question)
         param2.value = req.data.question;
      else
         param2.value = this.question;
      renderInputTextarea(param2);
   }
   else
      res.write(this.question);
}


/**
 * macro renders one choice of a poll
 * (either as text or as editor)
 */

function choices_macro(param) {
   if (param.as == "editor") {
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
         renderInputText(param2);
      }
   }
   else {
      var vote;
      if (session.user && this.votes.get(session.user.name))
         vote = this.votes.get(session.user.name).choice;
      for (var i=0; i<this.size(); i++) {
         var choice = this.get(i);
         param.name = "choice";
         param.title = choice.title;
         param.value = choice._id;
         param.checked = "";
         if (choice == vote)
            param.checked = " checked=\"checked\"";
         res.write(choice.renderSkinAsString("main", param));
      }
   }
}


/**
 * macro renders results of a poll as bar chart
 */

function results_macro(param2) {
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
         if (param.count == 1)
            param.text = " " + (param2.one ? param2.one : "vote");
         else
            param.text = " " + (param2.more ? param2.more : "votes");
      }
      else
         param.text = " " + (param2.no ? param2.no : "votes");
      str += c.renderSkinAsString("result", param);
   }
   return(str);
}


/**
 * macro renders totals of a poll
 */

function total_macro(param) {
   var n = this.votes.size();
   if (n == 0) {
      n += " " + (param.no ? param.no : "votes");
   }
   else if (n == 1) {
      n += " " + (param.one ? param.one : "vote");
   }
   else {
      n += " " + (param.more ? param.more : "votes");
   }
   return(n);
}


/**
 * macro renders the time a poll was modified
 */

function modifytime_macro(param) {
   if (this.modifytime) {
      res.write(formatTimestamp(this.modifytime,param.format));
   }
}


/**
 * macro renders a link to the poll editor
 */

function editlink_macro(param) {
   if (!this.isEditDenied(session.user)) {
      openLink(this.href("edit"));
      res.write(param.text ? param.text : "edit");
      closeLink();
   }
}


/**
 * macro rendering a link to delete a poll
 * (only if the user also is the creator)
 */

function deletelink_macro(param) {
   if (!this.isDeleteDenied(session.user)) {
      openLink(this.href("delete"));
      res.write(param.text ? param.text : "delete");
      closeLink();
   }
}


/**
 * macro renders a link to the poll
 */

function viewlink_macro(param) {
   if (this.isViewDenied(session.user))
     return;
   if (this.closed || this.isVoteDenied(session.user)) {
      var url = this.href("results");
      var str = "view";
   }
   else {
      var url = this.href("main");
      var str = "vote";
   }
   openLink(url);
   res.write(param.text ? param.text : str);
   closeLink();
}


/**
 * macro renders a link as switch to close/re-open a poll
 */

function closelink_macro(param) {
   if (!this.isDeleteDenied(session.user)) {
      var str = this.closed ? "re-open" : "close";
      openLink(this.href("toggle"));
      res.write(param.text ? param.text : str);
      closeLink();
   }
}


/**
 * macro renders the state (open/closed) of a poll
 */

function state_macro(param) {
   if (this.closed) {
      return(param.text + formatTimestamp(this.modifytime, param.format));
   }
}


/**
 * macro renders some details about the poll
 */

function info_macro(param) {
   if (this.creator)
      return(this.renderSkinAsString("info"));
}
