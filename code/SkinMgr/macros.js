/**
 * macro renders filebased-skins as list
 */

function skins_macro(param) {
   res.write(param.prefix)
   for (var i in app.skinfiles) {
      res.write("<b>" + i + "</b>");
      for (var j in app.skinfiles[i]) {
         res.write("<li>");
         res.write("<a href=\"" + this.href() + "?proto=" + i + "&name=" + j + "\">");
         res.write(j);
         res.write("</a></li>");
      }
      res.write("<br>");
   }
   res.write(param.suffix);
}


/**
 * macro calls a form-skin for editing a skin-source
 */

function skineditor_macro(param) {
   res.write(param.prefix)
   if (req.data.proto && req.data.name) {
      // user wants to edit a skin, so we try to get it:
      var currProto = this.__parent__.skinmanager.get(req.data.proto);
      if (currProto && currProto.get(req.data.name)) {
         var currSkin = currProto.get(req.data.name);
         currSkin.renderSkin("edit");
      } else {
         var newSkin = new skin();
         // since this is a new skin, we give it the source of the skinfile as default
         newSkin.skin = app.skinfiles[req.data.proto][req.data.name];
         newSkin.renderSkin("edit");
      }
   }
   res.write(param.suffix);
}

