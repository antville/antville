/**
 * main action
 */
function main_action() {
   res.data.pollList = renderList(this, this.renderManagerView, 10, req.data.page);
   res.data.pagenavigation = renderPageNavigation(this, this.href(), 10, req.data.page);
   res.data.title = "All polls of " + this._parent.title;
   res.data.body = this.renderSkinAsString("main");
   this._parent.renderSkin("page");
}

/**
 * main action
 */
function open_action() {
   res.data.pollList = renderList(this.open, this.renderManagerView, 10, req.data.page);
   res.data.pagenavigation = renderPageNavigation(this.open, this.href(req.action), 10, req.data.page);
   res.data.title = "Open polls of " + this._parent.title;
   res.data.body = this.renderSkinAsString("main");
   this._parent.renderSkin("page");
}

/**
 * main action
 */
function mypolls_action() {
   var ms = this._parent.members.get(session.user.name);
   res.data.pollList = renderList(ms.polls, this.renderManagerView, 10, req.data.page);
   res.data.pagenavigation = renderPageNavigation(ms.polls, this.href(req.action), 10, req.data.page);
   res.data.title = "My polls of " + this._parent.title;
   res.data.body = this.renderSkinAsString("main");
   this._parent.renderSkin("page");
}

/**
 * action for creating new polls
 */
function create_action() {
   // pre-process submitted choices
   var arr = new Array();
   if (req.data.title_array) {
      for (var i=0;i<req.data.title_array.length;i++) {
         var title = req.data.title_array[i].trim();
         if (title)
            arr[arr.length] = new choice(title);
      }
   } else if (req.data.title && req.data.title.trim()) {
      arr[0] = new choice(req.data.title.trim());
   }

   if (req.data.cancel) {
      res.redirect(this.href());
   } else if (req.data.save) {
      try {
         res.message = this.evalNewPoll(req.data.question, arr, session.user);
         res.redirect(this.href());
      } catch (err) {
         res.message = err.toString();
      }
   } else if (req.data.addchoice)
   	arr.push(new choice(""));

   var newPoll = new poll();
   var choiceList = new java.lang.StringBuffer();
   var max = Math.max(2, arr.length);
   for (var i=0;i<max;i++) {
      var c = arr[i] ? arr[i] : new choice("");
    	choiceList.append(c.renderSkinAsString("edit", {count: (i+1).toString()} ));
   }
   res.data.choices = choiceList.toString();
   res.data.action = this.href(req.action);
   res.data.title = "Add a poll to " + this._parent.title;
   res.data.body = newPoll.renderSkinAsString("edit");
   this._parent.renderSkin("page");
}