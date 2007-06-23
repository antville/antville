//
// The Antville Project
// http://code.google.com/p/antville
//
// Copyright 2001-2007 by The Antville People
//
// Licensed under the Apache License, Version 2.0 (the ``License'');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an ``AS IS'' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// $Revision$
// $LastChangedBy$
// $LastChangedDate$
// $URL$
//

/**
 * main action
 */
SkinMgr.prototype.main_action = function() {
   res.data.title = getMessage("SkinMgr.listTitle", {layoutTitle: this._parent.title});
   res.data.list = this.renderTree(req.data);
   res.data.body = this.renderSkinAsString("main");
   res.handlers.context.renderSkin("page");
   return;
};

/**
 * list only modified skins
 */
SkinMgr.prototype.modified_action = function() {
   res.data.title = getMessage("SkinMgr.listModifiedTitle", {layoutTitle: this._parent.title});
   res.data.list = this.renderList(this.modified, req.action);
   res.data.body = this.renderSkinAsString("main");
   res.handlers.context.renderSkin("page");
   return;
};

/**
 * list only custom skins
 */
SkinMgr.prototype.custom_action = function() {
   res.data.title = getMessage("SkinMgr.listCustomTitle", {layoutTitle: this._parent.title});
   res.data.list = this.renderList(this.getCustomSkins(), req.action);
   res.data.body = this.renderSkinAsString("main");
   res.handlers.context.renderSkin("page");
   return;
};

/**
 * action renders the skinmgr menu in a safe (eg. unscrewable) way using
 * the page skin of skinmgr instead of the one of the site
 * so if something goes wrong this action should at least
 * give users the possibility to undo their changes
 */
SkinMgr.prototype.safe_action = function() {
   res.data.title = this._parent.title;
   res.data.list = this.renderList(this.modified);
   res.data.body = this.renderSkinAsString("main");
   this.renderSkin("page");
   return;
};

/**
 * edit action
 */
SkinMgr.prototype.edit_action = function() {
   if (req.data.cancel)
      res.redirect(this.href(req.data.action) + "?skinset=" + req.data.skinset + "#" + req.data.key);
   else if (req.data.save || req.data.close) {
      try {
         res.message = this.saveSkin(req.data, session.user);
         if (req.data.close)
            res.redirect(this.href(req.data.action) + "?skinset=" + req.data.skinset + "#" + req.data.key);
         res.redirect(this.href(req.action) + "?key=" + req.data.key + "&skinset=" + req.data.skinset + "&action=" + req.data.action);
      } catch (err) {
         res.message = err.toString();
      }
   }

   if (!req.data.key)
      res.redirect(this.href());
   var sp = new Object();
   var splitKey = req.data.key.split(".");
   var desc = this.getSkinDescription("skin", req.data.key);
   sp.title = desc[0];
   sp.text = desc[1] ? desc[1] : " (" + getMessage("skin.customSkin") + ")";
   sp.skin = this.getSkinSource(splitKey[0], splitKey[1]);
   sp.action = req.data.action;

   res.data.action = this.href(req.action);
   res.data.title = splitKey[0] + "/" + splitKey[1] + ".skin " + getMessage("generic.of") + " " + this._parent.title;
   res.data.body = this.renderSkinAsString("edit", sp);
   this.renderSkin("page");
   return;
};

/**
 * action for creating a custom skin
 */
SkinMgr.prototype.create_action = function() {
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
   res.data.title = getMessage("SkinMgr.createCustomTitle", {layoutTitle: this._parent.title});
   res.data.body = this.renderSkinAsString("new");
   res.handlers.context.renderSkin("page");
   return;
};
/**
 * list the (most important) macros
 * available for a specific skin of a
 * prototype (except Global)
 * @see this.globalmacros_macro
 * FIXME: needs improvement
 */
SkinMgr.prototype.macros_macro = function(param) {
   this.renderMacroList(param);
   return;
};


/**
 * list macros available in a global
 * skin of a prototype
 * @see this.macros_macro
 * FIXME: needs improvement
 */
SkinMgr.prototype.globalmacros_macro = function(param) {
   param.proto = "Global";
   param.includeGlobal = true;
   this.renderMacroList(param);
   return;
};


/**
 * list skin-specific macros (param, 
 * response etc.) of a skin
 */
SkinMgr.prototype.skinmacros_macro = function(param) {
   if (!req.data.key)
      return;
   var parts = req.data.key.split(".");
   if (!HELP.skins[parts[0]])
      return;
   if (!HELP.skins[parts[0]][parts[1]])
      return;
   var macros = HELP.skins[parts[0]][parts[1]];
   macros.sort();
   if (!param.itemprefix)
      param.itemprefix = "";
   if (!param.itemsuffix)
      param.itemsuffix = "<br />";
   for (var i in macros) {
      res.write(param.itemprefix);
      res.encode("<% ");
      res.write(macros[i]);
      res.encode(" %>");
      res.write(param.itemsuffix);
   }
   return;
};


/**
 * renders a dropdown containing available
 * prototypes
 */
SkinMgr.prototype.prototypechooser_macro = function(param) {
   var options = [];
   for (var i in app.skinfiles)
      options.push({value: i, display: i});
   options.sort(function(a, b) {return a.display.charCodeAt(0) - b.display.charCodeAt(0); });
   Html.dropDown({name: "prototype"}, options, null, param.firstOption);
   return;
};
/**
 * function stores skin
 * @param Obj object containing submitted form values (req.data)
 * @param Obj User object
 */
SkinMgr.prototype.saveSkin = function(param, usr) {
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
      s = new Skin(this._parent, splitKey[0], splitKey[1], usr);
      s.skin = param.skin;
      var originalSkin = this.getOriginalSkin(splitKey[0], splitKey[1]);
      if (originalSkin)
         s.custom = originalSkin.custom;
      this.add(s);
   }
   return new Message("update");
};

/**
 * function deletes a skin
 * @param Obj Skin-HopObject to delete
 * @return String Message indicating success of failure
 */
SkinMgr.prototype.deleteSkin = function(s) {
   s.remove();
   return new Message("skinDelete");
};

/**
 * delete all skins belonging to this manager
 */
SkinMgr.prototype.deleteAll = function() {
   for (var i=0;i<this.size();i++) {
      var proto = this.get(i);
      for (var j=proto.size();j>0;j--)
         this.deleteSkin(proto.get(j-1));
   }
   return;
};

/**
 * retrieve a skin from the skinmanager collection
 * @param String name of prototype
 * @param String name of skin
 * @return Object skin object or null
 */
SkinMgr.prototype.getSkin = function(proto, name) {
   if (!this.get(proto))
      return null;
   return this.get(proto).get(name);
};

/**
 * return the source of a skin
 * @param String name of the prototype
 * @param String name of the skin
 * @return String source of the skin
 */
SkinMgr.prototype.getSkinSource = function(proto, name) {
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
};

/**
 * function gets the original skin
 * @param String name of the prototype
 * @param String name of the skin
 * @return Skin the original skin
 */
SkinMgr.prototype.getOriginalSkin = function(proto, name) {
   if (this._parent.parent) {
      var handler = this._parent;
      var s;
      while ((handler = handler.parent) != null) {
         if ((s = handler.skins.getSkin(proto, name)) != null)
            return s;
      }
   }
   return null;
};

/**
 * function gets the source of the original skin
 * @param String name of the prototype
 * @param String name of the skin
 * @return String source of the original skin
 */
SkinMgr.prototype.getOriginalSkinSource = function(proto, name) {
   var originalSkin;
   if ((originalSkin = this.getOriginalSkin(proto, name)) != null)
      return originalSkin.skin;
   else if (app.skinfiles[proto])
      return app.skinfiles[proto][name];
   else
      return null;
};

/**
 * returns all custom skins for this layout 
 * including those from parent layouts (own
 * custom skins override those of the parent layout)
 * @return Array containing skin HopObjects
 */
SkinMgr.prototype.getCustomSkins = function() {
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
};

/**
 * dump all skins of this skinmgr
 * @param Object Zip object to add the skins to
 */
SkinMgr.prototype.dumpToZip = function(z, fullExport) {
   var appSkinFiles = app.getSkinfiles();
   var it = app.__app__.getPrototypes().iterator();
   var protoName, proto, protoSkinFiles, skinName, skin, buf;
   while (it.hasNext()) {
      protoName = it.next().getName();
      if ((proto = this.get(protoName)) || fullExport) {
         protoSkinFiles = appSkinFiles[protoName];
         for (var skinName in protoSkinFiles) {
            if (skin = this.getSkin(protoName, skinName)) {
               // skin is locally managed => export
               z.addData(new java.lang.String(skin.skin).getBytes("UTF-8"),
                         "skins/" + protoName + "/" + skinName + ".skin");
            } else if (fullExport) {
               // walk up the layout chain and 
               if (!(skin = this.getOriginalSkin(protoName, skinName)))
                  skin = protoSkinFiles[skinName];
               z.addData(new java.lang.String(skin).getBytes("UTF-8"),
                         "skins/" + protoName + "/" + skinName + ".skin");
            }
         }
      }
   }
   return;
};


/**
 * create the skins of an imported layout
 * @param Object JS object tree containing the skins data
 */
SkinMgr.prototype.evalImport = function(data) {
   var proto, buf, name;
   for (var protoName in data) {
      proto = data[protoName];
      for (var fileName in proto) {
         name = fileName.substring(0, fileName.lastIndexOf("."));
         // FIXME: replace session.user with a more intelligent solution ...
         var s = new Skin(this._parent, protoName, name, session.user);
         buf = data[protoName][fileName].data;
         s.skin = new java.lang.String(buf, 0, buf.length, "UTF-8");
         this.add(s);
      }
   }
   return true;
};

/**
 * retrieve the description (title, text) of a skin
 * from a message file depending on site and root locale
 * @param String prefix
 * @param String key to message
 * @param Object Array ([0] == title, [1] == text)
 */
SkinMgr.prototype.getSkinDescription = function(prefix, key) {
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
};

/**
 * create a custom skin
 */
SkinMgr.prototype.evalCustomSkin = function(param, creator) {
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
   var s = new Skin(this._parent, param.prototype, param.name, creator);
   s.custom = 1;
   if (!this.add(s))
      throw new Exception("skinCustomCreate");
   return new Message("skinCustomCreate", [param.prototype, param.name]);
};
/**
 * render the tree view of skin manager
 * @param Object req.data
 * @param Object Array containg the children (if any)
 */
SkinMgr.prototype.renderTree = function(param, collection) {
   res.push();
   if (!collection)
      var collection = SKINSETS;
   for (var i in collection) {
      var skinset = collection[i];
      if (skinset.context && skinset.context.toLowerCase() != res.handlers.context._prototype.toLowerCase())
         continue;
      var sp = {skinset: skinset.key, anchor: skinset.key, "class": "closed"};
      var desc = this.getSkinDescription("skinset", skinset.key);
      sp.title = desc[0];
      sp.text = desc[1];
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
};

/**
 * render the list of skins of a branch
 * @param Object array containing the skins
 * @param String key of the current branch
 */
SkinMgr.prototype.renderTreeLeafs = function(skinset) {
   res.push();
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
};

/**
 * render a list of skins
 */
SkinMgr.prototype.renderList = function(collection, action) {
   var sp = {action: action};
   res.push();
   var arr = (collection instanceof Array ? collection : collection.list());
   for (var i=0;i<arr.length;i++) {
      var s = arr[i];
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
};


/**
 * render a list of macros
 * FIXME: needs improvement
 */
SkinMgr.prototype.renderMacroList = function(param) {
   if (!param.proto) {
      if (!req.data.key)
         return;
      param.key = req.data.key;
      var parts = req.data.key.split(".");
      param.proto = parts[0];
   }
   var handler = "";
   if (param.proto == "HopObject")
      handler = "this.";
   else if (param.proto != "Global")
      handler = param.proto.toLowerCase() + ".";
   else if (!param.includeGlobal)
      return;
   if (!param.itemprefix)
      param.itemprefix = "";
   if (!param.itemsuffix)
      param.itemsuffix = "<br />";
   var macrolist = app.data.macros[param.proto]
   for (var i in macrolist) {
      var macro = macrolist[i];
      res.push();
      res.encode("<% ");
      res.write(handler);
      res.write(macro.name);
      res.encode(" %>");
      var str = res.pop();
      res.write(param.itemprefix);
      if (macro.storyid > 0)
         Html.link({href: HELP.macros._url + macro.storyid}, str);
      else
         res.write(str);
      res.write(param.itemsuffix);
   }
   return;
};
/**
 * permission check (called by hopobject.onRequest())
 * @param String name of action
 * @param Obj User object
 * @param Int Membership level
 * @return Obj Exception object or null
 */
SkinMgr.prototype.checkAccess = function(action, usr, level) {
   checkIfLoggedIn(this.href(req.action));
   try {
      this.checkEdit(usr, level);
   } catch (deny) {
      res.message = deny.toString();
      res.redirect(this._parent.href());
   }
   return;
};


/**
 * check if user is allowed to edit skins
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */
SkinMgr.prototype.checkEdit = function(usr, level) {
   if ((level & MAY_EDIT_LAYOUTS) == 0 && !session.user.sysadmin)
      throw new DenyException("skinEdit");
   return;
};
