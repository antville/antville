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
      res.write(this.allstories.size());
   else if (param.what == "comments")
      res.write(this.allcontent.size() - this.allstories.size());
   else if (param.what == "images")
      res.write(this.images.size());
   else if (param.what == "goodies")
      res.write(this.goodies.size());
   res.write(param.suffix);
}

/**
 * function renders the statusflags for this weblog
 */

function sysmgr_statusflags_macro(param) {
   // this macro is allowed just for sysadmins
   if (!user.isSysAdmin())
      return;
   res.write(param.prefix);
   if (this.isTrusted())
      res.write("<span class=\"flagltgreen\" nowrap>TRUSTED</span>");
   if (!parseInt(this.online))
      res.write("<span class=\"flagred\" nowrap>PRIVATE</span>");
   else
      res.write("<span class=\"flagdkgreen\" nowrap>PUBLIC</span>");      
   if (this.isBlocked())
      res.write("<span class=\"flagblack\" nowrap>BLOCKED</span>");
   res.write(param.suffix);
}

/**
 * function renders an edit-link
 */

function sysmgr_editlink_macro(param) {
   // this macro is allowed just for sysadmins
   if (!user.isSysAdmin() || req.data.item == this.alias)
      return;
   res.write(param.prefix);
   var linkParam = new Object();
   linkParam.linkto = "weblogs";
   linkParam.urlparam = "?item=" + this.alias;
   linkParam.urlparam += "&action=edit";
   if (req.data.page)
      linkParam.urlparam += "&page=" + req.data.page;
   linkParam.urlparam += "#" + this.alias;
   root.manage.openLink(linkParam);
   res.write(param.text ? param.text : "edit");
   this.closeLink();
   res.write(param.suffix);
}

/**
 * function renders a delete-link
 */

function sysmgr_deletelink_macro(param) {
   // this macro is allowed just for sysadmins
   if (!user.isSysAdmin() || req.data.item == this.alias)
      return;
   res.write(param.prefix);
   var linkParam = new Object();
   linkParam.linkto = "weblogs";
   linkParam.urlparam = "?item=" + this.alias;
   linkParam.urlparam += "&action=remove";
   if (req.data.page)
      linkParam.urlparam += "&page=" + req.data.page;
   linkParam.urlparam += "#" + this.alias;
   root.manage.openLink(linkParam);
   res.write(param.text ? param.text : "delete");
   this.closeLink();
   res.write(param.suffix);
}

/**
 * macro renders the name of the creator of this
 * weblog as link
 */

function sysmgr_creator_macro(param) {
   // this macro is allowed just for sysadmins
   if (!user.isSysAdmin())
      return;
   res.write(param.prefix);
   res.write(this.creator.name);
   res.write(param.suffix);
}

/**
 * macro renders the trust-state of this weblog
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
 * macro renders the block-state of this weblog
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
