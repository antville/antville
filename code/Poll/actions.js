/**
 * main action
 */
function main_action() {
   if (req.data.cancel)
      res.redirect(this.href());
   else if (req.data.vote) {
      if (!session.user)
         checkIfLoggedIn(this.href());
      try {
         res.message = this.evalVote(req.data, session.user);
         res.redirect(this.href("results"));
      } catch (err) {
         res.message = err.toString();
      }
   }
   res.data.action = this.href();
   res.data.title = "Vote poll: " + this.question;
   res.data.body = this.renderSkinAsString("main");
   this.site.renderSkin("page");
   return;
}

/**
 * edit action
 */
function edit_action() {
   // pre-process submitted choices
   var arr = new Array();
   if (req.data.title_array) {
      for (var i=0;i<req.data.title_array.length;i++) {
         var title = req.data.title_array[i].trim();
         if (title)
            arr[arr.length] = new choice(title);
      }
   } else if (req.data.title) {
      var title = req.data.title.trim();
      if (title)
         arr[0] = new choice(title);
   } else
      arr = this.list();

   if (req.data.cancel) {
      res.redirect(this.href());
   } else if (req.data.save) {
      try {
         res.message = this.evalPoll(req.data.question, arr, session.user);
         res.redirect(this.site.polls.href());
      } catch (err) {
         res.message = err.toString();
      }
   } else if (req.data.addchoice)
   	arr.push(new choice(""));
   
   res.push();
   var max = Math.max(2, arr.length);
   for (var i=0;i<max;i++) {
      var c = arr[i] != null ? arr[i] : new choice("");
    	c.renderSkin("edit", {count: (i+1).toString()});
   }
   res.data.choices = res.pop();
   res.data.action = this.href(req.action);
   res.data.title = "Edit poll: " + this.question;
   res.data.body = this.renderSkinAsString("edit");
   this.site.renderSkin("page");
   return;
}

/**
 * delete action
 */
function delete_action() {
   var url = this._parent.href();
   if (req.data.cancel)
      res.redirect(url);
   else if (req.data.remove) {
      try {
         res.message = this.site.polls.deletePoll(this);
         res.redirect(url);
      } catch (err) {
         res.message = err.toString();
      }
   }
   
   res.data.action = this.href(req.action);
   res.data.title = "Delete poll: " + this.question;
   var skinParam = {
      description: "the poll",
      detail: this.question
   };
   res.data.body = this.renderSkinAsString("delete", skinParam);
   this.site.renderSkin("page");
   return;
}

/**
 * action renders the current result of a poll
 */
function results_action() {
   res.data.title = "View poll: " + this.question;
   res.data.body = this.renderSkinAsString("results");
   this.site.renderSkin("page");
   return;
}

/**
 * action toggles poll between closed and open
 */
function toggle_action() {
   var closed = !this.closed;
   this.closed = closed ? 1 : 0;
   this.modifytime = new Date();
   res.redirect(this._parent.href());
   return;
}
