/**
 * main action
 */
function main_action() {
   this.renderStorylist(parseInt(req.data.start, 10), req.data.show);
   res.data.title = "Stories of " + this._parent.title;
   res.data.body = this.renderSkinAsString("main");
   this._parent.renderSkin("page");
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
}