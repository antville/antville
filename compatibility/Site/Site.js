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
