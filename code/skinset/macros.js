/**
 * macro calls a form-skin for editing a skin-source
 */

function skineditor_macro(param) {
   if (req.data.proto && req.data.name) {
      var s = this.fetchSkin(req.data.proto,req.data.name);
      s.renderSkin("edit");
   }
}

/**
 * macro checks if the skin was modified or
 * is the default-skin
 */

function skinstatus_macro(param) {
   if (!param.proto || !param.name)
      return;
   var s = this.fetchSkin(param.proto,param.name);
   if (s.creator) {
      res.write("customized by " + s.creator.name);
      res.write("&nbsp;...&nbsp;");
      Html.openLink(this.href("diff")+"?proto="+param.proto+"&name="+param.name);
      res.write("diff");
      Html.closeLink();
      res.write("&nbsp;...&nbsp;");
      Html.openLink(s.href("delete"));
      res.write("reset");
      Html.closeLink();
   } else
      res.write("not customized");
}


/**
 * macro creates an html link
 */
function link_macro(param) {
   if (param.checkdeny == "true" && this.isDenied(session.user, req.data.memberlevel))
      return;
   delete param.checkdeny;
   var content = param.text ? param.text : param.to;
   if (!content)
      content = this.name;
   param = this.createLinkParam(param);
   Html.openTag("a", param);
   res.write(content);
   Html.closeTag("a");
}

/**
 * Renders the skinset name as editor
 */
function name_macro(param) {
   if (param.as == "editor")
      Html.input({ name: "name", value: this.name });
   else
      return this.name;
}

/**
 * Renders a list for choosing the parent skinset
 */
function parentchooser_macro(param) {
   if (this.parent)
      param.selected = this.parent._id;
   path.skinmgr.skinsetchooser_macro(param);
}

/**
 * Shows whether this skinset is the site's default
 */
function siteDefault_macro(param) {
   if (param.as == "editor") {
      var attr = { name: "defaultSkinset", value: this._id };
      if (this.isDefaultSkinset())
         attr.selectedValue = this._id;
      Html.radioButton(attr);
   } else {
      return this.isDefaultSkinset() ? "yes" : "no";
   }
}

/**
 * Shows whether this skinset is shared
 */
function shared_macro(param) {
   if (param.as == "editor") {
      var attr = { name: this._id };
      if (this.shared > 0) 
         attr.checked = "checked";
      Html.checkBox(attr);
   } else {
      return this.shared;
   }
}

/** 
 * Helper function: is this skinset the default in the current context?
 */
function isDefaultSkinset() {
   if (path.site && path.site.preferences.getProperty("skinset") == this._id) 
      return true;
   if (!path.site && root.sys_skinset == this._id)
      return true;
   return false;
}
