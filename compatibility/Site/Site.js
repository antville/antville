relocateProperty(Site, "alias", "name");
relocateProperty(Site, "createtime", "created");
relocateProperty(Site, "modifytime", "modified");
relocateProperty(Site, "showdays", "pageSize");

addPropertyMacro(Site, "tagline");
addPropertyMacro(Site, "email");

delete Site.prototype.createtime_macro;
delete Site.prototype.modifytime_macro;

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

Site.prototype.title_macro = function(param) {
   if (param.as === "editor") {
      this.input_macro(param, "title");
   } else {
      var title = this.title;
      if (param.linkto) {
         if (param.linkto === "main") {
            param.linkto = "";
         }
         this.link_filter(title, param, param.linkto);
      } else {
         res.write(title);
      }
   }
   return;
};

Site.prototype.lastUpdate_macro = function(param) {
   var value;
   if (value = this.created) {
      res.write(formatDate(value, param.format));
   }
   return;
};

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
};

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
};

Site.prototype.hasdiscussions_macro = function(param) {
   if (param.as === "editor") {
      this.checkbox_macro(param, "commentsMode");
   } else {
      res.write(this.commentsMode === Comment.ONLINE ? 
            gettext("yes") : gettext("no"));
   }
   return;
};

Site.prototype.showarchive_macro = function(param) {
   if (param.as == "editor") {
      this.checkbox_macro(param, "archiveMode");
   } else {
      res.write(this.archiveMode === Site.ARCHIVE_ONLINE ? 
            gettext("yes") : gettext("no"));
   }
   return;
};

Site.prototype.enableping_macro = function(param) {
   if (param.as == "editor") {
      this.checkbox_macro(param, "webHookEnabled");
   } else {
      res.write(this.webHookEnabled === true ? gettext("yes") : gettext("no"));
   }
   return;
};

Site.prototype.longdateformat_macro = function(param) {
   return Site.renderDateFormat("long", this, param);
};

Site.prototype.shortdateformat_macro = function(param) {
   return Site.renderDateFormat("short", this, param);
};

Site.prototype.localechooser_macro = function(param) {
   return this.select_macro(param, "language");
   return;
};

Site.prototype.timezonechooser_macro = function(param) {
   return this.select_macro(param, "timeZone");
};

Site.prototype.layoutchooser_macro = function(param) {
   return this.select_macro(param, "layout");
};

Site.prototype.history_macro = function(param, type) {
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
         }
         break;
         case Comment:
         if (type === "stories" || item.story.mode === Story.PRIVATE ||
               item.story.commentsMode === Story.CLOSED || 
               this.commentsMode === Site.DISABLED) {
            continue;
         }
         break;
      }
      item.renderSkin("Story#history");
      counter += 1;
   }
   return;
};

Site.prototype.menuext_action = function() {
   this.renderSkin("menuext");
   return;
};

Site.prototype.menuext_reg_action = function() {
   res.contentType = "text/plain";
   this.renderSkin("menuext.reg");
   return;
};

Site.prototype.colorpicker_action = function() {
   res.handlers.site = this;
   root.colorpicker_action();
   return;
};

Site.prototype.rss_action = function() {
   return res.redirect("rss.xml");
};

Site.prototype.mostread_action = function() {
   return res.redirect(this.stories.href("top"));
};

Site.renderDateFormat = function(type, site, param) {
   param.size = 1;
   var key = type + "DateFormat";
   if (param.as === "chooser") {
      site.select_macro(param, key);
   } else if (param.as === "editor") {
      site.input_macro(param, key);
   } else {
      res.write(site[key]);
   }
   return;   
};

Site.prototype.xmlbutton_macro = function(param) {
   param.href = this.href("rss.xml");   
   Images.Default.render("xmlbutton", param);
   return;
};

Site.prototype.moduleNavigation_macro = function(param) {
   if (!param.module)
      return;
   this.applyModuleMethod(app.modules[param.module],
                          "renderSiteNavigation", param);
   return;
};

Site.prototype.modulePreferences_macro = function(param) {
   for (var i in app.modules)
      this.applyModuleMethod(app.modules[i], "renderPreferences", param);
   return;
};

Site.prototype.membercounter_macro = function(param) {
   return this.members.size();
};

Site.prototype.searchOccurrence_macro = function() {
   var options = [["", "anywhere"],
                  ["title", "in the title"],
                  ["text", "in the text"],
                  ["topic", "in the topic name"]];
   Html.dropDown({name: "o"}, options, req.data.o);
   return;
};

Site.prototype.searchCreatetime_macro = function() {
   var options = [["", "anytime"],
                  ["1", "the past month"],
                  ["2", "the past 2 months"],
                  ["4", "the past 4 months"],
                  ["6", "the past half year"],
                  ["12", "the past year"]];
   Html.dropDown({name: "ct"}, options, req.data.ct);
   return;
};

Site.prototype.preferences_macro = function(param) {
   if (param.as == "editor") {
      var inputParam = this.properties.createInputParam(param.name, param);
      delete inputParam.part;
      if (param.cols || param.rows)
         Html.textArea(inputParam);
      else
         Html.input(inputParam);
   } else
      res.write(this.properties.get(param.name));
   return;
};

Site.prototype.monthlist_macro = function(param) {
   if (!this.stories.size() || !this.metadata.get("archive"))
      return;
   var size = param.limit ? Math.min(this.size(), param.limit) : this.size();
   for (var i=0;i<size;i++) {
      var curr = this.get(i);
      var next = this.get(i+1);
      if (!next || next.groupname.substring(0, 6) < curr.groupname.substring(0, 6)) {
         res.write(param.itemprefix);
         Html.openLink({href: curr.href()});
         var ts = curr.groupname.substring(0, 6).toDate("yyyyMM", this.getTimeZone());
         res.write(formatTimestamp(ts, param.format ? param.format : "MMMM yyyy"));
         Html.closeLink();
         res.write(param.itemsuffix);
      }
   }
   return;
};

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
};

Site.prototype.searchbox_macro = function(param) {
   this.renderSkin("searchbox");
   return;
};

Site.prototype.notify_macro = function(param) {
   var notifyContributors = param.notifyContributors ? 
      param.notifyContributors : getMessage("Site.notifyContributors");
   var notifyAdmins = param.notifyAdmins ? 
      param.notifyAdmins : getMessage("Site.notifyAdmins");
   var notifyNobody = param.notifyNobody ? 
      param.notifyNobody : getMessage("Site.notifyNobody");

   var pref = this.properties.get("notify_" + param.event);
   if (param.as == "editor") {
      var options = new Array(notifyNobody, notifyAdmins, notifyContributors);
      Html.dropDown({name: "notify_" + param.event}, options, pref);
   } else {
      switch (pref) {
         case 2:
            return notifyContributors;
         case 1:
            return notifyAdmins;
         default:
            return notifyNobody;
      }
   }
   return;
};

Site.prototype.notification_macro = function(param) {
   if (this.isNotificationEnabled())
      this.renderSkin("notification");
   return;
};
