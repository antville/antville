/**
 * main action
 */
function main_action() {
   res.data.pollList = renderList(this, "mgrlistitem", 10, req.data.page);
   res.data.pagenavigation = renderPageNavigation(this, this.href(), 10, req.data.page);
   res.data.title = getMessage("Poll.listTitle", {siteTitle: this._parent.title});
   res.data.body = this.renderSkinAsString("main");
   this._parent.renderSkin("page");
   return;
}

/**
 * main action
 */
function open_action() {
   res.data.pollList = renderList(this.open, "mgrlistitem", 10, req.data.page);
   res.data.pagenavigation = renderPageNavigation(this.open, this.href(req.action), 10, req.data.page);
   res.data.title = getMessage("Poll.listOpenPollsTitle", {siteTitle: this._parent.title});
   res.data.body = this.renderSkinAsString("main");
   this._parent.renderSkin("page");
   return;
}

/**
 * main action
 */
function mypolls_action() {
   var ms = this._parent.members.get(session.user.name);
   res.data.pollList = renderList(ms.polls, "mgrlistitem", 10, req.data.page);
   res.data.pagenavigation = renderPageNavigation(ms.polls, this.href(req.action), 10, req.data.page);
   res.data.title = getMessage("Poll.listMyPollsTitle", {siteTitle: this._parent.title});
   res.data.body = this.renderSkinAsString("main");
   this._parent.renderSkin("page");
   return;
}

/**
 * action for creating new Polls
 */
function create_action() {
   // pre-process submitted choices
   var arr = new Array();
   if (req.data.title_array) {
      for (var i=0;i<req.data.title_array.length;i++) {
         var title = req.data.title_array[i].trim();
         if (title)
            arr[arr.length] = new Choice(title);
      }
   } else if (req.data.title && req.data.title.trim()) {
      arr[0] = new Choice(req.data.title.trim());
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
   	arr.push(new Choice(""));

   var newPoll = new Poll();

   res.push();
   var max = Math.max(2, arr.length);
   for (var i=0;i<max;i++) {
      var c = arr[i] ? arr[i] : new Choice("");
    	c.renderSkin("edit", {count: (i+1).toString()});
   }
   res.data.choices = res.pop();
   res.data.action = this.href(req.action);
   res.data.title = getMessage("Poll.addPoll", {siteTitle: this._parent.title});
   res.data.body = newPoll.renderSkinAsString("edit");
   this._parent.renderSkin("page");
   return;
}
