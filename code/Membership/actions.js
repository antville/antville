/**
 * edit action
 */
function edit_action() {
   if (req.data.cancel)
      res.redirect(this._parent.href());
   else if (req.data.save) {
      try {
         res.message = this.updateMembership(parseInt(req.data.level, 10), session.user);
         res.redirect(this._parent.href());
      } catch (err) {
         res.message = err.toString();
      }
   }
   
   res.data.action = this.href(req.action);
   res.data.title = getMessage("membership.editTitle", {userName: this.username});
   res.data.body = this.renderSkinAsString("edit");
   this.site.renderSkin("page");
   return;
}

/**
 * delete action
 */
function delete_action() {
   if (req.data.cancel)
      res.redirect(this._parent.href());
   else if (req.data.remove) {
      try {
         var url = this._parent.href();
         res.message = this._parent.deleteMembership(this);
         res.redirect(url);
      } catch (err) {
         res.message = err.toString();
      }
   }
   
   res.data.action = this.href(req.action);
   res.data.title = getMessage("membership.deleteTitle", {userName: this.username});
   var skinParam = {
      description: getMessage("membership.deleteDescription"),
      detail: this.username
   };
   res.data.body = this.renderSkinAsString("delete", skinParam);
   this.site.renderSkin("page");
   return;
}

/**
 * send an e-mail to the user owning this membership
 */
function mailto_action() {
   if (req.data.cancel)
      res.redirect(this._parent.href());
   else if (req.data.send) {
      if (req.data.text) {
         try {
            var mailbody = this.renderSkinAsString("mailmessage", {text: req.data.text});
            res.message = sendMail(session.user.email, 
                                   this.user.email, 
                                   getMessage("mail.toUser", root.sys_title),
                                   mailbody);
            res.redirect(this._parent.href());
         } catch (err) {
            res.message = err.toString();
         }
      } else {
         res.message = new Exception("mailTextMissing");
      }
   }
   
   res.data.action = this.href(req.action);
   res.data.title = getMessage("membership.sendEmailTitle", {userName: this.username});
   res.data.body = this.renderSkinAsString("mailto");
   this.site.renderSkin("page");
   return;
}
