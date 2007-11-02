relocateProperty(Layout, "alias", "name");
relocateProperty(Layout, "parent", "ancestor");
relocateProperty(Layout, "createtime", "created");
relocateProperty(Layout, "modifytime", "modified");

delete Layout.prototype.createtime_macro;
delete Layout.prototype.modifytime_macro;

Layout.prototype.__defineGetter__("shareable", function() {
   return this.mode === Layout.SHARED;
});

Layout.prototype.__defineSetter__("shareable", function(value) {
   this.mode = !!value ? Layout.SHARED : Layout.DEFAULT;
   return;
});

Layout.prototype.title_macro = function(param) {
   if (param.as === "editor") {
      this.input_macro(param, "title");
   } else if (param.linkto) {
      (param.linkto === "main") && (param.linkto = "");
      this.link_filter(this.title, param, param.linkto);
   } else {
      res.write(this.title);
   }
   return;
};

Layout.prototype.description_macro = function(param) {
   if (param.as == "editor") {
      this.textarea_macro(param, "description");
   } else if (this.description) {
      if (param.limit) {
         res.write(this.description.clip(param.limit, "...", "\\s"));
      } else {
         res.write(this.description);
      }
   }
   return;
};

Layout.prototype.parent_macro = function(param) {
   if (param.as === "editor") {
      this.select_macro(param, "parent");
   } else if (this.parent) {
      res.write(this.parent.title);
   }
   return;
};

Layout.prototype.shareable_macro = function(param) {
   if (param.as == "editor" && !this.site) {
      var inputParam = this.createCheckBoxParam("shareable", param);
      if (req.data.save && !req.data.shareable)
         delete inputParam.checked;
      Html.checkBox(inputParam);
   } else if (this.shareable)
      res.write(param.yes ? param.yes : getMessage("generic.yes"));
   else
      res.write(param.no ? param.no : getMessage("generic.no"));
   return;
};

Layout.prototype.testdrivelink_macro = function(param) {
   return this.link_macro(param, "test", param.text || gettext("test"));
};

Layout.prototype.deletelink_macro = function(param) {
   return this.link_macro(param, "delete", param.text || gettext("delete"));
};

Layout.prototype.activatelink_macro = function(param) {
   return this.link_macro(param, "activate", param.text || gettext("activate"));
};

Layout.prototype.value_macro = function(param, name, value) {
   if (!name) {
      return;
   }
   var key = "layout_" + name;
   if (!value) {
      if (value = this.metadata.get(name.toLowerCase())) {
         return value;
      }
      return res.meta[key];
   } else {
      //this.metadata.set(name.toLowerCase(), value);
      res.meta[key] = value;
   }
   return;
};

Layout.prototype.onUnhandledMacro = function(name) {
   res.write(name)
   // FIXME: editors?
   switch (name) {
      case "bgcolor":
      case "linkcolor":
      case "alinkcolor":
      case "vlinkcolor":
      case "titlecolor":
      case "textcolor":
      case "smallcolor":
      renderColor(this.metadata.get(name)); break;
      case "textfont":
      case "textsize":
      case "titlefont":
      case "titlesize":
      case "smallfont":
      case "smallsize":
      res.write(this.metadata.get(name)); break;
   }
   return;
}
