/**
 * function stores skin
 * @param Obj object containing submitted form values (req.data)
 * @param Obj User object
 */
function saveSkin(param, usr) {
   if (!param.proto || !param.name)
      throw new Exception("skinUpdate");
   if (this[param.proto] && this[param.proto][param.name]) {
      var s = this[param.proto][param.name];
      s.modifytime = new Date();
      s.modifier = usr;
   } else {
      var s = new skin(this._parent, param.proto, param.name, usr);
      this.add(s);
   }
   s.skin = param.skin;
   return new Message("update");
}

/**
 * function deletes a skin
 * @param Obj Skin-HopObject to delete
 * @return String Message indicating success of failure
 */
function deleteSkin(s) {
   try {
      this.get(s.proto).remove(s);
      return new Message("skinDelete");
   } catch (err) {
      throw new Exception("skinDelete");
   }
   return true;
}

/**
 * delete all skins belonging to this manager
 */
function deleteAll() {
   for (var i=this.size();i>0;i--) {
      var proto = this.get(i-1);
      for (var j=proto.size();j>0;j--)
         this.deleteSkin(proto.get(j-1));
   }
   return true;
}

/**
 * return the source of a skin
 * @param String name of the prototype
 * @param String name of the skin
 * @return String source of the skin
 */
function getSkinSource(proto, name) {
   var sp = [this];
   if (this._parent.parent)
      sp.push(this._parent.parent.skins);
   var s = app.__app__.getSkin(proto, name, sp);
   return (s ? s.source : null);
}

/**
 * dump all skins of this skinmgr
 * @param Object Zip object to add the skins to
 */
function dumpToZip(z) {
   var skins = app.skinfiles;
   for (var protoName in skins) {
      var proto = app.skinfiles[protoName];
      for (var skinName in proto) {
         var s = proto[skinName];
         var source = this.getSkinSource(protoName, skinName);
         if (source) {
            var buf = new java.lang.String(source).getBytes();
            z.addData(buf, "skins/" + protoName + "/" + skinName);
         }
      }
   }
   return;
}

/**
 * create the skins of an imported layout
 * @param Object JS object tree containing the skins data
 */
function evalImport(data) {
   var proto;
   var skinParam;
   var buf;
   for (var protoName in data) {
      proto = data[protoName];
      for (var skinName in proto) {
         skinParam = proto[skinName];
         // FIXME: replace session.user with a more intelligent solution ...
         var s = new skin(this._parent, protoName, skinName, session.user);
         buf = data[protoName][skinName].data;
         s.skin = new java.lang.String(buf, 0, buf.length);
         this.add(s);
      }
   }
   return true;
}
