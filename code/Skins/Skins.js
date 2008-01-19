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

Skins.prototype.constructor = function(name, parent) {
  this.name = name; 
  this.parent = parent;
  return this;
}

Skins.prototype.getPermission = function(action) {
   return res.handlers.layout.getPermission("main");
};

Skins.prototype.getChildElement = function(name) {
   return new Skins(name, this);
};

// FIXME: It's not totally clear why this is necessary;
// but somehow Helma does not provide the correct path...
// FIXME 2: Probably obsolete thanks to a custom Layout.href() method
/*
Skins.prototype.href = function(action) {
   res.push();
   res.write(res.handlers.site.href());
   res.write("layout/skins/");
   action && (res.write(action));
   return res.pop();
};
*/

Skins.prototype.main_action = function() {
   var offset = Array.prototype.indexOf.call(path, res.handlers.site);
   var skins = path[offset + 2];
   var group = path[offset + 3];
   if (!group) {
      res.data.list = this.getOutline();
      res.data.title = gettext("Skins of {0}", res.handlers.site.title);
      res.data.body = this.renderSkinAsString("main");
      res.handlers.site.renderSkin("Site#page");
      return;
   }
   var skin = path[offset + 4] || res.redirect(res.handlers.layout.skins.href());
   skin = new Skin(group.name, skin.name); 
   skin.edit_action();
   return;
};

Skins.prototype.getOutline = function(type) {
   var key = "outline:" + type;
   var outline = this.cache[key];
   if (outline) {
      return outline;
   }

   var prototype, skin, subskins, names, skins = [];
   var options = Skin.getPrototypeOptions();

   for each (var option in options) {
      prototype = option.value;
      names = [];
      for (var name in app.skinfiles[prototype]) {
         if (name === prototype && type !== "custom") {
            skin = createSkin(app.skinfiles[prototype][name]);
            subskins = skin.getSubskinNames();
            for each (var subskin in subskins) {
               names.push(subskin);
            }
         } else if (name !== prototype && type === "custom") {
            names.push(name);
         }
      }
      names.sort();
      skins.push([prototype, names]);
   }

   res.push();
   html.openTag("ul");
   for each (var item in skins) {
      prototype = item[0];
      skins = item[1];
      if (skins && skins.length > 0) {
         html.openTag("a", {name: prototype, id: prototype});
         html.closeTag("a");
         html.openTag("li");
         res.write(prototype);
         html.openTag("ul");
         for each (var subskin in skins) {
            skin = this.getSkin(prototype, subskin) || 
                  new Skin(prototype, subskin);
            skin.renderSkin("Skin#skins");
         }
         html.closeTag("ul");
         html.closeTag("li");
      }
   }
   html.closeTag("ul");
   return this.cache[key] = res.pop();
 };

Skins.prototype.create_action = function() {
   var skin = new Skin(req.data.prototype, req.data.name);
   if (req.postParams.save) {
      try {
         if (!skin.equals(req.postParams.source)) {
            skin.setSource(req.postParams.source);
            this.add(skin);
         }
         res.message = gettext("The changes were saved successfully.");
         if (req.postParams.save == 1) {
            res.redirect(skin.href("edit"));
         } else {
            res.redirect(Skins.getRedirectUrl(req.postParams));
         }
      } catch (ex) {
         res.message = ex;
         app.log(ex);
      }
   } else {
      if (skin.getSource()) {
         res.data.title = gettext("Edit skin {0}.{1} of layout {2}", 
               skin.prototype, skin.name, res.handlers.layout.name);
      } else {
         res.data.title = gettext('Create a custom skin for layout "{0}"', 
               this._parent.title);
      }
   }
   res.data.action = this.href(req.action);
   res.data.body = skin.renderSkinAsString("Skin#edit");
   this.renderSkin("Site#page");
   return;
};

Skins.prototype.modified_action = function() {
   res.data.title = gettext("Modified skins of {0}", this._parent.title);
   res.push();
   this.modified.forEach(function() {
      this.renderSkin("Skin#skins");
   });
   res.data.list = res.pop();
   res.data.body = this.renderSkinAsString("main");
   res.handlers.site.renderSkin("Site#page");
   return;
};

Skins.prototype.custom_action = function() {
   res.data.title = gettext("Custom skins of {0}", this._parent.title);
   res.data.list = this.getOutline("custom");
   res.data.body = this.renderSkinAsString("main");
   res.handlers.site.renderSkin("Site#page");
   return;
};

// FIXME: i'd like to have this by default (ie. always safe)
Skins.prototype.safe_action = function() {
   res.data.title = this._parent.title;
   res.data.list = this.renderList(this.modified);
   res.data.body = this.renderSkinAsString("main");
   this.renderSkin("Site#page");
   return;
};

Skins.prototype.getSkin = function(prototype, name) {
   var skinset = this.get(prototype);
   return skinset ? skinset.get(name) : null;
};

Skins.prototype.getSkinSource = function(proto, name) {
   var skin;
   if (skin = this.getSkin(proto, name)) {
      return skin.getSource();
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

Skins.getRedirectUrl = function(data) {
   var href = res.handlers.layout.skins.href();
   if (data.prototype) { 
      return href + "#" + data.prototype;
   }
   return href;
};

Skins.getSummary = function(prefix, prototype, name) {
   var key = prefix + "." + prototype;
   name && (key += "." + name);
   var languages = new Array("en");
   var syslang;
   if ((syslang = root.getLocale().getLanguage()) != "en")
      languages.unshift(syslang);
   if (res.handlers.site) {
      var lang = res.handlers.site.getLocale().getLanguage();
      if (lang != "en" && lang != syslang)
         languages.unshift(lang);
   }
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

Skins.buildMacroHelp = function() {
   var sorter = function(a, b) {
      var str1 = a.name.toLowerCase();
      var str2 = b.name.toLowerCase();
      if (str1 > str2)
         return 1;
      else if (str1 < str2)
         return -1;
      return 0;
   }

   var macroHelp = {};
   var ref = macroHelp.Global = [];
   var macrolist = HELP.macros.Global;
   for (var i in macrolist)
      ref.push({name: i, storyid: macrolist[i]});
   ref.sort(sorter);

   var ref = macroHelp.HopObject = [];
   var macrolist = HELP.macros.HopObject;
   for (var i in macrolist)
      ref.push({name: i, storyid: macrolist[i]});
   ref.sort(sorter);

   for (var proto in HELP.macros) {
      if (proto.indexOf("_") == 0 || proto == "Global" || proto == "HopObject")
         continue;
      var macrolist = HELP.macros[proto];
      var ref = macroHelp[proto] = [];
      var keys = "";
      for (var i in macrolist) {
         ref.push({name: i, storyid: macrolist[i]});
         keys += i + ",";
      }
      for (var n in macroHelp.HopObject) {
         var shared = macroHelp.HopObject[n];
         if (keys.indexOf(shared.name + ",") < 0)
            ref.push(shared);
      }
      ref.sort(sorter);
   }
   return macroHelp;
};

Skins.remove = function() {
   if (this.constructor === Skins) {
      this.forEach(function() {
         HopObject.remove(this);         
      });
   }
   return;
};
