/**
 * function evaluates skin
 */

function saveSkin() {
   if (req.data.proto && req.data.name) {
      var currProto = this._parent.skinmanager.get(req.data.proto);
      if (currProto) {
         var currSkin = currProto.get(req.data.name);
      }
      if (!currSkin && req.data.skin) {
         var currSkin = new skin();
         currSkin.creator = user;
         currSkin.createtime = new Date();
         currSkin.name = req.data.name;
         currSkin.proto = req.data.proto;
         this._parent.skinmanager.add(currSkin);
      } else if (!req.data.skin) {
         currProto.remove(currSkin);
      }
      if (req.data.skin)
         currSkin.skin = req.data.skin;
      res.message = "Changes were saved successfully!";
   }
   res.redirect(this.href() + "?proto=" + req.data.proto + "&name=" + req.data.name);
}