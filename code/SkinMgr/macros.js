/**
 * macro calls a form-skin for editing a skin-source
 */

function skineditor_macro(param) {
   if (req.data.proto && req.data.name) {
      var s = this.fetchSkin(req.data.proto, req.data.name);
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
   var s = this.fetchSkin(param.proto, param.name);
   if (s.creator) {
      res.write("customized by " + s.creator.name);
      res.write("&nbsp;...&nbsp;");
      Html.link(this.href("diff") + "?proto=" + param.proto + "&name=" + param.name, "diff");
      res.write("&nbsp;...&nbsp;");
      Html.link(s.href("delete"), "reset");
   } else
      res.write("not customized");
   return;
}
