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
// $Revision:3338 $
// $LastChangedBy:piefke3000 $
// $LastChangedDate:2007-09-22 23:48:33 +0200 (Sat, 22 Sep 2007) $
// $URL$
//

Images.prototype.getPermission = function(action) {
   if (!this._parent.getPermission("main")) {
      return false;
   }
   switch (action) {
      case ".":
      case "main":
      case "create":
      return Site.require(Site.OPEN) || 
            Membership.require(Membership.CONTRIBUTOR) ||
            User.require(User.PRIVILEGED);
      case "all":
      case "default":
      case "additional":
      return Membership.require(Membership.MANAGER) ||
            User.require(User.PRIVILEGED);
   }
   return false;
};

Images.prototype.main_action = function() {
   var images = User.getMembership().images;
   res.data.list = renderList(images, "mgrlistitem", 10, req.queryParams.page);
   res.data.pager = renderPageNavigation(images, 
         this.href(req.action), 10, req.queryParams.page);
   res.data.title = gettext("Member images of {0}", this._parent.title);
   res.data.body = this.renderSkinAsString("Images#main");
   res.handlers.site.renderSkin("page");
   return;
};

Images.prototype.create_action = function() {
   var image = new Image;
   image.parent_type = this._parent._prototype;
   
   if (req.postParams.save) {
      try {
         image.update(req.postParams);
         this.add(image);
         res.message = gettext('The uploaded image was saved successfully. Its name is "{0}"', 
               image.name);
         session.data.referrer = null;
         res.redirect(image.href());
      } catch (ex) {
         res.message = ex.toString();
         app.log(ex);
      }
   }

   res.data.action = this.href(req.action);
   res.data.title = gettext("Add image to {0}", this._parent.title);
   res.data.body = image.renderSkinAsString("Image#form");
   res.handlers.site.renderSkin("page");
   return;
};

Images.prototype.all_action = function() {
   switch (this._parent.constructor) {
      case Site:
      res.data.pager = renderPageNavigation(this, this.href(), 
           10, req.queryParams.page);
      res.data.list = renderList(this, "mgrlistitem", 10, req.queryParams.page);
      res.data.title = gettext("Images of {0}", this._parent.title);
      res.data.body = this.renderSkinAsString("Images#main");
      break;
      case Layout:
      var images = this.mergeImages();
      res.data.pager = renderPageNavigation(images,
            this.href(), 10, req.queryParams.page);
      res.data.list = renderList(images, 
            "mgrlistitem", 10, req.queryParams.page);
      res.data.title = gettext("Layout images of {0}", this._parent.title);
      res.data.body = this.renderSkinAsString("Images#layout");
      break;
   }
   res.handlers.site.renderSkin("page");
   return;
};

Images.Default = {
   "rss.png": {name: "rss.png", width: 16, height: 16, alt: "RSS feed"},
   webloghead: {name: "webloghead.gif", width: 700, 
         height: 53, alt: "Antville"},
   bullet: {name: "bullet.gif", width: 3, height: 10, alt: "*"},
   smallanim: {name: "smallanim.gif", width: 98, height: 30, 
         alt: "made with antville", href: "http://antville.org"},
   smallchaos: {name: "smallchaos.gif", width: 107, height: 29, 
         alt: "made with antville", href: "http://antville.org"},
   smallstraight: {name: "smallstraight.gif", width: 107, height: 24, 
         alt: "made with antville", href: "http://antville.org"},
   smalltrans: {name: "smalltrans.gif", width: 98, height: 30, 
         alt: "made with antville", href: "http://antville.org"},
   xmlbutton: {name: "xmlbutton.gif", width: 36, height: 14, 
         alt: "xml version of this page"},
   hop: {name: "hop.gif", width: 124, height: 25, 
         alt: "helma object publisher", href: "http://helma.org"},
   marquee: {name: "marquee.gif", width: 15, height: 15, alt: "marquee"},
   pixel: {name: "pixel.gif", width: 1, height: 1, alt: ""},
   dot: {name: "dot.gif", width: 30, height: 30, alt: ""}
};

///// Copied from LayoutImageMgr /////

Images.prototype.default_action = function() {
   if (!this._parent.parent) {
      res.message = new Error(gettext("There are no standard images since this layout isn't based on another one."));
      res.redirect(this.href());
   }
   res.data.list = renderList(this._parent.parent.images, 
         "mgrlistitem", 10, req.queryParams.page);
   res.data.pager = renderPageNavigation(this._parent.parent.images, 
         this.href(req.action), 10, req.queryParams.page);
   res.data.title = gettext("Default layout images of {0}", 
         res.handlers.site.title);
   res.data.body = this.renderSkinAsString("Images#layout");
   res.handlers.site.renderSkin("page");
   return;
};

Images.prototype.additional_action = function() {
   res.data.list = renderList(this, "mgrlistitem", 10, req.queryParams.page);
   res.data.pager = renderPageNavigation(this, 
         this.href(req.action), 10, req.queryParams.page);
   res.data.title = gettext("Additional layout images of {0}",
         res.handlers.site.title);
   res.data.body = this.renderSkinAsString("Images#layout");
   res.handlers.context.renderSkin("page");
   return;
};

Images.prototype.exportToZip = function(zip, mode, log) {
   log || (log = {});
   this.forEach(function() {
      var json, file, thumbnail;
      if (log[this.name]) {
         return;
      }
      if (json = this.getJSON()) {
         var str = new java.lang.String(json).getBytes("UTF-8");
         zip.addData(str, "images/" + this.name + ".js");
         file = this.getFile();
         if (file.exists()) {
            zip.add(file, "images");
         }
         file = this.getThumbnailFile();
         if (file.exists()) {
            zip.add(file, "images");
         }
         log[this.name] = true;
      }
   });
   if (mode === "full" && this._parent.parent) {
      this._parent.parent.images.exportToZip(zip, mode, log);
   }
   return log;   
};

Images.prototype.evalImport = function(metadata, files) {
   for (var i in metadata) {
      var data = Xml.readFromString(new java.lang.String(metadata[i].data, 0, metadata[i].data.length));
      var newImg = this.importImage(this._parent, data);
      newImg.layout = this._parent;
      // finally, add the new Image to the collection of this LayoutImageMgr
      this.add(newImg);
   }
   // store the image files to the appropriate directory
   var dir = this._parent.getStaticDir().getAbsolutePath();
   var re = /[\\\/]/;
   for (var i in files) {
      var f = files[i];
      var arr = f.name.split(re);
      var fos = new java.io.FileOutputStream(dir + "/" + arr.pop());
      var outStream = new java.io.BufferedOutputStream(fos);
      outStream.write(f.data, 0, f.data.length);
      outStream.close();
   }
   return true;
};

Images.prototype.importImage = function(layout, data) {
   // FIXME: replace the creator with a more intelligent solution ...
   var img = new Image(session.user);
   if (data.thumbnail) {
      img.thumbnail = this.importImage(layout, data.thumbnail);
      // FIXME: not sure if this is really necessary ...
      img.thumbnail.parent = img;
   }
   img.layout = layout;
   img.alias = data.alias;
   img.filename = data.filename;
   img.fileext = data.fileext;
   img.width = data.width;
   img.height = data.height;
   img.alttext = data.alttext;
   img.createtime = data.createtime;
   img.modifytime = data.modifytime;
   return img;
};

Images.prototype.mergeImages = function() {
   var images = [];
   var layout = this._parent;
   while (layout) {
      layout.images.forEach(function() {
         if (images.indexOf(this) < 0) {
       res.debug(this.name);
            images.push(this);
         }
         return;
      });
      layout = layout.parent;
   }
   return images.sort(Number.Sorter("created", Number.Sorter.DESC));
};

Images.prototype.getTags = function(group) {
   return this._parent.getTags("galleries", group);
};
