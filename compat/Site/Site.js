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

// FIXME: We need something like this for plug-ins:
//addPermission(Site, "menuext", function() {return true;});

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

// FIXME: obsolete?
Site.prototype.renderStoryList = function(day) {
   res.push();
   list_macro(param, "stories");
   res.write(res.pop());
   return;
}

Site.prototype.rss_action = function() {
   if (req.queryParams.show === "all") {
      return res.redirect(this.href("rss.xml"))
   }
   return res.redirect(this.href("stories.xml"));
}

//Site.prototype.feeds_action = function() {
//   return disableAction.call(this, "Feeds are currently not available");
//}

Site.prototype.mostread_action = function() {
   return res.redirect(this.stories.href("top"));
}

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
   return res.handlers.membership.status_macro();
}

Site.prototype.navigation_macro = function(param) {
   var group;
   var navigation = {};
   navigation.contributors = this.renderSkinAsString("Site#contribnavigation");
   navigation.admins = this.renderSkinAsString("Site#adminnavigation");
   if (!navigation.contributors && !navigation.admins && !res.meta.navigation) {
      res.meta.navigation = true;
      this.renderSkin("Site#navigation");
   } else if ((group = param["for"]) && navigation[group]) {
      if (group === "contributors" && this.stories.getPermission("create")) {
         res.write(navigation.contributors);
      } else if (group === "admins" && this.getPermission("edit")) {
         res.write(navigation.admins);
      }
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
      res.write(param.yes || "yes");
   } else { 
      res.write(param.no || "no");
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
      res.write(this.mode === Site.OPEN ? "yes" : "no");
   }
   return;
}

Site.prototype.hasdiscussions_macro = function(param) {
   if (param.as === "editor") {
      this.checkbox_macro(param, "commentMode");
   } else {
      res.write(this.commentsMode === Comment.ONLINE ? "yes" : "no");
   }
   return;
}

Site.prototype.showarchive_macro = function(param) {
   if (param.as === "editor") {
      this.checkbox_macro(param, "archiveMode");
   } else {
      res.write(this.archiveMode === Site.PUBLIC ? "yes" : "no");
   }
   return;
}

Site.prototype.enableping_macro = function(param) {
   if (param.as === "editor") {
      this.checkbox_macro(param, "callbackMode");
   } else {
      res.write(this.callbackMode === Site.ENABLED ? "yes" : "no");
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

Site.prototype.history_macro = function(param, type) {
   param.skin || (param.skin = "Story#history");
   var type = isNaN(param.show) ? param.show : "postings";
   var limit = Math.min(param.limit || parseInt(param.show) || 10, 50);
   delete param.show;
   delete param.limit;
   return list_macro(param, type, limit);
}

Site.prototype.membercounter_macro = function(param) {
   return this.members.size();
}

Site.prototype.preferences_macro = function(param) {
   if (param.as === "editor") {
      // FIXME: Site.metadata is now a collection!
      var inputParam = this.metadata.createInputParam(param.name, param);
      delete inputParam.part;
      if (param.cols || param.rows) {
         html.textArea(inputParam);
      } else {
         html.input(inputParam);
      }
   } else {
      res.write(this.getMetadata(param.name));
   } return;
}

Site.prototype.listReferrers_macro = function(param) {
   return this.referrers_macro(param);
}

Site.prototype.searchbox_macro = function(param) {
   if (this.getPermission("search")) {
      this.renderSkin("Site#search");
   }
   return;
}

// FIXME: working?
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
         html.openLink({href: collection.href() + "/" +
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
