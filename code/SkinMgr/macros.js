/**
 * macro renders filebased-skins as list
 */

function skins_macro(param) {
   renderPrefix(param);
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
   renderSuffix(param);
}


/**
 * macro calls a form-skin for editing a skin-source
 */

function skineditor_macro(param) {
   renderPrefix(param);
   if (req.data.proto && req.data.name) {
      // user wants to edit a skin, so we try to get it:
      var currProto = this.__parent__.skinmanager.get(req.data.proto);
      if (currProto && currProto.get(req.data.name)) {
         var currSkin = currProto.get(req.data.name);
         currSkin.renderSkin("edit");
      } else {
         var newSkin = new skin();
         // since this is a new skin, we give it the source of the skinfile as default
         var sf = new File(getProperty("appPath") + req.data.proto + "/" + req.data.name + ".skin");
         newSkin.skin = sf.readAll();
         newSkin.renderSkin("edit");
      }
   }
   renderSuffix(param);
}