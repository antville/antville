/**
 * macro counts
 */

function sysmgr_count_macro(param) {
   if (!param || !param.what)
      return;
   // this macro is allowed just for sysadmins
   if (!user.isSysAdmin())
      return;
   res.write(param.prefix);
   if (param.what == "stories")
      res.write(this.stories.size());
   else if (param.what == "comments")
      res.write(this.comments.size());
   else if (param.what == "images")
      res.write(this.images.size());
   else if (param.what == "goodies")
      res.write(this.goodies.size());
   res.write(param.suffix);
}

/**
 * function renders the statusflags for this user
 */

function sysmgr_statusflags_macro(param) {
   // this macro is allowed just for sysadmins
   if (!user.isSysAdmin())
      return;
   res.write(param.prefix);
   if (this.isTrusted())
      res.write("<span class=\"flagltgreen\" nowrap>TRUSTED</span>");
   if (this.isSysAdmin())
      res.write("<span class=\"flagdkgreen\" nowrap>SYSADMIN</span>");
   if (this.isBlocked())
      res.write("<span class=\"flagblack\" nowrap>BLOCKED</span>");
   res.write(param.suffix);
}

/**
 * function renders an edit-link
 */

function sysmgr_editlink_macro(param) {
   // this macro is allowed just for sysadmins
   if (!user.isSysAdmin() || req.data.edit == this.name || user == this)
      return;
   res.write(param.prefix);
   var linkParam = new Object();
   linkParam.linkto = "users";
   linkParam.urlparam = "?item=" + this.name;
   linkParam.urlparam += "&action=edit";
   if (req.data.page)
      linkParam.urlparam += "&page=" + req.data.page;
   linkParam.urlparam += "#" + this.name;
   root.manage.openLink(linkParam);
   res.write(param.text ? param.text : "edit");
   this.closeLink();
   res.write(param.suffix);
}

/**
 * macro renders the username as plain text
 */

function sysmgr_username_macro(param) {
   res.write(param.prefix);
   res.write(this.name);
   res.write(param.suffix);
}

/**
 * macro renders the timestamp of registration
 */

function sysmgr_registered_macro(param) {
   // this macro is allowed just for sysadmins
   if (!user.isSysAdmin())
      return;
   res.write(param.prefix);
   fmt=param.format ? param.format : "dd.MM.yyyy HH:mm";
   res.write(this.registered.format(fmt));
   res.write(param.suffix);
}

/**
 * macro renders the timestamp of last visit
 */

function sysmgr_lastvisit_macro(param) {
   // this macro is allowed just for sysadmins
   if (!user.isSysAdmin())
      return;
   res.write(param.prefix);
   if (this.lastvisit) {
      fmt=param.format ? param.format : "dd.MM.yyyy HH:mm";
      res.write(this.lastvisit.format(fmt));
   }
   res.write(param.suffix);
}

/**
 * macro renders the trust-state of this user
 */

function sysmgr_trusted_macro(param) {
   // this macro is allowed just for sysadmins
   if (!user.isSysAdmin())
      return;
   res.write(param.prefix);
   if (param.as == "editor") {
      var options = new Array("no","yes");
      var selectedIndex = parseInt(this.trusted,10);
      res.write(simpleDropDownBox("trusted",options,selectedIndex));
   } else
      res.write(this.isTrusted() ? "yes" : "no");
   res.write(param.suffix);
}

/**
 * macro renders the block-state of this user
 */

function sysmgr_blocked_macro(param) {
   // this macro is allowed just for sysadmins
   if (!user.isSysAdmin())
      return;
   res.write(param.prefix);
   if (param.as == "editor") {
      var options = new Array("no","yes");
      var selectedIndex = parseInt(this.blocked,10);
      res.write(simpleDropDownBox("blocked",options,selectedIndex));
   } else
      res.write(this.isBlocked() ? "yes" : "no");
   res.write(param.suffix);
}

/**
 * macro renders the sysadmin-state of this user
 */

function sysmgr_sysadmin_macro(param) {
   // this macro is allowed just for sysadmins
   if (!user.isSysAdmin())
      return;
   res.write(param.prefix);
   if (param.as == "editor") {
      var options = new Array("no","yes");
      var selectedIndex = parseInt(this.sysadmin,10);
      res.write(simpleDropDownBox("sysadmin",options,selectedIndex));
   } else
      res.write(this.isSysAdmin() ? "yes" : "no");
   res.write(param.suffix);
}