/**
 * function tries to get the skin-object from skinmanager
 * if not existing, returns a temporary skin-object
 * containing the source of the file-skin
 */

function fetchSkin(proto,name) {
   var currProto = this._parent.skinmanager.get(proto);
   if (currProto && currProto.get(name))
      return(currProto.get(name));
   else {
      var s = new skin();
      s.skin = app.skinfiles[proto][name];
      return (s);
   }
}

/**
 * function stores skin
 * if no source was posted, the database-skin is deleted
 * (actually there should be a "delete"-button ...)
 */

function saveSkin() {
   if (req.data.proto && req.data.name) {
      var s = this.fetchSkin(req.data.proto,req.data.name);
      if (!s.proto && req.data.skin) {
         s.creator = user;
         s.createtime = new Date();
         s.name = req.data.name;
         s.proto = req.data.proto;
         this._parent.skinmanager.add(s);
      } else if (s.proto && !req.data.skin)
         this._parent.skinmanager.get(s.proto).remove(s);
      if (req.data.skin)
         s.skin = req.data.skin;
      res.message = "Changes were saved successfully!";
   }
   res.redirect(this.href() + "#" + s.proto + s.name);
}

/**
 * function deletes a skin
 */

function deleteSkin(s) {
   this._parent.skinmanager.get(s.proto).remove(s);
   res.message = "Skin deleted successfully!";
   res.redirect(this.href());
}