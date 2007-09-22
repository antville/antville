relocateProperty(Image, "alias", "name");
relocateProperty(Image, "createtime", "created");
relocateProperty(Image, "modifytime", "modified");
relocateProperty(Image, "fileext", "contentType");
relocateProperty(Image, "filesize", "contentLength");
relocateProperty(Image, "alttext", "description")

delete Image.prototype.createtime_macro;
delete Image.prototype.modifytime_macro;

Image.getCompatibleFileName = function(image, fname) {
   var fileName;
   if (fileName = image.metadata.get("fileName")) {
      return (fname || fileName) + "." + image.metadata.get("fileType");
   } else {
      return fname || image.name;
   }
}

Image.prototype.getFile = function(fname) {
   return Image.getDirectory(Image.getCompatibleFileName(this, fname)); 
};

Image.prototype.getUrl = function(fname) {
   return Image.getUrl(fname || (Image.getCompatibleFileName(this))); 
};

Image.prototype.filename_macro = function() {
   return this.name;
};

Image.prototype.topicchooser_macro = function() {
   return Story.prototype.topicchooser_macro.apply(this, arguments);
};

Image.prototype.gallery_macro = function() {
   return Story.prototype.topic_macro.apply(this, arguments);
};

Image.prototype.topic_macro = Image.prototype.gallery_macro;

Image.prototype.alttext_macro = function(param) {
   if (param.as == "editor")
      Html.textArea(this.createInputParam("alttext", param));
   else
      res.write(this.alttext);
   return;
};


Image.prototype.show_macro = function(param) {
   if (param.as === "thumbnail" && this.thumbnail) {
      res.push();
      this.thumbnail.render_macro(param);
      this.link_filter(res.pop(), param, this.href());
   } else {
      this.render_macro(param);
   }
   return;
};

Image.prototype.editlink_macro = function(param) {
   if (this._parent.getContext() === "Layout" && path.layout !== this.parent) {
      return;
   }
   if (session.user) {
      try {
         this.checkEdit(session.user, res.data.memberlevel);
      } catch (deny) {
         return;
      }
      Html.openLink({href: this.href("edit")});
      if (param.image && this.parent.images.get(param.image))
         renderImage(this.parent.images.get(param.image), param);
      else
         res.write(param.text ? param.text : getMessage("generic.edit"));
      Html.closeLink();
   }
   return;
};

Image.prototype.deletelink_macro = function(param) {
   if (this.getContext() === "Layout" && path.Layout !== this.parent) {
      return;
   }
   if (session.user) {
      try {
         this.checkDelete(session.user, res.data.memberlevel);
      } catch (deny) {
         return;
      }
      Html.openLink({href: this.href("delete")});
      if (param.image && this.site.images.get(param.image))
         renderImage(this.site.images.get(param.image), param);
      else
         res.write(param.text ? param.text : getMessage("generic.delete"));
      Html.closeLink();
   }
   return;
};

Image.prototype.replacelink_macro = function(param) {
   if (this.layout && path.Layout != this.layout) {
      if (session.user) {
         try {
            path.Layout.images.checkAdd(session.user, res.data.memberlevel);
         } catch (deny) {
            return;
         }
         Html.openLink({href: path.Layout.images.href("create") + "?alias=" + this.alias});
         if (param.image && this.site.images.get(param.image))
            renderImage(this.site.images.get(param.image), param);
         else
            res.write(param.text ? param.text : getMessage("generic.replace"));
         Html.closeLink();
      }
      return;
   }
   return;
};

Image.prototype.getPopupUrl = function() {
   res.push();
   res.write("javascript:openPopup('");
   res.write(this.getStaticUrl());
   res.write("',");
   res.write(this.width);
   res.write(",");
   res.write(this.height);
   res.write(");return false;");
   return res.pop();
};
