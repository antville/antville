/**
 * function tries to get the skin-object from skinmanager
 * if not existing, returns a temporary skin-object
 * containing the source of the file-skin
 */

function fetchSkin(proto,name) {
   var currProto = this.get(proto);
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
 * @param String Name of prototype
 * @param String Name of skin
 * @param String Source of modified skin
 * @param Obj User-object modifying this skin
 * @return Obj Object containing two properties:
 *             - error (boolean): true if error happened, false if everything went fine
 *             - message (String): containing a message to user
 */

function saveSkin(proto,name,source,creator) {
   var result;
   if (proto && name) {
      var s = this.fetchSkin(proto,name);
      if (!s.proto && skin) {
         s.creator = creator;
         s.createtime = new Date();
         s.name = name;
         s.proto = proto;
         this.add(s);
      } else if (s.proto && !source)
         this.get(s.proto).remove(s);
      if (source)
         s.skin = source;
      result = getConfirm("update");
   } else
      result = getError("skinUpdate");
   return (result);
}

/**
 * function deletes a skin
 * @param Obj Skin-HopObject to delete
 * @return String Message indicating success of failure
 */

function deleteSkin(s) {
   if (this.get(s.proto).remove(s))
      return ("Skin deleted successfully!");
   else
      return ("Couldn't delete skin!");
}

/**
 * function deletes all skins belonging to this manager
 */

function deleteAll() {
   for (var i=this.size();i>0;i--) {
      var proto = this.get(i-1);
      for (var j=proto.size();j>0;j--)
         proto.remove(proto.get(j-1));
   }
   return;
}
