/**
 * FIXME!
 * this macro looks like it is obsolete...?
 * (and if it's not i think it deserves a skin)
 *
 * macro renders filebased-skins as list
 */

function skins_macro(param) {
   for (var i in app.skinfiles) {
      openMarkupElement("b");
      res.write(i);
      closeMarkupElement("b");
      for (var j in app.skinfiles[i]) {
         openMarkupElement("li");
         openLink(this.href() + "?proto=" + i + "&name=" + j);
         res.write(j);
         closeLink();
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
