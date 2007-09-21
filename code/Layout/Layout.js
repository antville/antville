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

defineConstants(Layout, "getModes", "default", "shared");

this.handleMetadata("title");
this.handleMetadata("description");
this.handleMetadata("copyright");

Layout.prototype.constructor = function(site, title, creator) {
   this.site = site;
   this.title = title;
   this.creator = creator;
   this.created = new Date;
   this.mode = Layout.DEFAULT;
   this.touch();
   return this;
};

Layout.prototype.main_action = function() {
   res.data.title = gettext("Layout {0}", this.title);
   res.data.body = this.renderSkinAsString("main");
   res.handlers.context.renderSkin("page");
   return;
};

Layout.prototype.getPermission = function(action) {
   var defaultPermission = User.getPermission(User.PRIVILEGED) ||
         Membership.getPermission(Membership.OWNER)
   switch (action) {
      case "delete":
      return defaultPermission && this !== this.site.layout && 
            this.offsprings.size() < 1;
      case "edit":
      case "images":
      case "skins":
      return defaultPermission;
      case "test":
      case "activate":
      return defaultPermission && this !== this.site.layout;
   }
   return true;
};

Layout.prototype.getFormOptions = function(name) {
   switch (name) {
      case "mode":
      return Layout.getModes();
      case "parent":
      return this.getParentOptions();
   }
}

Layout.prototype.edit_action = function() {
   if (req.postParams.save) {
      try {
         this.update(req.postParams);
         res.message = gettext("Successfully updated the layout {0}.", 
               this.title);
         res.redirect(this.href());
      } catch (ex) {
         res.message = ex;
         app.log(ex);
      }
   }

   res.data.action = this.href(req.action);
   res.data.title = gettext("Edit layout {0}", this.title);
   res.data.body = this.renderSkinAsString("edit");
   res.handlers.site.renderSkin("page");
   return;
};

Layout.prototype.update = function(data) {
   this.title = data.title.trim() || "Layout #" + this._id;
   this.description = data.description;
   this.copyright = data.copyright;
   if (data.parent) {
      var parent = root.layouts.getById(data.parent);
      if (parent !== this) {
         this.parent = parent;
      }
   }
   this.mode = data.mode;
   this.touch();
   return;
};

Layout.remove = function() {
   HopObject.remove(this.skins);
   HopObject.remove(this.images);
   this.remove();
   return;
};

Layout.prototype.startTestdrive_action = function() {
   session.data.layout = this;
   if (req.data.http_referer)
      res.redirect(req.data.http_referer);
   else
      res.redirect(res.handlers.context.href());
   return;
};

Layout.prototype.stopTestdrive_action = function() {
   session.data.layout = null;
   res.message = new Message("layoutStopTestdrive");
   if (req.data.http_referer)
      res.redirect(req.data.http_referer);
   else
      res.redirect(res.handlers.context.href());
   return;
};

Layout.prototype.download_action = function() {
   if (req.data.cancel)
      res.redirect(this._parent.href());
   else if (req.data.full)
      res.redirect(this.href("download_full.zip"));
   else if (req.data.changesonly)
      res.redirect(this.href("download.zip"));
   
   res.data.action = this.href(req.action);
   res.data.title = getMessage("Layout.downloadTitle", {layoutTitle: this.title});
   res.data.body = this.renderSkinAsString("download");
   res.handlers.context.renderSkin("page");
   return;
};

Layout.prototype.download_full_zip_action = function() {
   try {
      var data = this.evalDownload(true);
      res.contentType = "application/zip";
      res.writeBinary(data);
   } catch (err) {
      res.message = new Exception("layoutDownload");
      res.redirect(this.href());
   }
   return;
};

Layout.prototype.download_zip_action = function() {
   try {
      var data = this.evalDownload(false);
      res.contentType = "application/zip";
      res.writeBinary(data);
   } catch (err) {
      res.message = new Exception("layoutDownload");
      res.redirect(this.href());
   }
   return;
};

Layout.prototype.image_macro = function(param) {
   var img;
   if ((img = this.getImage(param.name, param.fallback)) == null)
      return;
   // return different display according to param.as
   switch (param.as) {
      case "url" :
         return img.getUrl();
      case "thumbnail" :
         if (!param.linkto)
            param.linkto = img.getUrl();
         if (img.thumbnail)
            img = img.thumbnail;
         break;
      case "popup" :
         param.linkto = img.getUrl();
         param.onclick = img.getPopupUrl();
         if (img.thumbnail)
            img = img.thumbnail;
         break;
   }
   delete(param.name);
   delete(param.as);
   // render image tag
   if (param.linkto) {
      Html.openLink({href: param.linkto});
      delete(param.linkto);
      renderImage(img, param);
      Html.closeLink();
   } else
      renderImage(img, param);
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

Layout.prototype.active_macro = function() {
   return this === res.handlers.site.getLayout();
};

Layout.prototype.getNavigationName = function() {
   return this.title;
};

Layout.prototype.staticPath = function(subdir) {
   if (this.site)
      this.site.staticPath();
   else
      res.write(app.properties.staticPath);
   res.write("layouts/");
   res.write(this.alias);
   res.write("/");
   if (subdir)
      res.write(subdir);
   return;
};

Layout.prototype.getStaticPath = function(subdir) {
   res.push();
   this.staticPath(subdir);
   return res.pop();
};

Layout.prototype.staticUrl = function() {
   if (this.site)
      this.site.staticUrl();
   else
      res.write(app.properties.staticUrl);
   res.write("layouts/");
   res.write(this.alias);
   res.write("/");
   return;
};

Layout.prototype.getStaticUrl = function() {
   res.push();
   this.staticUrl();
   return res.pop();
};

Layout.prototype.getStaticDir = function(subdir) {
   var f = new Helma.File(this.getStaticPath(subdir));
   f.mkdir();
   return f;
};

Layout.prototype.isDefaultLayout = function() {
   if (this.site && this.site.layout == this)
      return true;
   if (!this.site && root.sys_layout == this)
      return true;
   return false;
};

Layout.prototype.setParentLayout = function(parent) {
   this.parent = parent;
   // Offspring layouts cannot be shared
   this.mode = Layout.DEFAULT;
   this.copyright = parent.copyright;
   return;
};

Layout.prototype.dumpToZip = function(z, fullExport) {
   var cl = new HopObject();
   cl.title = this.title;
   cl.alias = this.alias;
   cl.description = this.description;
   cl.preferences = this.preferences.get();
   cl.creator = this.creator ? this.creator.name : null;
   cl.createtime = this.creator ? this.createtime : null;
   cl.exporttime = new Date();
   cl.exporter = session.user.name;
   cl.fullExport = fullExport;
   cl.modifier = this.modifier ? this.modifier.name : null;
   cl.modifytime = this.modifytime;
   var buf = new java.lang.String(Xml.writeToString(cl)).getBytes("UTF-8");
   z.addData(buf, "preferences.xml");
   return true;
};

Layout.prototype.evalDownload = function(fullExport) {
   // create the zip file
   var z = new Zip();
   this.dumpToZip(z, fullExport);
   this.images.dumpToZip(z, fullExport);
   this.skins.dumpToZip(z, fullExport);
   z.close();
   return z.getData();
};

Layout.prototype.getImage = function(name, fallback) {
   var handler = this;
   while (handler) {
      if (handler.images.get(name))
         return handler.images.get(name);
      if (handler.images.get(fallback))
         handler.images.get(fallback)
      handler = handler.parent;
   }
   return null;
};

Layout.prototype.getSkinPath = function() {
   var skinPath = [];
   var layout = this;
   do {
      res.push();
      res.write(getProperty("staticPath"));
      layout.site && res.write(layout.site.name + "/");
      res.write("layouts/");
      res.write(layout.alias);
      skinPath.push(res.pop());
   } while (layout = layout.parent);
   return skinPath;

   // FIXME: to be removed
   var sp = [this.skins];
   var handler = this;
   while ((handler = handler.parent) != null) {
      sp.push(handler.skins);
   }
   return sp;
};

Layout.prototype.getParents = function() {
   var parents = new java.util.Hashtable();
   var handler = this;
   while ((handler = handler.parent) != null)
      parents.put(handler._id, true);
   return parents;
};

Layout.prototype.getParentOptions = function() {
   var self = this;
   var commons = [{value: 0, display: "none"}];
   root.layouts.commons.forEach(function() {
      if (this !== self) {
         commons.push({display: this.title, value: this._id});
      } 
   });
   return commons;
};
