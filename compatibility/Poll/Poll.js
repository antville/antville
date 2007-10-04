Poll.prototype.choices_macro = function(param) {
   var vote;
   if (session.user && this.votes.get(session.user.name))
      vote = this.votes.get(session.user.name).choice;
   for (var i=0; i<this.size(); i++) {
      var choice = this.get(i);
      param.name = "choice";
      param.title = renderSkinAsString(createSkin(choice.title));
      param.value = choice._id;
      param.checked = "";
      if (choice == vote)
         param.checked = " checked=\"checked\"";
      res.write(choice.renderSkinAsString("main", param));
   }
   return;
};

Poll.prototype.total_macro = function(param) {
   var n = this.votes.size();
   if (n == 0)
      n += " " + (param.no ? param.no : getMessage("Poll.votes.no"));
   else if (n == 1)
      n += " " + (param.one ? param.one : getMessage("Poll.votes.one"));
   else
      n += " " + (param.more ? param.more : getMessage("Poll.votes.more"));
   return n;
};

Poll.prototype.toggle_action = function() {
   var closed = !this.closed;
   this.closed = closed ? 1 : 0;
   this.modifytime = new Date();
   res.redirect(this._parent.href());
   return;
};

Poll.prototype.question_macro = function(param) {
   if (param.as == "editor")
      Html.textArea(this.createInputParam("question", param));
   else
      res.write(this.question);
   return;
};
   
Poll.prototype.closetime_macro = function(param, format) {
   formar || (format = param.format);
   return this.closed_macro(param, format);
};

Poll.prototype.results_macro = function() {
   this.forEach(function() {
      this.renderSkin()
   });
   for (var i=0; i<this.size(); i++) {
      var c = this.get(i);
      var param = new Object();
      param.title = c.title;
      param.count = c.size();
      param.percent = 0;
      if (param.count > 0) {
         param.percent = param.count.toPercent(this.votes.size());
         param.width = Math.round(param.percent * 2.5);
         param.graph = c.renderSkinAsString("graph", param);
         if (param.count == 1)
            param.text = " " + (param2.one ? param2.one : getMessage("Poll.votes.one"));
         else
            param.text = " " + (param2.more ? param2.more : getMessage("Poll.votes.more"));
      } else
         param.text = " " + (param2.no ? param2.no : getMessage("Poll.votes.no"));
      c.renderSkin("result", param);
   }
   return;
};

Poll.prototype.editlink_macro = function(param) {
   if (session.user) {
      try {
         this.checkEdit(session.user, res.data.memberlevel);
      } catch (deny) {
         return;
      }
      Html.link({href: this.href("edit")},
                param.text ? param.text : getMessage("generic.edit"));
   }
   return;
};

Poll.prototype.deletelink_macro = function(param) {
   if (session.user) {
      try {
         this.checkDelete(session.user, res.data.memberlevel);
      } catch (deny) {
         return;
      }
      Html.link({href: this.href("delete")},
                param.text ? param.text : getMessage("generic.delete"));
   }
   return;
};

Poll.prototype.viewlink_macro = function(param) {
   try {
      if (!this.closed) {
         this.checkVote(session.user, res.data.memberlevel);
         Html.link({href: this.href()},
                   param.text ? param.text : getMessage("Poll.vote"));
      }
   } catch (deny) {
      return;
   }
   return;
};

Poll.prototype.closelink_macro = function(param) {
   if (session.user) {
      try {
         this.checkDelete(session.user, res.data.memberlevel);
      } catch (deny) {
         return;
      }
      var str = this.closed ? getMessage("Poll.reopen") : getMessage("Poll.close");
      Html.link({href: this.href("toggle")},
                param.text ? param.text : str);
   }
   return;
};
