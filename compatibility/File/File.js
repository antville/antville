relocateProperty(Site, "createtime", "created");
relocateProperty(Site, "modifytime", "modified");

delete File.prototype.createtime_macro;
delete File.prototype.modifytime_macro;

File.getCompatibleFileName = function(file, name) {
   name || (name = file.name);
   return file.metadata.get("fileName") || name;
};

File.prototype.getFile = function() {
   return Site.getStaticFile("files/" + File.getCompatibleFileName(this));
};

File.prototype.getUrl = function() {
   return Site.getStaticUrl("files/" + File.getCompatibleFileName(this));
};

File.prototype.alias_macro = function(param) {
   if (param.as === "editor") {
      this.input_macro(param, "name");
   } else if (param.as === "link") {
      param.title = encodeForm(this.description);
      this.link_filter(this.name, param, this.href());
   } else {
      res.write(this.name);
   }
   return;
};

File.prototype.description_macro = function(param) {
   if (param.as === "editor") {
      this.input_macro(param, "description");
   } else {
      res.write(this.description);
   }
   return;
};

File.prototype.filesize_macro = function(param) {
   return this.contentLength_macro(param);
};

File.prototype.editlink_macro = function(param) {
   return this.link_macro(param, "edit", param.text || gettext("edit"));
};

File.prototype.deletelink_macro = function(param) {
   res.push();
   var image;
   if (param.image && (image = this.site.images.get(param.image))) {
      image.render_macro(param);
   } else {
      res.write(param.text || gettext("delete"));
   }
   return this.link_macro(param, "delete", res.pop());
};

File.prototype.viewlink_macro = function(param) {
   param.title = encodeForm(this.description);
   return this.link_macro(param, "view", param.text || gettext("view"))
};

File.prototype.mimetype_macro = function(param) {
   return res.write(this.contentType);
};

File.prototype.filetype_macro = function(param) {
   if (this.contentType) {
      res.write(this.contentType.substring(this.contentType.indexOf("/") + 1));
   } else {
      var i = this.name.lastIndexOf(".");
      if (i > -1) {
         res.write(this.name.substring(i+1, this.name.length));
      }
   }
   return;
};

File.prototype.clicks_macro = function(param) {
   if (!this.requests) {
      res.write(param.no || gettext("no downloads"));
   } else if (this.requests === 1) {
      res.write(param.one || gettext("one download"));
   } else {
      res.write(param.more || gettext("{0} downloads", this.requests));
   }
   return;
};
