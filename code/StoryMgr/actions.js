/**
 * main action
 */
function main_action() {
   res.data.storylist = renderList(this, "mgrlistitem", 10, req.data.page);
   res.data.pagenavigation = renderPageNavigation(this, this.href(), 10, req.data.page);
   res.data.title = "Online stories of " + this._parent.title;
   res.data.body = this.renderSkinAsString("main");
   this._parent.renderSkin("page");
   return;
}

function offline_action() {
   res.data.storylist = renderList(this.offline, "mgrlistitem", 10, req.data.start);
   res.data.pagenavigation = renderPageNavigation(this.offline, this.href(req.action), 10, req.data.page);
   res.data.title = "Online stories of " + this._parent.title;
   res.data.body = this.renderSkinAsString("main");
   this._parent.renderSkin("page");
   return;
}

/**
 * list all stories of a user inside the site the
 * membership belongs to
 */
function mystories_action() {
   var ms = this._parent.members.get(session.user.name);
   res.data.storylist = renderList(ms.stories, "mgrlistitem", 10, req.data.page);
   res.data.pagenavigation = renderPageNavigation(ms.stories, this.href(req.action), 10, req.data.page);
   res.data.title = "My stories in " + this._parent.title;
   res.data.body = this.renderSkinAsString("main");
   this._parent.renderSkin("page");
   return;
}

/**
 * action for creating a new story
 */
function create_action() {
   // restore any rescued text
   if (session.data.rescuedText)
      restoreRescuedText();
   
   var s = new story();
   // storing referrer in session-cache in case user clicks cancel later
   if (!session.data.referrer && req.data.http_referer)
      session.data.referrer = req.data.http_referer;
   
   if (req.data.cancel) {
      var url = session.data.referrer ? session.data.referrer : this.href();
      session.data.referrer = null;
      res.redirect(url);
   } else if (req.data.save || req.data.publish) {
      try {
         var result = this.evalNewStory(req.data, session.user);
         res.message = result.toString();
         session.data.referrer = null;
         res.redirect(result.url);
      } catch (err) {
         res.message = err.toString();
      }
   }
   
   res.data.title = "Add a story to " + this._parent.title;
   res.data.action = this.href("create");
   res.data.body = s.renderSkinAsString("edit");
   this._parent.renderSkin("page");
   return;
}
