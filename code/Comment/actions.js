/**
 * main action
 */
function main_action() {
   // since comments don't have their own page, we redirect to
   // story together with an anchor to this comment
   res.redirect(this.story.href() + "#" + this._id);
   return;
}

/**
 * comment action
 */
function comment_action() {
   // restore any rescued text
   if (session.data.rescuedText)
      restoreRescuedText();
   
   if (req.data.cancel)
      res.redirect(this.story.href());
   else if (req.data.save) {
      try {
         var result = this.evalComment(req.data, session.user);
         res.message = result.toString();
         res.redirect(this.story.href() + "#" + result.id);
      } catch (err) {
         res.message = err.toString();
      }
   }
   
   res.data.action = this.href(req.action);
   res.data.title = this.site.title;
   if (this.story.title)
      res.data.title += " - " + encode(this.story.title);
   res.data.body = this.renderSkinAsString("toplevel");
   res.data.action = this.href("comment");
   res.data.body += (new comment()).renderSkinAsString("edit");
   this.site.renderSkin("page");
   return;
}

/**
 * edit action
 */
function edit_action() {
   // restore any rescued text
   if (session.data.rescuedText)
      restoreRescuedText();
   
   if (req.data.cancel)
      res.redirect(this.story.href());
   else if (req.data.save) {
      try {
         res.message = this.updateComment(req.data);
         res.redirect(this.story.href() + "#" + this._id);
      } catch (err) {
         res.message = err.toString();
      }
   }
   
   res.data.action = this.href(req.action);
   res.data.title = this.site.title;
   if (this.story.title)
      res.data.title += " - " + encode(this.story.title);
   res.data.body = this.renderSkinAsString("edit");
   this.site.renderSkin("page");
   return;
}

/**
 * delete action
 */
function delete_action() {
   if (req.data.cancel)
      res.redirect(this.story.href());
   else if (req.data.remove) {
      try {
         var url = this.story.href();
         res.message = this.story.deleteComment(this);
         res.redirect(url);
      } catch (err) {
         res.message = err.toString();
      }
   }
   
   res.data.action = this.href(req.action);
   res.data.title = this.site.title;
   var skinParam = {
      description: getMessage("comment.deleteDescription"),
      detail: this.creator.name
   };
   res.data.body = this.renderSkinAsString("delete", skinParam);
   this.site.renderSkin("page");
   return;
}
