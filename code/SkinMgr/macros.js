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
      var s = this.fetchSkin(req.data.proto,req.data.name);
      s.renderSkin("edit");
      /*
      var currProto = this._parent.skinmanager.get(req.data.proto);
      if (currProto && currProto.get(req.data.name)) {
         var currSkin = currProto.get(req.data.name);
         currSkin.renderSkin("edit");
      } else {
         var newSkin = new skin();
         // since this is a new skin, we give it the source of the skinfile as default
         newSkin.skin = app.skinfiles[req.data.proto][req.data.name];
         newSkin.renderSkin("edit");
      }
      */
   }
   res.write(param.suffix);
}

/**
 * macro checks if the skin was modified or
 * is the default-skin
 */

function skinstatus_macro(param) {
   if (!param.proto || !param.name)
      return;
   var s = this.fetchSkin(param.proto,param.name);
   res.write(param.prefix);
   if (s.creator) {
      res.write("customized by " + s.creator.name);
      res.write("&nbsp;...&nbsp;");
      var linkParam = new Object();
      linkParam.to = "delete";
      s.openLink(linkParam);
      res.write("remove skin");
      this.closeLink();
   } else
      res.write("not customized");
   res.write(param.suffix);
}