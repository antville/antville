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
// $Revision:3337 $
// $LastChangedBy:piefke3000 $
// $LastChangedDate:2007-09-21 15:54:30 +0200 (Fri, 21 Sep 2007) $
// $URL$
//

Skins.prototype.getPermission = function(action) {
   switch (action) {
      case "edit":
      case "create":
      return User.getPermission(User.PRIVILEGED) ||
            Membership.getPermission(Membership.OWNER);
   }
   return true;
};

Skins.prototype.main_action = function() {
   res.push();
   var skin;
   var skins = Skins.getOutline();
   html.openTag("ul");
   for each (var item in skins) {
      if (item[1] && item[1].length > 0) {
         html.openTag("li");
         res.write(item[0]);
         html.openTag("ul");
         for each (var subskin in item[1]) {
            skin = this.getSkin(item[0], subskin) || 
                  new Skin(res.handlers.site.layout, item[0], subskin);
            skin.renderSkin("Skin#listItem");
         }
         html.closeTag("ul");
         html.closeTag("li");
      }
   }
   html.closeTag("ul");
   res.data.list = res.pop();
   res.data.title = gettext("Skins of {0}", this._parent.title);
   res.data.body = this.renderSkinAsString("main");
   res.handlers.site.renderSkin("page");
   return;
};

Skins.getOutline = function() {
   var outline = [];
   var prototypes = [];
   for (var prototype in app.skinfiles) {
      prototypes.push(prototype);
   }
   prototypes.sort();
   var skin, subskins, names;
   for each (var prototype in prototypes) {
      for (var name in app.skinfiles[prototype]) {
         if (name !== prototype) {
            continue;
         }
         skin = createSkin(app.skinfiles[prototype][name]);
         subskins = skin.getSubskinNames();
         names = [];
         /*if (skin.hasMainskin()) {
            names.push("main");
         }*/
         for (var i in subskins) {
            names.push(subskins[i]);
         }
         names.sort();
         outline.push([prototype, names]);
      }
   }
   return outline
 };

Skins.prototype.getFormOptions = function(name) {
   switch (name) {
      case "prototype":
      return Skins.getPrototypeOptions();
   }
};

Skins.prototype.create_action = function() {
   if (req.data.prototype && req.data.name) {
      try {
         var skin = this.createSkin(req.data);
         if (req.postParams.save && !skin.equals(req.postParams.source)) {
            this.add(skin);
            res.message = gettext("The changes were saved successfully.");
            res.redirect(skin.href());
         }
         res.data.action = this.href(req.action);
         res.data.title = gettext("Edit skin {0}.{1} of layout {2}", 
               skin.prototype, skin.name, res.handlers.layout.name);
         res.data.body = skin.renderSkinAsString("Skin#edit");
         this.renderSkin("page");
      } catch (ex) {
         res.message = ex;
         app.log(ex);
      }
   } else {
      res.data.action = this.href(req.action);
      res.data.title = gettext('Create a custom skin for layout "{0}"', 
            this._parent.title);
      res.data.body = this.renderSkinAsString("new");
      res.handlers.site.renderSkin("page");
   }
   return;
};

Skins.prototype.createSkin = function(data) {
   if (!data.prototype) {
      throw Error(gettext("Please choose a prototype for the custom skin."));
   } else if (!data.name) {
      throw Error(gettext("Please choose a name for the custom skin."));
   } else if (data.name === data.prototype ||
         (this[data.prototype] && this[data.prototype][data.name]) ||
         this.getOriginalSkin(data.prototype, data.name) || 
         (app.skinfiles[data.prototype] && 
         app.skinfiles[data.prototype][data.name])) {
      throw Error(gettext("There is already a skin with this name. Please choose another one."));
   }
   var skin = new Skin(this._parent, data.prototype, data.name, data.custom);
   return skin;
};

Skins.prototype.updateSkin = function(data) {
   if (!data.key) {
      throw Error(gettext("Oops, was not able to update the desired skin. Maybe you should try again..."));
   }
   var parts = data.key.split(".");
   var skin = this.getSkin(parts[0], parts[1]);
   var originalSource = this.getOriginalSkinSource(parts[0], parts[1]);
   if (skin) {
      // FIXME: The removal of linebreaks is necessary but it's not very nice
      if (originalSource && data.skin.replace(/\r|\n/g, "") == 
            originalSource.replace(/\r|\n/g, "")) {
         // submitted skin equals original source
         // so delete the skin object
         try {
            Skin.remove(skin);
         } catch (ex) {
            res.debug(ex);
            app.log(ex);
            return;
         }
      } else {
         skin.touch();
         //skin.skin = param.skin;
         skin.setSource(data.skin);
      }
   } else {
      // FIXME: The removal of linebreaks is necessary but not very nice
      if (originalSource && data.skin.replace(/\r|\n/g, "") == 
            originalSource.replace(/\r|\n/g, "")) {
         return;
      }
      skin = new Skin(this._parent, parts[0], parts[1]);
      //skin.skin = param.skin;
      skin.setSource(data.skin);
      var originalSkin = this.getOriginalSkin(parts[0], parts[1]);
      if (originalSkin) {
         skin.custom = originalSkin.custom;
      }
      this.add(skin);
   }
   return;
};

Skins.prototype.modified_action = function() {
   res.data.title = gettext("Modified skins of {0}", this._parent.title);
   res.data.list = this.renderList(this.modified, req.action);
   res.data.body = this.renderSkinAsString("main");
   res.handlers.site.renderSkin("page");
   return;
};

Skins.prototype.custom_action = function() {
   res.data.title = gettext("Custom skins of {0}", this._parent.title);
   res.data.list = this.renderList(this.getCustomSkins(), req.action);
   res.data.body = this.renderSkinAsString("main");
   res.handlers.site.renderSkin("page");
   return;
};

// FIXME: i'd like to have this by default (ie. always safe)
Skins.prototype.safe_action = function() {
   res.data.title = this._parent.title;
   res.data.list = this.renderList(this.modified);
   res.data.body = this.renderSkinAsString("main");
   this.renderSkin("page");
   return;
};

Skins.getPrototypeOptions = function() {
   var prototypes = [];
   for (var name in app.skinfiles) {
      if (name.charCodeAt(0) < 91 && name !== "CVS") {
         if ((name === "Admin" || name === "Root") && 
               res.handlers.site !== root) {
            continue;
         }
         prototypes.push({value: name, display: name});
      }
   }
   return prototypes.sort(new String.Sorter("display"));
};

/* FIXME: check if HopObject.remove / Skin.remove do their jobs
Skins.remove = function() {
   for (var i=0; i<this.size(); i+=1) {
      var proto = this.get(i);
      for (var j=proto.size(); j>0; j-=1) {
         this.deleteSkin(proto.get(j-1));
      }
   }
   return;
};
*/

Skins.prototype.getSkin = function(prototype, name) {
   var skins = this.get(prototype);
   return skins ? skins.get(name) : null;
};

Skins.prototype.getSkinSource = function(proto, name) {
   var skin;
   if (skin = this.getSkin(proto, name)) {
res.debug(skin._id);
      return skin.getSource();
   }
   
   var layout = this._parent;
   while (layout = layout.parent) {
      if (skin = layout.skins.getSkin(proto, name)) {
res.debug(skin._id);
         return skin.getSource();
      }
   }

   if (app.skinfiles[proto]) {
      return app.skinfiles[proto][name];
   }
   return null;
};

Skins.prototype.getOriginalSkin = function(proto, name) {
   var skin;
   var layout = this._parent;
   while (layout = layout.parent) {
      if (skin = layout.skins.getSkin(proto, name)) {
         return skin;
      }
   }
   return null;
};

Skins.prototype.getOriginalSkinSource = function(proto, name) {
   var skin;
   if (skin = this.getOriginalSkin(proto, name)) {
      return skin.getSource();
   }
   if (app.skinfiles[proto]) {
      return app.skinfiles[proto][name];
   }
   return null;
};

Skins.prototype.getCustomSkins = function() {
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
Skins.prototype.dumpToZip = function(z, fullExport) {
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
               z.addData(new java.lang.String(skin.getSource()).getBytes("UTF-8"),
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

Skins.prototype.evalImport = function(data) {
   var proto, buf, name;
   for (var protoName in data) {
      proto = data[protoName];
      for (var fileName in proto) {
         name = fileName.substring(0, fileName.lastIndexOf("."));
         // FIXME: replace session.user with a more intelligent solution ...
         var s = new Skin(this._parent, protoName, name, session.user);
         buf = data[protoName][fileName].data;
         s.setSource(new java.lang.String(buf, 0, buf.length, "UTF-8"));
         this.add(s);
      }
   }
   return true;
};

Skins.prototype.renderTree = function(data, collection) {
   var self = this;
   
   var renderBranches = function(skinset) {
      res.push();
      var param;
      for (var i in skinset.skins) {
         param = {
            key: skinset.skins[i], 
            skinset: skinset.key
         };
         var parts = param.key.split(".");
         var skin = self.getSkin(parts[0], parts[1]);
         if (skin) {
            skin.renderSkin("Skin#listItem");
         } else {
         }
         var description = Skins.getSummary("skin", parts[0], parts[1]);
         param.title = description[0];
         param.text = description[1];
      }
      return res.pop();
   };

   res.push();
   if (!collection) {
      collection = Skins.SKINSETS;
   }
   var skinset, description, param;
   for (var i in collection) {
      skinset = collection[i];
      if (skinset.context && skinset.context.toLowerCase() !== 
            res.handlers.site._prototype.toLowerCase()) {
         continue;
      }
      description = Skins.getSummary("skinset", skinset.key);
      param = {
         skinset: skinset.key, 
         anchor: skinset.key, 
         "class": "closed",
         title: description[0],
         text: description[1]
      };
      if (data.skinset && data.skinset.startsWith(skinset.key)) {
         param["class"] = "selected";
         if (skinset.skins) {
            param.skins = renderBranches(skinset);
         }
         param.skinset = param.skinset.substring(0, param.skinset.indexOf("."));
         if (skinset.children) {
            param.children = this.renderTree(data, skinset.children);
         }
      }
      this.renderSkin("treebranch", param);
   }
   return res.pop();
};

Skins.prototype.renderList = function(collection, action) {
   res.push();
   var param = {action: action};
   var list = (collection instanceof Array ? collection : collection.list());
   var skin;
   for (var i=0; i<list.length; i+=1) {
      skin = list[i];
      param.key = skin.proto + "." + skin.name;
      param.status = skin.renderSkinAsString("status");
      if (!skin.custom) {
         var desc = Skins.getSummary("skin", param.key);
         param.title = desc[0];
         param.text = desc[1];
      } else {
         param.title = param.key;
      }
      this.renderSkin("treeleaf", param);
   }
   return res.pop();
};

Skins.getSummary = function(prefix, prototype, name) {
   var key = prefix + "." + prototype;
   name && (key += "." + name);
   var languages = getLanguages();
   var lang;
   for (var i=0; i<languages.length; i+=1) {
      if (!(lang = app.data[languages[i]])) {
         continue;
      }
      if (lang.getProperty(key)) {
         return lang.getProperty(key).split("|");
      }
   }
   return [prototype + "." + name];
};

Skins.Skinset = function(key, skins, context) {
   this.key = key;
   this.skins = skins;
   this.context = context;
   this.children = [];
   this.add = function(obj) {
      this.children.push(obj);
   }
   return this;
};

Skins.SKINSETS = [];

new function() {
   var newSet = new Skins.Skinset("Root", ["Root.page", "Root.main", "Root.style", "Root.javascript", "Root.sysmgrnavigation", "Root.new"], "Root");
   newSet.add(new Skins.Skinset("Root.scripts", ["Root.systemscripts", "Global.colorpickerScripts"]));
   newSet.add(new Skins.Skinset("Root.sitelist", ["Site.preview", "Root.list"]));
   newSet.add(new Skins.Skinset("Root.rss", ["Root.rss", "Site.rssItem", "Site.rssResource", "Global.rssImage"]));
   newSet.add(new Skins.Skinset("Root.colorpicker", ["Global.colorpicker", "Global.colorpickerExt", "Global.colorpickerWidget", "Global.colorpickerScripts"]));
   newSet.add(new Skins.Skinset("Root.welcome", ["Site.welcome", "Site.welcomeowner", "Site.welcomesysadmin", "Root.welcome"]));
   newSet.add(new Skins.Skinset("Root.various", ["Root.blocked", "Root.notfound", "Root.sysError"]));
   Skins.SKINSETS.push(newSet);
   
   newSet = new Skins.Skinset("Site", ["Site.page", "Site.style", "Site.javascript", "Site.main", "Day.main", "Story.dayheader"]);
   newSet.add(new Skins.Skinset("Site.navigation", ["Site.contribnavigation", "Site.adminnavigation", "Global.nextpagelink", "Global.prevpagelink", "Global.pagenavigation", "Global.pagenavigationitem", "Members.statusloggedin", "Members.statusloggedout"]));
   newSet.add(new Skins.Skinset("Site.topics", ["TopicMgr.main", "Topic.main"]));
   newSet.add(new Skins.Skinset("Site.calendar", ["Site.calendar", "Site.calendardayheader", "Site.calendarweek", "Site.calendarday", "Site.calendarselday"]));
   newSet.add(new Skins.Skinset("Site.rss", ["Site.rss", "Story.rssItem", "Story.rssResource"]));
   newSet.add(new Skins.Skinset("Site.search", ["Site.searchresult", "Site.searchbox", "Story.searchview"]));
   newSet.add(new Skins.Skinset("Site.referrers", ["Site.referrers", "Site.referrerItem"]));
   newSet.add(new Skins.Skinset("Site.mostread", ["Site.mostread", "Story.mostread"]));
   newSet.add(new Skins.Skinset("Site.mails", ["Members.mailregconfirm", "Members.mailpassword", "Members.mailnewmember", "Membership.mailstatuschange", "Membership.mailmessage", "Site.notificationMail"], "Root"));
   newSet.add(new Skins.Skinset("Site.preferences", ["Site.edit", "Site.notification"], "Root"));
   newSet.add(new Skins.Skinset("Site.user", ["Members.login", "Members.register", "Members.sendpwd", "User.edit", "User.sitelist", "User.subscriptions", "Membership.subscriptionlistitem"], "Root"));
   newSet.add(new Skins.Skinset("Site.members", ["Members.main", "Members.new", "Members.membergroup", "Members.searchresult", "Members.searchresultitem", "Membership.mgrlistitem", "Membership.edit"], "Root"));
   newSet.add(new Skins.Skinset("Site.various", ["Site.robots"]));
   Skins.SKINSETS.push(newSet);
   
   newSet = new Skins.Skinset("Story", ["Story.display", "Story.main", "Story.preview", "Story.comment", "Story.historyview", "Story.embed", "Story.edit"]);
   newSet.add(new Skins.Skinset("Story.backlinks", ["Story.backlinks", "Story.backlinkItem"]));
   newSet.add(new Skins.Skinset("Story.list", ["StoryMgr.main", "Story.mgrlistitem"]));
   Skins.SKINSETS.push(newSet);
   
   newSet = new Skins.Skinset("Comment", ["Comment.toplevel", "Comment.reply", "Comment.edit"]);
   Skins.SKINSETS.push(newSet);
   
   newSet = new Skins.Skinset("Image", ["Image.main", "Image.edit", "ImageMgr.new", "LayoutImage.edit", "ImageMgr.main", "Image.mgrlistitem"]);
   Skins.SKINSETS.push(newSet);
   
   newSet = new Skins.Skinset("File", ["File.main", "File.edit", "FileMgr.new", "FileMgr.main", "File.mgrlistitem"]);
   Skins.SKINSETS.push(newSet);
   
   newSet = new Skins.Skinset("Poll", ["Poll.main", "Poll.results", "Choice.main", "Choice.result", "Choice.graph"]);
   newSet.add(new Skins.Skinset("Poll.editor", ["Poll.edit", "Choice.edit"]));
   newSet.add(new Skins.Skinset("Poll.list", ["PollMgr.main", "Poll.mgrlistitem"]));
   Skins.SKINSETS.push(newSet);
   
   newSet = new Skins.Skinset("SysMgr", ["SysMgr.status", "SysMgr.list", "Site.sysmgr_listitem", "Site.sysmgr_edit", "Site.sysmgr_delete", "User.sysmgr_listitem", "User.sysmgr_edit", "SysLog.sysmgr_listitem"], "Root");
   newSet.add(new Skins.Skinset("SysMgr.forms", ["SysMgr.setup", "SysMgr.sitesearchform", "SysMgr.usersearchform", "SysMgr.syslogsearchform"]));
   newSet.add(new Skins.Skinset("SysMgr.mails", ["SysMgr.blockwarnmail", "SysMgr.deletewarnmail"]));
   Skins.SKINSETS.push(newSet);
   
   newSet = new Skins.Skinset("SkinMgr", ["SkinMgr.main", "SkinMgr.page", "SkinMgr.edit", "SkinMgr.treebranch", "SkinMgr.treeleaf", "Skin.status", "Skin.statuscustom", "SkinMgr.new", "Skin.diff", "Skin.diffline"], "Root");
   Skins.SKINSETS.push(newSet);
   
   newSet = new Skins.Skinset("LayoutMgr", ["LayoutMgr.main", "LayoutMgr.new", "LayoutMgr.import"], "Root");
   newSet.add(new Skins.Skinset("LayoutMgr.layout", ["Layout.mgrlistitem", "Layout.main", "Layout.edit", "Layout.download", "Layout.chooserlistitem", "Layout.testdrive"]));
   newSet.add(new Skins.Skinset("LayoutMgr.images", ["LayoutImageMgr.main", "LayoutImageMgr.navigation", "LayoutImageMgr.new"]));
   Skins.SKINSETS.push(newSet);
   
   newSet = new Skins.Skinset("various", ["HopObject.delete"], "Root");
   Skins.SKINSETS.push(newSet);
};
