/**
 * function tries to get the skin-object from skinmanager
 * if not existing, returns a temporary skin-object
 * containing the source of the file-skin
 */

function fetchSkin(proto, name) {
   var currProto = this.get(proto);
   if (currProto && currProto.get(name))
      return(currProto.get(name));
   var s = new skin();
   if (this.parent && this.parent.get(proto) && this.parent.get(proto).get(name)) {
      s.skin = this.parent.get(proto).get(name).skin
   } else {
      s.skin = app.skinfiles[proto][name];
   }
   return (s);
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

function saveSkin(proto, name, source, creator) {
   if (!proto || !name)
      throw new Exception("skinUpdate");
   var s = this.fetchSkin(proto, name);
   if (!s.proto && source) {
      s.creator = creator;
      s.createtime = new Date();
      s.modifier = creator;
      s.modifytime = new Date();
      s.name = name;
      s.proto = proto;
      s.site = this._parent;
      this.add(s);
   } else if (s.proto && !source)
      this.get(s.proto).remove(s);
   if (source) {
      s.skin = source;
      s.modifier = creator;
      s.modifytime = new Date();
   }
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
}

/**
 * function deletes all skins belonging to this manager
 */
function deleteAll() {
   for (var i=this.size();i>0;i--) {
      var proto = this.get(i-1);
      for (var j=proto.size();j>0;j--) {
         var s = proto.get(j-1);
         if (!proto.remove(s))
            throw new Exception("siteDeleteSkins");
      }
   }
   return true;
}

/**
 *  Apply this skinset to res.skinset.
 */
function testdrive() {
   res.skinpath = [this];
   res.message = "[Currently testing skinset <a href='"+this.href()+"'>";
   res.message += this.name+"</a>.<br />";
   res.message += "<a href='"+this.href("stopTestdrive")+"'>";
   res.message += "Click here</a> to switch back to default skinset.]";
}

/**
 * Return the logical container (site|root) for this skinset.
 */
function getParent() {
   if (this.psite) 
      return this.psite;
   return root;
}

/**
 * Return the name of this skinset
 * to be used in the global linkedpath macro
 * @see hopobject.getNavigationName()
 */
function getNavigationName () {
   return (DISPLAY["skinset"] + " " + this.name);
}

