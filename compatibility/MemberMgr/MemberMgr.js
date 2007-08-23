MemberMgr.prototype.sendpwd_action = function() {
   res.data.title = gettext("Recover your password");
   res.data.body = gettext("Due to security reasons user passwords are not " +
         "stored in the Antville database any longer. Thus, your password " +
         "cannot be sent to you, either. Please use the password reset option.");
   this._parent.renderSkin("page");
   return;
};

