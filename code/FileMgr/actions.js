/**
 * main action
 */
function main_action() {
   this.renderFilelist(parseInt(req.data.start, 10));
   res.data.title = "Files of " + this._parent.title;
   res.data.body = this.renderSkinAsString("main");
   this._parent.renderSkin("page");
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
}