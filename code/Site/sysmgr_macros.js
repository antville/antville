/**
 * macro counts
 */

function sysmgr_count_macro(param) {
   if (!param || !param.what)
      return;
   // this macro is allowed just for sysadmins
   if (!session.user.sysadmin)
      return;
   switch (param.what) {
      case "stories" :
         return this.allstories.size();
      case "comments" :
         return (this.allcontent.size() - this.allstories.size());
      case "images" :
         return this.images.size();
      case "files" :
         return this.files.size();
   }
   return;
}

/**
 * function renders the statusflags for this site
 */

function sysmgr_statusflags_macro(param) {
   // this macro is allowed just for sysadmins
   if (!session.user.sysadmin)
      return;
   if (this.trusted)
      res.write("<span class=\"flagDark\" style=\"background-color:#009900;\">TRUSTED</span>");
   if (!this.online)
      res.write("<span class=\"flagDark\" style=\"background-color:#CC0000;\">PRIVATE</span>");
   else
      res.write("<span class=\"flagDark\" style=\"background-color:#006600;\">PUBLIC</span>");      
   if (this.blocked)
      res.write("<span class=\"flagDark\" style=\"background-color:#000000;\">BLOCKED</span>");
}

/**
 * function renders an edit-link
 */

function sysmgr_editlink_macro(param) {
   // this macro is allowed just for sysadmins
   if (!session.user.sysadmin || req.data.item == this.alias)
      return;
   param.linkto = "sites";
   param.urlparam = "item=" + this.alias + "&action=edit";
   if (req.data.page)
      param.urlparam += "&page=" + req.data.page;
   param.anchor = this.alias;
   Html.openTag("a", root.manage.createLinkParam(param));
   res.write(param.text ? param.text : "edit");
   Html.closeTag("a");
}

/**
 * function renders a delete-link
 */

function sysmgr_deletelink_macro(param) {
   // this macro is allowed just for sysadmins
   if (!session.user.sysadmin || req.data.item == this.alias)
      return;
   param.linkto = "sites";
   param.urlparam = "item=" + this.alias + "&action=remove";
   if (req.data.page)
      param.urlparam += "&page=" + req.data.page;
   param.anchor = this.alias;
   Html.openTag("a", root.manage.createLinkParam(param));
   res.write(param.text ? param.text : "delete");
   Html.closeTag("a");
}

/**
 * macro renders the trust-state of this site
 */

function sysmgr_trusted_macro(param) {
   // this macro is allowed just for sysadmins
   if (!session.user.sysadmin)
      return;
   if (param.as == "editor") {
      var options = ["no", "yes"];
      Html.dropDown("trusted", options, this.trusted);
   } else
      res.write(this.trusted ? "yes" : "no");
}

/**
 * macro renders the block-state of this site
 */

function sysmgr_blocked_macro(param) {
   // this macro is allowed just for sysadmins
   if (!session.user.sysadmin)
      return;
   if (param.as == "editor") {
      var options = ["no", "yes"];
      Html.dropDown("blocked", options, this.blocked);
   } else
      res.write(this.blocked ? "yes" : "no");
}
