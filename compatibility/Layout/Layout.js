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
   if (param.as == "editor")
      Html.input(this.createInputParam("title", param));
   else {
      if (param.linkto) {
         Html.openLink({href: this.href(param.linkto == "main" ? "" : param.linkto)});
         res.write(this.title);
         Html.closeLink();
      } else
         res.write(this.title);
   }
   return;
};

Layout.prototype.description_macro = function(param) {
   if (param.as == "editor")
      Html.textArea(this.createInputParam("description", param));
   else if (this.description) {
      if (param.limit)
         res.write(this.description.clip(param.limit, "...", "\\s"));
      else
         res.write(this.description);
   }
   return;
};

Layout.prototype.parent_macro = function(param) {
   if (param.as == "editor") {
      this._parent.renderParentLayoutChooser(this, param.firstOption);
   } else if (this.parent)
      return this.parent.title;
   return;
};

Layout.prototype.testdrivelink_macro = function(param) {
   if (this.isDefaultLayout())
      return;
   Html.link({href: this.href("startTestdrive")},
             param.text ? param.text : getMessage("Layout.test"));
   return;
};

Layout.prototype.deletelink_macro = function(param) {
   if (this.isDefaultLayout() || this.sharedBy.size() > 0)
      return;
   Html.link({href: this.href("delete")},
             param.text ? param.text : getMessage("generic.delete"));
   return;
};

Layout.prototype.activatelink_macro = function(param) {
   if (this.isDefaultLayout())
      return;
   Html.link({href: this._parent.href() + "?activate=" + this.alias},
             param.text ? param.text : getMessage("Layout.activate"));
   return;
};

Layout.prototype.bgcolor_macro = function(param) {
   if (param.as == "editor")
      Html.input(this.metadata.createInputParam("bgcolor", param));
   else
      renderColor(this.metadata.get("bgcolor"));
   return;
};

Layout.prototype.textfont_macro = function(param) {
   if (param.as == "editor") {
      param.size = 40;
      Html.input(this.metadata.createInputParam("textfont", param));
   } else
      res.write(this.metadata.get("textfont"));
   return;
};

Layout.prototype.textsize_macro = function(param) {
   if (param.as == "editor")
      Html.input(this.metadata.createInputParam("textsize", param));
   else
      res.write(this.metadata.get("textsize"));
   return;
};

Layout.prototype.textcolor_macro = function(param) {
   if (param.as == "editor")
      Html.input(this.metadata.createInputParam("textcolor", param));
   else
      renderColor(this.metadata.get("textcolor"));
   return;
};

Layout.prototype.linkcolor_macro = function(param) {
   if (param.as == "editor")
      Html.input(this.metadata.createInputParam("linkcolor", param));
   else
      renderColor(this.metadata.get("linkcolor"));
   return;
};

Layout.prototype.alinkcolor_macro = function(param) {
   if (param.as == "editor")
      Html.input(this.metadata.createInputParam("alinkcolor", param));
   else
      renderColor(this.metadata.get("alinkcolor"));
   return;
};

Layout.prototype.vlinkcolor_macro = function(param) {
   if (param.as == "editor")
      Html.input(this.metadata.createInputParam("vlinkcolor", param));
   else
      renderColor(this.metadata.get("vlinkcolor"));
   return;
};

Layout.prototype.titlefont_macro = function(param) {
   if (param.as == "editor") {
      param.size = 40;
      Html.input(this.metadata.createInputParam("titlefont", param));
   } else
      res.write(this.metadata.get("titlefont"));
   return;
};

Layout.prototype.titlesize_macro = function(param) {
   if (param.as == "editor")
      Html.input(this.metadata.createInputParam("titlesize", param));
   else
      res.write(this.metadata.get("titlesize"));
   return;
};

Layout.prototype.titlecolor_macro = function(param) {
   if (param.as == "editor")
      Html.input(this.metadata.createInputParam("titlecolor", param));
   else
      renderColor(this.metadata.get("titlecolor"));
   return;
};

Layout.prototype.smallfont_macro = function(param) {
   if (param.as == "editor") {
      param.size = 40;
      Html.input(this.metadata.createInputParam("smallfont", param));
   } else
      res.write(this.metadata.get("smallfont"));
   return;
};

Layout.prototype.smallsize_macro = function(param) {
   if (param.as == "editor")
      Html.input(this.metadata.createInputParam("smallsize", param));
   else
      res.write(this.metadata.get("smallsize"));
   return;
};

Layout.prototype.smallcolor_macro = function(param) {
   if (param.as == "editor")
      Html.input(this.metadata.createInputParam("smallcolor", param));
   else
      renderColor(this.metadata.get("smallcolor"));
   return;
};
