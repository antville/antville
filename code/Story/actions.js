/**
 * main action
 */
function main_action() {
   res.data.title = this.site.title;
   var storytitle = this.getRenderedContentPart("title");
   if (storytitle)
      res.data.title += ": " + stripTags(storytitle);
   res.data.body = this.renderSkinAsString("main");
   this.site.renderSkin("page");
   // increment read-counter
   this.incrementReadCounter();
   logAccess();
   return;
}

/**
 * edit action
 */
function edit_action() {
   // restore any rescued text
   if (session.data.rescuedText)
      restoreRescuedText();
   
   if (req.data.set) {
      this.toggleOnline(req.data.set);
      if (req.data.http_referer)
         res.redirect(req.data.http_referer);
      res.redirect(this.site.stories.href());
   } else if (req.data.cancel) {
      res.redirect(this.online ? this.href() : this.site.stories.href());
   } else if (req.data.save || req.data.publish) {
      try {
         var result = this.evalStory(req.data, session.user);
         res.message = result.toString();
         res.redirect(result.url);
      } catch (err) {
         res.message = err.toString();
      }
   }
   
   res.data.action = this.href(req.action);
   res.data.title = "Edit story";
   if (this.title)
      res.data.title += ": " + encode(this.title);
   res.data.body = this.renderSkinAsString("edit");
   this.site.renderSkin("page");
   return;
}

/**
 * delete action
 */
function delete_action() {
   if (req.data.cancel)
      res.redirect(this.site.stories.href());
   else if (req.data.remove) {
      try {
         res.message = this.site.stories.deleteStory(this);
         res.redirect(this.site.stories.href());
      } catch (err) {
         res.message = err.toString();
      }
   }
   
   res.data.action = this.href(req.action);
   res.data.title = "Delete story";
   if (this.title)
      res.data.title += ": " + encode(this.title);

   if (this.title)
      var skinParam = {
         description: "the story",
         detail: this.title
      };
   else
      var skinParam = {description: "a story"};
   res.data.body = this.renderSkinAsString("delete", skinParam);
   this.site.renderSkin("page");
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
      res.redirect(this.href());
   else if (req.data.save) {
      try {
         var result = this.evalComment(req.data, session.user);
         res.message = result.toString();
         res.redirect(this.href() + "#" + result.id);
      } catch (err) {
         res.message = err.toString();
      }
   }
   
   res.data.action = this.href(req.action);
   res.data.title = this.site.title;
   if (this.title)
      res.data.title += " - " + encode(this.title);
   res.data.body = this.renderSkinAsString("comment");
   this.site.renderSkin("page");
   // increment read-counter
   this.incrementReadCounter();
   return;
}
