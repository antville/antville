/**
 * main action
 */
function main_action() {
   res.data.title = getMessage("skin.mgr.listTitle", {layoutTitle: this._parent.title});
   res.data.list = this.renderTree(req.data);
   res.data.body = this.renderSkinAsString("main");
   res.handlers.context.renderSkin("page");
   return;
}

/**
 * list only modified skins
 */
function modified_action() {
   res.data.title = getMessage("skin.mgr.listModifiedTitle", {layoutTitle: this._parent.title});
   res.data.list = this.renderList(this.modified, req.action);
   res.data.body = this.renderSkinAsString("main");
   res.handlers.context.renderSkin("page");
   return;
}

/**
 * list only custom skins
 */
function custom_action() {
   res.data.title = getMessage("skin.mgr.listCustomTitle", {layoutTitle: this._parent.title});
   res.data.list = this.renderList(this.custom, req.action);
   res.data.body = this.renderSkinAsString("main");
   res.handlers.context.renderSkin("page");
   return;
}

/**
 * action renders the skinmgr menu in a safe (eg. unscrewable) way using
 * the page skin of skinmgr instead of the one of the site
 * so if something goes wrong this action should at least
 * give users the possibility to undo their changes
 */
function safe_action() {
   res.data.title = this._parent.title;
   res.data.list = this.renderList(this.modified);
   res.data.body = this.renderSkinAsString("main");
   this.renderSkin("page");
   return;
}

/**
 * edit action
 */
function edit_action() {
   if (req.data.cancel)
      res.redirect(this.href(req.data.action) + "?skinset=" + req.data.skinset + "#" + req.data.key);
   else if (req.data.save || req.data.close) {
      try {
         res.message = this.saveSkin(req.data, session.user);
         if (req.data.close)
            res.redirect(this.href(req.data.action) + "?skinset=" + req.data.skinset + "#" + req.data.key);
         res.redirect(this.href(req.action) + "?key=" + req.data.key + "&skinset=" + req.data.skinset + "#" + req.data.skinset);
      } catch (err) {
         res.message = err.toString();
      }
   }

   if (!req.data.key)
      res.redirect(this.href());
   var sp = new Object();
   var desc = this.getSkinDescription("skin", req.data.key);
   sp.title = desc[0];
   sp.text = desc[1] ? desc[1] : " (" + getMessage("skin.customSkin") + ")";
   var splitKey = req.data.key.split(".");
   sp.skin = this.getSkinSource(splitKey[0], splitKey[1]);
   sp.action = req.data.action;

   res.data.action = this.href(req.action);
   res.data.title = splitKey[0] + "/" + splitKey[1] + ".skin " + getMessage("manage.of") + " " + this._parent.title;
   res.data.body = this.renderSkinAsString("edit", sp);
   this.renderSkin("page");
   return;
}

/**
 * action for creating a custom skin
 */
function create_action() {
   if (req.data.cancel)
      res.redirect(this.href());
   else if (req.data.save) {
      try {
         var result = this.evalCustomSkin(req.data, session.user);
         res.message = result.toString();
         if (!result.error)
            res.redirect(this.href("edit") + "?key=" + req.data.prototype + "." + req.data.name);
      } catch (err) {
         res.message = err.toString();
      }
   }

   res.data.action = this.href(req.action);
   res.data.title = getMessage("skin.mgr.createCustomTitle", {layoutName: this._parent.title});
   res.data.body = this.renderSkinAsString("new");
   res.handlers.context.renderSkin("page");
   return;
}
