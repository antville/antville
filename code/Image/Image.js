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

/**
 * main action
 */
Image.prototype.main_action = function() {
   res.data.title = getMessage("Image.viewTitle", {imageAlias: this.alias});
   res.data.body = this.renderSkinAsString("main");
   res.handlers.context.renderSkin("page");
   return;
};


/**
 * edit action
 */
Image.prototype.edit_action = function() {
   if (req.data.cancel)
      res.redirect(this.href());
   else if (req.data.save) {
      res.message = this.evalImg(req.data, session.user);
      res.redirect(this.href());
   }

   res.data.action = this.href(req.action);
   res.data.title = getMessage("Image.editTitle", {imageAlias: this.alias});
   res.data.body = this.renderSkinAsString("edit");
   res.handlers.context.renderSkin("page");
   return;
};


/**
 * delete action
 */
Image.prototype.delete_action = function() {
   if (req.data.cancel)
      res.redirect(path.ImageMgr.href());
   else if (req.data.remove) {
      try {
         var url = this._parent.href();
         res.message = this._parent.deleteImage(this);
         res.redirect(url);
      } catch (err) {
         res.message = err.toString();
      }
   }

   res.data.action = this.href(req.action);
   res.data.title = getMessage("Image.deleteTitle", {imageAlias: this.alias});
   var skinParam = {
      description: getMessage("Image.deleteDescription"),
      detail: this.alias
   };
   res.data.body = this.renderSkinAsString("delete", skinParam);
   res.handlers.context.renderSkin("page");
   return;
};
/**
 * macro rendering alias of image
 */
Image.prototype.alias_macro = function(param) {
   if (param.as == "editor")
      Html.input(this.createInputParam("alias", param));
   else
      res.write(this.alias);
   return;
};

/**
 * macro rendering alternate text of image
 */
Image.prototype.alttext_macro = function(param) {
   if (param.as == "editor")
      Html.textArea(this.createInputParam("alttext", param));
   else
      res.write(this.alttext);
   return;
};

/**
 * macro renders the width of the image
 */
Image.prototype.width_macro = function(param) {
   res.write(this.width);
   return;
};

/**
 * macro renders the height of the image
 */
Image.prototype.height_macro = function(param) {
   res.write(this.height);
   return;
};

/**
 * macro rendering filesize
 */
Image.prototype.filesize_macro = function(param) {
   res.write((this.filesize / 1024).format("###,###") + " KB");
   return;
};

/**
 * macro renders the url to this image
 */
Image.prototype.url_macro = function(param) {
   res.write(this.getUrl());
   return;
};

/**
 * render a link to image-edit
 */
Image.prototype.editlink_macro = function(param) {
   if (session.user) {
      try {
         this.checkEdit(session.user, req.data.memberlevel);
      } catch (deny) {
         return;
      }
      Html.openLink({href: this.href("edit")});
      if (param.image && this.site.images.get(param.image))
         renderImage(this.site.images.get(param.image), param);
      else
         res.write(param.text ? param.text : getMessage("generic.edit"));
      Html.closeLink();
   }
   return;
};

/**
 * render a link to delete action
 */
Image.prototype.deletelink_macro = function(param) {
   if (session.user) {
      try {
         this.checkDelete(session.user, req.data.memberlevel);
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

/**
 * render the image-tag (link to main action if image
 * is a thumbnail)
 */
Image.prototype.show_macro = function(param) {
   var img = this;
   // if we have a thumbnail, display that
   if (param.as == "thumbnail" && this.thumbnail) {
      var url = this.href();
      img = this.thumbnail;
   } else
      var url = img.getUrl();
   delete param.what;
   delete param.as;
   param.src = img.getUrl();
   Html.openLink({href: url});
   renderImage(img, param);
   Html.closeLink();
   return;
};

/**
 * render the code for embedding this image
 */
Image.prototype.code_macro = function(param) {
   res.write("&lt;% ");
   res.write(this instanceof LayoutImage ? "layout.image" : "image");
   res.write(" name=\"" + this.alias + "\" %&gt;");
   return;
};

/**
 * render a link to delete action
 * calls image.deletelink_macro, but only
 * if the layout in path is the one this image
 * belongs to
 */
Image.prototype.replacelink_macro = function(param) {
   if (this.layout && path.Layout != this.layout) {
      if (session.user) {
         try {
            path.Layout.images.checkAdd(session.user, req.data.memberlevel);
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
/**
 * constructor function for image objects
 */
Image.prototype.constructor = function(creator) {
   this.creator = creator;
   this.createtime = new Date();
   return this;
};

/**
 * save image as file on local disk
 * but before check if image should be resized
 * @param Object uploaded image
 * @param Object File-Object representing the destination directory
 * @param Int maximum width
 * @param Int maximum height
 */
Image.prototype.save = function(rawimage, dir, maxWidth, maxHeight) {
   // determine filetype of image (one could do this also by checking the mimetype)
   this.fileext = evalImgType(rawimage.contentType);
   if (this.fileext == "ico") {
      // the image is an .ico, so we directory write it to disk and return
      rawimage.writeToFile(dir.getPath(), this.filename + "." + this.fileext);
      return true;
   }
   var img = new Helma.Image(rawimage.getContent());
   this.width = img.getWidth();
   this.height = img.getHeight();
   var resize = false;
   var hfact = 1;
   var vfact = 1;
   if (maxWidth && this.width > maxWidth) {
      hfact = maxWidth / this.width;
      resize = true;
   }
   if (maxHeight && this.height > maxHeight) {
      vfact = maxHeight / this.height;
      resize = true;
   }

   if (resize) {
      this.width = Math.ceil(this.width * (hfact < vfact ? hfact : vfact));
      this.height = Math.ceil(this.height * (hfact < vfact ? hfact : vfact));
      try {
         img.resize(this.width, this.height);
         if (rawimage.contentType == 'image/gif' || this.fileext == "gif")
            img.reduceColors(256);
      } catch (err) {
         throw new Exception("imageResize");
      }
   }
   // finally we try  to save the resized image
   try {
      if (resize)
         img.saveAs(dir.getPath() + "/" + this.filename + "." + this.fileext);
      else
         rawimage.writeToFile(dir.getPath(), this.filename + "." + this.fileext);
   } catch (err) {
      app.log("Error in image.save(): can't save image to "+dir);
      throw new Exception("imageSave");
   }
   var f = new Helma.File(dir.getPath(), this.filename + "." + this.fileext);
   this.filesize = f.getLength();
   return;
};


/**
 * function checks if new Image-parameters are correct ...
 * @param Obj Object containing the form values
 * @param Obj User-Object modifying this image
 * @return Obj Object containing two properties:
 *             - error (boolean): true if error happened, false if everything went fine
 *             - message (String): containing a message to user
 */
Image.prototype.evalImg = function(param, modifier) {
   this.alttext = param.alttext;
   this.modifier = modifier;
   this.modifytime = new Date();
   if (this.thumbnail) {
      this.thumbnail.alttext = this.alttext;
      this.thumbnail.modifytime = this.modifytime;
      this.thumbnail.modifier = this.modifier;
   }
   return new Message("update");
};


/**
 * function creates a thumbnail of this image
 * does nothing if the image uploaded is smaller than 100x100px
 * @param uploaded image
 * @return Boolean true in any case ...
 */

Image.prototype.createThumbnail = function(rawimage, dir) {
   var thumb = (this.site ? new Image(this.creator) : new LayoutImage(this.creator));
   thumb.site = this.site;
   thumb.layout = this.layout;
   thumb.filename = this.filename + "_small";
   thumb.save(rawimage, dir, THUMBNAILWIDTH);
   thumb.alttext = this.alttext;
   thumb.alias = this.alias;
   thumb.parent = this;
   this.thumbnail = thumb;
   return;
};

/**
 * return the call to the client-side popup-script
 * for image-object
 * @return String call of popup-script
 */
Image.prototype.getPopupUrl = function() {
   res.push();
   res.write("javascript:openPopup('");
   res.write(this.getUrl());
   res.write("',");
   res.write(this.width);
   res.write(",");
   res.write(this.height);
   res.write(");return false;");
   return res.pop();
};


/**
 * return the url of the image
 */
Image.prototype.getUrl = function() {
   res.push();
   this.site.staticUrl("images/");
   res.write(this.filename);
   res.write(".");
   res.write(this.fileext);
   return res.pop();
};

/**
 * return the image file on disk
 * @return Object File object
 */
Image.prototype.getFile = function() {
   return new Helma.File(this.site.getStaticPath(), this.filename + "." + this.fileext);
};


/**
 * dump an image to a zip file passed as argument
 * @return Object HopObject containing the metadata of the image(s)
 */
Image.prototype.dumpToZip = function(z) {
   var data = new HopObject();
   if (this.thumbnail)
      data.thumbnail = this.thumbnail.dumpToZip(z);
   data.alias = this.alias;
   data.filename = this.filename;
   data.fileext = this.fileext;
   data.width = this.width;
   data.height = this.height;
   data.alttext = this.alttext;
   data.createtime = this.createtime;
   data.modifytime = this.modifytime;
   data.exporttime = new Date();
   data.creator = this.creator ? this.creator.name : null;
   data.modifier = this.modifier ? this.modifier.name : null;
   var file = this.getFile();
   if (file.exists()) {
      // add the image file to the zip archive
      z.add(file, "images");
   }
   return data;
};
/**
 * permission check (called by hopobject.onRequest())
 * @param String name of action
 * @param Obj User object
 * @param Int Membership level
 * @return Obj Exception object or null
 */
Image.prototype.checkAccess = function(action, usr, level) {
   try {
      switch (action) {
         case "edit" :
            checkIfLoggedIn(this.href(req.action));
            this.checkEdit(usr, level);
            break;
         case "delete" :
            checkIfLoggedIn();
            this.checkDelete(usr, level);
            break;
      }
   } catch (deny) {
      res.message = deny.toString();
      res.redirect(this._parent.href());
   }
   return;
};

/**
 * check if user is allowed to edit an image
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return Obj Exception or null (if allowed)
 */
Image.prototype.checkEdit = function(usr, level) {
   if (this.creator != usr && (level & MAY_EDIT_ANYIMAGE) == 0)
      throw new DenyException("imageEdit");
   return;
};


/**
 * check if user is allowed to delete an image
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return Obj Exception or null (if allowed)
 */
Image.prototype.checkDelete = function(usr, level) {
   if (this.creator != usr && (level & MAY_DELETE_ANYIMAGE) == 0)
      throw new DenyException("imageDelete");
   return;
};
