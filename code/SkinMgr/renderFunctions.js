/**
 * render the tree view of skin manager
 * @param Object req.data
 * @param Object Array containg the children (if any)
 */
function renderTree(param, collection) {
   res.push();
   if (!collection)
      var collection = SKINSETS;
   for (var i in collection) {
      var skinset = collection[i];
      var sp = {skinset: skinset.key, anchor: skinset.key, "class": "closed"};
      var desc = this.getSkinDescription("skinset", skinset.key);
      sp.title = desc[0];
      sp.text = desc[1];
      if (skinset.context && skinset.context != res.handlers.context._prototype)
         continue;
      if (param.skinset && param.skinset.startsWith(skinset.key)) {
         sp["class"] = "selected";
         if (skinset.skins)
            sp.skins = this.renderTreeLeafs(skinset);
         sp.skinset = sp.skinset.substring(0, sp.skinset.indexOf("."));
         if (skinset.children)
            sp.children = this.renderTree(param, skinset.children);
      }
      this.renderSkin("treebranch", sp);
   }
   return res.pop();
}

/**
 * render the list of skins of a branch
 * @param Object array containing the skins
 * @param String key of the current branch
 */
function renderTreeLeafs(skinset) {
   res.push();
   var text;
   for (var i in skinset.skins) {
      var sp = {key: skinset.skins[i], skinset: skinset.key};
      var splitKey = sp.key.split(".");
      var s = this.getSkin(splitKey[0], splitKey[1]);
      if (s)
         sp.status = s.renderSkinAsString("status");
      var desc = this.getSkinDescription("skin", sp.key);
      sp.title = desc[0];
      sp.text = desc[1];
      this.renderSkin("treeleaf", sp);
   }
   return res.pop();
}

/**
 * render a list of skins
 */
function renderList(collection, action) {
   var sp = {action: action};
   res.push();
   for (var i=0;i<collection.size();i++) {
      var s = collection.get(i);
      sp.key = s.proto + "." + s.name;
      if (!s.custom) {
         sp.status = s.renderSkinAsString("status");
         var desc = this.getSkinDescription("skin", sp.key);
         sp.title = desc[0];
         sp.text = desc[1];
      } else {
         sp.status = s.renderSkinAsString("statuscustom");
         sp.title = sp.key;
      }
      this.renderSkin("treeleaf", sp);
   }
   return res.pop();
}
