/**
 * Is this skinset the default in the current context?
 */
function isDefaultSkinset() {
   if (path.site && path.site.preferences.getProperty("skinset") == this._id)
      return true;
   if (!path.site && root.sys_skinset == this._id)
      return true;
   return false;
}

/**
 * Set this skinset to the default in the current context.
 */
function setDefaultSkinset(skinsetId) {
   if (path.site && path.site.preferences.getProperty("skinset") != skinsetId)
      path.site.preferences.setProperty("skinset", skinsetId);
   else if (!path.site && root.sys_skinset != skinsetId)
      root.sys_skinset = skinsetId;
}

/**
 *  Testdrive a skinset. Called by hopobject.onRequest().
 *  FIXME: Currently not used! Should it be?
 */
function testdriveSkinset() {
   if (session.data.testdriveSkinset) {
      var set = this.get(session.data.testdriveSkinset);
      if (set) {
         res.skinpath = new Array(set);
         res.message = set.renderSkinAsString("testdriveMessage");
      }
   }
}

/**
 * function deletes a skin
 * @param Obj Skin-HopObject to delete
 * @return String Message indicating success of failure
 */

function deleteSkinset(set) {
   var l = set.size();
   for (var i=l-1; i>=0; i--) {
      var group = set.get(i);
      var m = group.size();
      for (var j=m-1; j>=0; j--) {
          set[i][j].remove(); 
      }
   }
   if (set.remove())
      return (getMessage("confirm","skinDelete"));
   else
      return (getMessage("error","skinDelete"));
}


/**
 * Return the name of the skin manager
 * to be used in the global linkedpath macro
 * @see hopobject.getNavigationName()
 */
function getNavigationName () {
   return (DISPLAY["skinmgr"]);
}

