/**
 * macro counts
 */

function sysmgr_count_macro(param) {
   if (!param || !param.what)
      return;
   // this macro is allowed just for sysadmins
   if (!isUserSysAdmin())
      return;
   if (param.what == "stories")
      res.write(this.allstories.size());
   else if (param.what == "comments")
      res.write(this.allcontent.size() - this.allstories.size());
   else if (param.what == "images")
      res.write(this.images.size());
   else if (param.what == "files")
      res.write(this.files.size());
}

/**
 * function renders the statusflags for this site
 */

function sysmgr_statusflags_macro(param) {
   // this macro is allowed just for sysadmins
   if (!isUserSysAdmin())
      return;
   if (this.trusted)
      res.write("<span class=\"flagltgreen\" nowrap>TRUSTED</span>");
   if (!this.online)
      res.write("<span class=\"flagred\" nowrap>PRIVATE</span>");
   else
      res.write("<span class=\"flagdkgreen\" nowrap>PUBLIC</span>");      
   if (this.blocked)
      res.write("<span class=\"flagblack\" nowrap>BLOCKED</span>");
}

/**
 * function renders an edit-link
 */

function sysmgr_editlink_macro(param) {
   // this macro is allowed just for sysadmins
   if (!isUserSysAdmin() || req.data.item == this.alias)
      return;
   param.linkto = "sites";
   param.urlparam = "item=" + this.alias + "&action=edit";
   if (req.data.page)
      param.urlparam += "&page=" + req.data.page;
   param.anchor = this.alias;
   openMarkupElement("a",root.manage.createLinkParam(param));
   res.write(param.text ? param.text : "edit");
   closeMarkupElement("a");
}

/**
 * function renders a delete-link
 */

function sysmgr_deletelink_macro(param) {
   // this macro is allowed just for sysadmins
   if (!isUserSysAdmin() || req.data.item == this.alias)
      return;
   param.linkto = "sites";
   param.urlparam = "item=" + this.alias + "&action=remove";
   if (req.data.page)
      param.urlparam += "&page=" + req.data.page;
   param.anchor = this.alias;
   openMarkupElement("a",root.manage.createLinkParam(param));
   res.write(param.text ? param.text : "delete");
   closeLink();
}

/**
 * macro renders the name of the creator of this
 * site as link
 */

function sysmgr_creator_macro(param) {
   // this macro is allowed just for sysadmins
   if (!isUserSysAdmin())
      return;
   res.write(this.creator.name);
}

/**
 * macro renders the trust-state of this site
 */

function sysmgr_trusted_macro(param) {
   // this macro is allowed just for sysadmins
   if (!isUserSysAdmin())
      return;
   if (param.as == "editor") {
      var options = new Array("no","yes");
      renderDropDownBox("trusted",options,this.trusted);
   } else
      res.write(this.trusted ? "yes" : "no");
}

/**
 * macro renders the block-state of this site
 */

function sysmgr_blocked_macro(param) {
   // this macro is allowed just for sysadmins
   if (!isUserSysAdmin())
      return;
   if (param.as == "editor") {
      var options = new Array("no","yes");
      renderDropDownBox("blocked",options,this.blocked);
   } else
      res.write(this.blocked ? "yes" : "no");
}
