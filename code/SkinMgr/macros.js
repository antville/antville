/**
 * macro renders filebased-skins as list
 */

function skins_macro(param) {
   for (var i in app.skinfiles) {
      res.write("<b>" + i + "</b>");
      for (var j in app.skinfiles[i]) {
         var linkparam = new Object();
         linkparam.href = this.href() + "?proto=" + i + "&name=" + j;
         openMarkupElement("li");
         openMarkupElement("a", linkparam);
         res.write(j);
         closeMarkupElement("a");
         closeMarkupElement("li");
      }
      renderMarkupElement("br");
   }
}


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
      openLink(s.href("delete"));
      res.write("remove skin");
      closeLink();
   } else
      res.write("not customized");
}
