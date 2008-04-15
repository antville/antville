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
      case "tags":
      return Site.require(Site.OPEN) || 
            Membership.require(Membership.CONTRIBUTOR) ||
            User.require(User.PRIVILEGED);
      case "all":
      return this._parent.constructor !== Layout &&
            (Membership.require(Membership.MANAGER) ||
            User.require(User.PRIVILEGED));
   }
   return false;
};

Images.prototype.main_action = function() {
   var images, skin;
   switch (this._parent.constructor) {
      case Root:
      case Site:
      images = User.getMembership().images;
      skin = "Images#main";
      res.data.title = gettext("Member images of {0}", this._parent.title);
      break;
      
      case Layout:
      images = res.handlers.layout.images;
      skin = "Images#layout";
      res.data.title = gettext("Layout images of {0}", res.handlers.site.title);
      break;
   }
   res.data.list = renderList(images, "Image#listItem", 
         10, req.queryParams.page);
   res.data.pager = renderPager(images, 
         this.href(req.action), 10, req.queryParams.page);
   res.data.body = this.renderSkinAsString(skin);
   res.handlers.site.renderSkin("Site#page");
   return;
};

Images.prototype.create_action = function() {
   var image = new Image;
   image.site = res.handlers.site;
   // We need to set the parent's type for getting the correct file path
   image.parent_type = this._parent._prototype;
   
   if (req.postParams.save) {
      try {
         image.update(req.postParams);
         this.add(image);
         // FIXME: To be removed if work-around for Helma bug #607 passes
         //image.setTags(req.postParams.tags || req.postParams.tag_array);
         image.notify(req.action);
         res.message = gettext('The uploaded image was saved successfully. Its name is "{0}"', 
               image.name);
         res.redirect(image.href());
      } catch (ex) {
         res.message = ex.toString();
         app.log(ex);
      }
   }

   res.data.action = this.href(req.action);
   res.data.title = gettext("Add image to site {0}", this._parent.title);
   res.data.body = image.renderSkinAsString("Image#edit");
   res.handlers.site.renderSkin("Site#page");
   return;
};

Images.prototype.all_action = function() {
   res.data.pager = renderPager(this, this.href(), 
         10, req.queryParams.page);
   res.data.list = renderList(this, "Image#listItem", 
         10, req.queryParams.page);
   res.data.title = gettext("Images of {0}", this._parent.title);
   res.data.body = this.renderSkinAsString("Images#main");
   res.handlers.site.renderSkin("Site#page");
   return;
};

Images.Default = (function() {
   var Image = function(name, description) {
      var fpath = app.properties.staticPath + "www/" + name;
      var image = new helma.Image(fpath);
      this.name = name;
      this.description = description;
      this.width = image.width;
      this.height = image.height;
      this.getUrl = function() {
         return app.properties.staticUrl + "www/" + name;
      }
      this.render_macro = global.Image.prototype.render_macro;
      this.thumbnail_macro = global.Image.prototype.thumbnail_macro;
      return this;
   }

   var images = {};
   var add = function(name, description) {
      images[name] = new Image(name, description);
      return;
   }
   add("rss.png", "RSS feed");
   add("webloghead.gif", "Antville");
   add("bullet.gif", "*");
   add("smallanim.gif", "Made with Antville");
   add("smallchaos.gif", "Made with Antville");
   add("smallstraight.gif", "Made with Antville");
   add("smalltrans.gif", "Made with Antville");
   add("xmlbutton.gif", "XML version of this page");
   add("hop.gif", "Helma Object Publisher");
   add("marquee.gif", String.EMPTY);
   add("pixel.gif", String.EMPTY);
   add("dot.gif", String.EMPTY);
   return images;
})();

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

Images.prototype.mergeImages = function() {
   var images = [];
   var layout = this._parent;
   while (layout) {
      layout.images.forEach(function() {
         if (images.indexOf(this) < 0) {
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

Images.remove = function() {
   if (this.constructor === Images) {
      HopObject.remove(this);
   }
   return;
};
