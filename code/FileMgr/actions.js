/**
 * list all files of a site
 */
function main_action() {
   res.data.filelist = renderList(this, "mgrlistitem", 10, req.data.page);
   res.data.pagenavigation = renderPageNavigation(this, this.href(), 10, req.data.page);
   res.data.title = "Files of " + this._parent.title;
   res.data.body = this.renderSkinAsString("main");
   this._parent.renderSkin("page");
   return;
}

/**
 * list just my files
 */
function myfiles_action() {
   var ms = this._parent.members.get(session.user.name);
   res.data.filelist = renderList(ms.files, "mgrlistitem", 10, req.data.page);
   res.data.pagenavigation = renderPageNavigation(ms.files, this.href(), 10, req.data.page);
   res.data.title = "My files of " + this._parent.title;
   res.data.body = this.renderSkinAsString("main");
   this._parent.renderSkin("page");
   return;
}

/**
 * action for creating new file objects
 */
function create_action() {
   if (req.data.cancel)
      res.redirect(this.href());
   else if (req.data.save) {
      try {
         res.message = this.evalFile(req.data, session.user);
         res.redirect(this.href());
      } catch (err) {
         res.message = err.toString();
      }
   }
   
   res.data.action = this.href(req.action);
   res.data.title = "Add a file to " + this._parent.title;
   res.data.body = this.renderSkinAsString("new");
   this._parent.renderSkin("page");
   return;
}
