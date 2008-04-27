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

relocateProperty(Site, "alias", "name");
relocateProperty(Site, "createtime", "created");
relocateProperty(Site, "modifytime", "modified");
relocateProperty(Site, "showdays", "pageSize");

addPropertyMacro(Site, "tagline");
addPropertyMacro(Site, "email");

Site.prototype.__defineGetter__("online", function() {
   return this.mode === Site.PUBLIC;
});

Site.prototype.__defineSetter__("online", function(value) {
   this.mode = Site.PUBLIC;
   return;
});

Site.prototype.__defineGetter__("blocked", function() {
   return this.status === Site.BLOCKED;
});

Site.prototype.__defineGetter__("trusted", function() {
   return this.status === Site.TRUSTED;
});

Site.prototype.__defineGetter__("discussions", function() {
   return this.commentsMode === Comment.ONLINE;
});

/*
Site.prototype.renderSkin = function(name) {
   switch (name) {
      case "stylesheet":
      name = "style"; break;
      case "Site#main":
      name = "main"; break;
   }
   HopObject.prototype.renderSkin.call(this, name);
}
*/

// FIXME: We need something like this for plug-ins:
//addPermission(Site, "menuext", function() {return true;});

Site.prototype.menuext_action = function() {
   return this.renderSkin("menuext");
}

Site.prototype.menuext_reg_action = function() {
   res.contentType = "text/plain";
   return this.renderSkin("menuext.reg");
}

Site.prototype.colorpicker_action = function() {
   res.handlers.site = this;
   return root.colorpicker_action();
}

Site.prototype.rss_action = function() {
   if (req.queryParams.show === "all") {
      return res.redirect(this.href("rss.xml"))
   }
   return res.redirect("stories.xml");
}

Site.prototype.feeds_action = function() {
   return disableAction.call(this, "Feeds are currently not available");
}

Site.prototype.mostread_action = function() {
   return res.redirect(this.stories.href("top"));
}

//Site.prototype.skin_macro = Skin.compatibleMacro; 
// FIXME: Define the function if the above does not work reliably
//function() {
//   return Skin.rename.apply(this, arguments);
//}

Site.prototype.link_macro = function(param, url, text) {
   param.text || (param.text = text);
   if (!param.to) {
      param.to = url || ".";
   } else if (param.to.contains(":")) {
      link_macro.call(global, param, param.to, param.text);
      return;
   }
   var handler;
   var parts = param.to.split("/");
   var action = parts[0];
   switch (action) {
      case "mostread":
      handler = this.stories;
      param.to = "top"; break;
      
      case "layouts":
      action = ".";
      handler = this.layout;
      param.text = gettext("Layout");
      param.to = "."; break;

      case "topics":
      //case "feeds":
      case "files":
      case "images":
      case "members":
      case "polls":
      case "stories":
      handler = this[action];
      if (!handler) {
         return;
      }
      param.to = parts[1]; break;
      
      default:
      handler = this;
   }
   HopObject.prototype.link_macro.call(handler, param, param.to, param.text);
   return;
}

Site.prototype.title_macro = function(param) {
   if (param.as === "editor") {
      this.input_macro(param, "title");
   } else {
      var title = this.title;
      if (param.linkto) {
         if (param.linkto === "main") {
            param.linkto = ".";
         }
         res.write(this.link_filter(title, param, param.linkto));
      } else {
         res.write(title);
      }
   }
   return;
}

Site.prototype.loginstatus_macro = function(param) {
   return res.handlers.membership.status_macro(param);
   
   if (session.user) {
      (new Skin("Members", "statusloggedin").getSource()) ?
            this.members.renderSkin("statusloggedin") :
            res.handlers.membership.renderSkin("Membership#status");
   } else if (req.action !== "login") {
      (new Skin("Members", "statusloggedout").getSource()) ?
            this.members.renderSkin("statusloggedout") :
            res.handlers.membership.renderSkin("Membership#login");
   }
   return;
}

Site.prototype.navigation_macro = function(param) {
   var navigation = {};
   navigation.contributors = this.renderSkinAsString("Site#contribnavigation");
   navigation.admins = this.renderSkinAsString("Site#adminnavigation");
   if (!navigation.contributors && !navigation.admins && !res.meta.navigation) {
      res.meta.navigation = true;
      this.renderSkin("Site#navigation");
   } else {
      param["for"] && res.write(navigation[param["for"]]);
   }
   return;
}

Site.prototype.xmlbutton_macro = function(param) {
   param.linkto = this.href("rss.xml");
   image_macro(param, "/xmlbutton.gif");
   return;
}

Site.prototype.lastupdate_macro = function(param) {
   var value;
   if (value = this.modified) {
      res.write(formatDate(value, param.format));
   }
   return;
}

Site.prototype.online_macro = function(param) {
   var online = true;
   var value = this.mode;
   if (value === Site.PRIVATE || value === Site.CLOSED) {
      online = false;
   }
   if (param.as === "editor") {
      param.name = "online";
      param.value = "true";
      if (req.isPost()) {
         param.selectedValue = req.postParams.online;
      } else {
         param.selectedValue = String(online);      
      }
      //res.debug(param.name + ": " + param.value + "/" + param.selectedValue);
      return html.checkBox(param);
   } else if (online) {
      res.write(param.yes || gettext("yes"));
   } else { 
      res.write(param.no || gettext("no"));
   }
   return;
}

Site.prototype.usermaycontrib_macro = function(param) {
   if (param.as === "editor") {
      param.name = "usermaycontrib";
      param.value = "true";
      if (req.isPost()) {
         param.selectedValue = req.postParams.usermaycontrib;
      } else {
         param.selectedValue = String(this.mode === Site.OPEN);
      }
      return html.checkBox(param);
   } else {
      res.write(this.mode === Site.OPEN ? gettext("yes") : gettext("no"));
   }
   return;
}

Site.prototype.hasdiscussions_macro = function(param) {
   if (param.as === "editor") {
      this.checkbox_macro(param, "commentMode");
   } else {
      res.write(this.commentsMode === Comment.ONLINE ? 
            gettext("yes") : gettext("no"));
   }
   return;
}

Site.prototype.showarchive_macro = function(param) {
   if (param.as === "editor") {
      this.checkbox_macro(param, "archiveMode");
   } else {
      res.write(this.archiveMode === Site.PUBLIC ? 
            gettext("yes") : gettext("no"));
   }
   return;
}

Site.prototype.enableping_macro = function(param) {
   if (param.as === "editor") {
      this.checkbox_macro(param, "webHookMode");
   } else {
      res.write(this.webHookMode === Site.ENABLED ? 
            gettext("yes") : gettext("no"));
   }
   return;
}

Site.prototype.longdateformat_macro = function(param) {
   return Site.renderDateFormat("long", this, param);
}

Site.prototype.shortdateformat_macro = function(param) {
   return Site.renderDateFormat("short", this, param);
}

Site.prototype.localechooser_macro = function(param) {
   return this.select_macro(param, "locale");
}

Site.prototype.timezonechooser_macro = function(param) {
   return this.select_macro(param, "timeZone");
}

Site.prototype.layoutchooser_macro = function(param) {
   return; // this.select_macro(param, "layout");
}

Site.prototype.history_macro = function(param, type) {
   //param.skin = "Story#history";
   //return list_macro(param, "postings");
   
   param.limit = Math.min(param.limit || 10, 20);
   type || (type = param.show);
   var stories = this.stories.recent;
   var size = stories.size();
   var counter = i = 0;
   var item;
   while (counter < param.limit && i < size) {
      if (i % param.limit === 0) {
         stories.prefetchChildren(i, param.limit);
      }
      item = stories.get(i);
      i += 1;
      switch (item.constructor) {
         case Story:
         if (type === "comments") {
            continue;
         } break;
         
         case Comment:
         if (type === "stories" || item.story.mode === Story.PRIVATE ||
               item.story.commentsMode === Story.CLOSED || 
               this.commentsMode === Site.DISABLED) {
            continue;
         } break;
      }
      item.renderSkin("Story#history");
      counter += 1;
   }
   return;
}

Site.prototype.membercounter_macro = function(param) {
   return this.members.size();
}

Site.prototype.preferences_macro = function(param) {
   if (param.as === "editor") {
      var inputParam = this.metadata.createInputParam(param.name, param);
      delete inputParam.part;
      if (param.cols || param.rows) {
         html.textArea(inputParam);
      } else {
         html.input(inputParam);
      }
   } else {
      res.write(this.metadata.get(param.name));
   } return;
}

Site.prototype.monthlist_macro = function(param) {
   if (!this.stories.size() || this.archiveMode !== Site.PUBLIC) {
      return;
   }
   var collection = this.archive;
   var size = Math.min(collection.size(), param.limit || Infinity);
   for (var i=0; i<size; i+=1) {
      var curr = collection.get(i);
      var next = collection.get(i+1);
      if (!next || next.groupname.substring(0, 6) < 
            curr.groupname.substring(0, 6)) {
         res.write(param.itemprefix);
         html.openLink({href: collection.href() + 
               formatDate(curr.groupname.toDate("yyyyMMdd"), "yyyy/MM/dd")});
         var ts = curr.groupname.substring(0, 6).toDate("yyyyMM", 
               this.getTimeZone());
         res.write(formatDate(ts, param.format || "MMMM yyyy"));
         html.closeLink();
         res.write(param.itemsuffix);
      }
   }
   return;
}

Site.prototype.spamfilter_macro = function(param) {
   var str = this.metadata.get("spamfilter");
   if (!str) {
      return;
   }
   var items = str.replace(/\r/g, "").split("\n");
   for (var i in items) {
      res.write('"');
      res.write(items[i]);
      res.write('"');
      if (i < items.length-1) {
         res.write(",");
      }
   }
   return;
}

Site.prototype.listReferrers_macro = function(param) {
   return this.referrers_macro(param);
}

Site.prototype.searchbox_macro = function(param) {
   this.renderSkin("$Site#search");
   return;
}

Site.renderDateFormat = function(type, site, param) {
   //param.size = 1;
   var key = type + "DateFormat";
   if (param.as === "chooser") {
      site.select_macro(param, key);
   } else if (param.as === "editor") {
      site.input_macro(param, key);
   } else {
      res.write(site[key]);
   }
   return;   
}

Site.prototype.renderStoryList = function(day) {
   res.push();
   list_macro(param, "stories");
   res.write(res.pop());
   return;
}
