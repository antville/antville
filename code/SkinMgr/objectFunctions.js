/**
 * function stores skin
 * @param Obj object containing submitted form values (req.data)
 * @param Obj User object
 */
function saveSkin(param, usr) {
   if (!param.key)
      throw new Exception("skinUpdate");
   var splitKey = param.key.split(".");
   var s = this.getSkin(splitKey[0], splitKey[1]);
   var originalSource = this.getOriginalSkinSource(splitKey[0], splitKey[1]);
   if (s) {
      if (param.skin == originalSource) {
         // submitted skin equals original source
         // so delete the skin object
         try {
            this.deleteSkin(s);
         } catch (err) {
            return new Message("update");
         }
      } else {
         s.modifytime = new Date();
         s.modifier = usr;
         s.skin = param.skin;
      }
   } else {
      if (param.skin == originalSource)
         return new Message("update");
      s = new skin(this._parent, splitKey[0], splitKey[1], usr);
      s.skin = param.skin;
      var originalSkin = this.getOriginalSkin(splitKey[0], splitKey[1]);
      if (originalSkin)
         s.custom = originalSkin.custom;
      this.add(s);
   }
   return new Message("update");
}

/**
 * function deletes a skin
 * @param Obj Skin-HopObject to delete
 * @return String Message indicating success of failure
 */
function deleteSkin(s) {
   s.remove();
   return new Message("skinDelete");
}

/**
 * delete all skins belonging to this manager
 */
function deleteAll() {
   for (var i=0;i<this.size();i++) {
      var proto = this.get(i);
      for (var j=proto.size();j>0;j--)
         this.deleteSkin(proto.get(j-1));
   }
   return;
}

/**
 * retrieve a skin from the skinmanager collection
 * @param String name of prototype
 * @param String name of skin
 * @return Object skin object or null
 */
function getSkin(proto, name) {
   if (!this.get(proto))
      return null;
   return this.get(proto).get(name);
}

/**
 * return the source of a skin
 * @param String name of the prototype
 * @param String name of the skin
 * @return String source of the skin
 */
function getSkinSource(proto, name) {
   var s;
   if ((s = this.getSkin(proto, name)) != null)
      return s.skin;
   else if (this._parent.parent) {
      var handler = this._parent;
      while ((handler = handler.parent) != null) {
         if ((s = handler.skins.getSkin(proto, name)) != null)
            return s.skin;
      }
   }
   if (app.skinfiles[proto])
      return app.skinfiles[proto][name];
   return null;
}

/**
 * function gets the original skin
 * @param String name of the prototype
 * @param String name of the skin
 * @return Skin the original skin
 */
function getOriginalSkin(proto, name) {
   if (this._parent.parent) {
      var handler = this._parent;
      var s;
      while ((handler = handler.parent) != null) {
         if ((s = handler.skins.getSkin(proto, name)) != null)
            return s;
      }
   }
   return null;
}

/**
 * function gets the source of the original skin
 * @param String name of the prototype
 * @param String name of the skin
 * @return String source of the original skin
 */
function getOriginalSkinSource(proto, name) {
   var originalSkin;
   if ((originalSkin = this.getOriginalSkin(proto, name)) != null)
      return originalSkin.skin;
   else if (app.skinfiles[proto])
      return app.skinfiles[proto][name];
   else
      return null;
}

/**
 * returns all custom skins for this layout 
 * including those from parent layouts (own
 * custom skins override those of the parent layout)
 * @return HopObject of Skins
 */
function getCustomSkins() {
   var coll = [];
   // object to store the already added skin keys
   // used to avoid duplicate skins in the list
   var keys = {};

   // private method to add a custom skin
   var addSkins = function(mgr) {
      var size = mgr.custom.size();
      for (var i=0;i<size;i++) {
         var s = mgr.custom.get(i);
         var key = s.proto + ":" + s.name;
         if (!keys[key]) {
            keys[key] = s;
            coll.push(s);
         }
      }
   }
   var handler = this._parent;
   while (handler) {
      addSkins(handler.skins);
      handler = handler.parent;
   }
   return coll;
}

/**
 * dump all skins of this skinmgr
 * @param Object Zip object to add the skins to
 */
function dumpToZip(z, fullExport, exportLog) {
   if (!exportLog)
      var exportLog = new java.util.Hashtable(200);
   var key;
   // first loop over all skins managed by this skinmanager
   for (var i=0;i<this.size();i++) {
      var proto = this.get(i);
      for (var j=0;j<proto.size();j++) {
         var s = proto.get(j);
         key = s.proto + s.name;
         if (s.skin && !exportLog.containsKey(key)) {
            var buf = new java.lang.String(s.skin).getBytes();
            z.addData(buf, "skins/" + s.proto + "/" + s.name + ".skin");
            // add the exported skin to the exportLog
            exportLog.put(key, true)
         }
      }
   }
   // if fullExport is enabled also dump the parent's skins
   // and finally all skins of app.skinfiles that weren't
   // exported already
   if (fullExport) {
      if (this._parent.parent)
         this._parent.parent.skins.dumpToZip(z, fullExport, exportLog);
      else {
         // loop over app.skinfiles and add those that aren't
         // exported already to the zip file
         for (var protoName in app.skinfiles) {
            var proto = app.skinfiles[protoName];
            for (var skinName in proto) {
               var source = proto[skinName];
               key = protoName + skinName;
               if (source && !exportLog.containsKey(key)) {
                  var buf = new java.lang.String(source).getBytes();
                  z.addData(buf, "skins/" + protoName + "/" + skinName + ".skin");
                  exportLog.put(key, true);
               }
            }
         }
      }
   }
   return exportLog;
}


/**
 * create the skins of an imported layout
 * @param Object JS object tree containing the skins data
 */
function evalImport(data) {
   var proto;
   var buf;
   var name;
   for (var protoName in data) {
      proto = data[protoName];
      for (var fileName in proto) {
         name = fileName.substring(0, fileName.lastIndexOf("."));
         // FIXME: replace session.user with a more intelligent solution ...
         var s = new skin(this._parent, protoName, name, session.user);
         buf = data[protoName][fileName].data;
         s.skin = new java.lang.String(buf, 0, buf.length);
         this.add(s);
      }
   }
   return true;
}

/**
 * retrieve the description (title, text) of a skin
 * from a message file depending on site and root locale
 * @param String prefix
 * @param String key to message
 * @param Object Array ([0] == title, [1] == text)
 */
function getSkinDescription(prefix, key) {
   var languages = getLanguages();
   var propName = prefix + "." + key;
   var lang;
   for (var i=0;i<languages.length;i++) {
      if (!(lang = app.data[languages[i]]))
         continue;
      if (lang.getProperty(propName))
         return lang.getProperty(propName).split("|");
   }
   return [key];
}

/**
 * create a custom skin
 */
function evalCustomSkin(param, creator) {
   if (!param.prototype)
      throw new Exception("skinCustomPrototypeMissing");
   else if (!param.name)
      throw new Exception("skinCustomNameMissing");
   else if (this[param.prototype] && this[param.prototype][param.name])
      throw new Exception("skinCustomExisting");
   else if (this.getOriginalSkin(param.prototype, param.name))
      throw new Exception("skinCustomExisting");
   else if (app.skinfiles[param.prototype] && app.skinfiles[param.prototype][param.name])
      throw new Exception("skinCustomExisting");
   var s = new skin(this._parent, param.prototype, param.name, creator);
   s.custom = 1;
   if (!this.add(s))
      throw new Exception("skinCustomCreate");
   return new Message("skinCustomCreate", [param.prototype, param.name]);
}
