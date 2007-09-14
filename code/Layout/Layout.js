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
Layout.prototype.main_action = function() {
   res.data.title = getMessage("Layout.mainTitle", {layoutTitle: this.title});
   res.data.body = this.renderSkinAsString("main");
   res.handlers.context.renderSkin("page");
   return;
};

/**
 * edit action
 */
Layout.prototype.edit_action = function() {
   if (req.data.cancel)
      res.redirect(this.href());
   else if (req.data.save) {
      try {
         res.message = this.evalLayout(req.data, session.user);
         res.redirect(this._parent.href());
      } catch (err) {
         res.message = err.toString();
      }
   }

   res.data.action = this.href(req.action);
   res.data.title = getMessage("Layout.editTitle", {layoutTitle: this.title});
   res.data.body = this.renderSkinAsString("edit");
   res.handlers.context.renderSkin("page");
   return;
};

/**
 * action to test-drive this layout in the current session.
 */
Layout.prototype.startTestdrive_action = function() {
   session.data.layout = this;
   if (req.data.http_referer)
      res.redirect(req.data.http_referer);
   else
      res.redirect(res.handlers.context.href());
   return;
};

/**
 * stop a layout test and resume normal browsing.
 */
Layout.prototype.stopTestdrive_action = function() {
   session.data.layout = null;
   res.message = new Message("layoutStopTestdrive");
   if (req.data.http_referer)
      res.redirect(req.data.http_referer);
   else
      res.redirect(res.handlers.context.href());
   return;
};

/**
 * action deletes this layout
 */
Layout.prototype.delete_action = function() {
   if (this.isDefaultLayout() || this.sharedBy.size() > 0) {
      res.message = new DenyException("layoutDelete");
      res.redirect(this._parent.href());
   }
   if (req.data.cancel)
      res.redirect(this._parent.href());
   else if (req.data.remove) {
      var href = this._parent.href();
      try {
         res.message = this._parent.deleteLayout(this);
         res.redirect(href);
      } catch (err) {
         res.message = err.toString();
         res.redirect(href);
      }
   }

   res.data.action = this.href(req.action);
   res.data.title = res.handlers.context.getTitle();
   var skinParam = {
      description: "the layout",
      detail: this.title
   };
   res.data.body = this.renderSkinAsString("delete", skinParam);
   res.handlers.context.renderSkin("page");
   return;
};

/**
 * download action
 */
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


/**
 * create a Zip file containing the whole layout
 */
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

/**
 * create a .zip file containing layout changes only
 */
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
/**
 * macro rendering bgcolor
 */
Layout.prototype.bgcolor_macro = function(param) {
   if (param.as == "editor")
      Html.input(this.preferences.createInputParam("bgcolor", param));
   else
      renderColor(this.preferences.get("bgcolor"));
   return;
};

/**
 * macro rendering textfont
 */
Layout.prototype.textfont_macro = function(param) {
   if (param.as == "editor") {
      param.size = 40;
      Html.input(this.preferences.createInputParam("textfont", param));
   } else
      res.write(this.preferences.get("textfont"));
   return;
};

/**
 * macro rendering textsize
 */
Layout.prototype.textsize_macro = function(param) {
   if (param.as == "editor")
      Html.input(this.preferences.createInputParam("textsize", param));
   else
      res.write(this.preferences.get("textsize"));
   return;
};

/**
 * macro rendering textcolor
 */
Layout.prototype.textcolor_macro = function(param) {
   if (param.as == "editor")
      Html.input(this.preferences.createInputParam("textcolor", param));
   else
      renderColor(this.preferences.get("textcolor"));
   return;
};

/**
 * macro rendering linkcolor
 */
Layout.prototype.linkcolor_macro = function(param) {
   if (param.as == "editor")
      Html.input(this.preferences.createInputParam("linkcolor", param));
   else
      renderColor(this.preferences.get("linkcolor"));
   return;
};

/**
 * macro rendering alinkcolor
 */
Layout.prototype.alinkcolor_macro = function(param) {
   if (param.as == "editor")
      Html.input(this.preferences.createInputParam("alinkcolor", param));
   else
      renderColor(this.preferences.get("alinkcolor"));
   return;
};

/**
 * macro rendering vlinkcolor
 */
Layout.prototype.vlinkcolor_macro = function(param) {
   if (param.as == "editor")
      Html.input(this.preferences.createInputParam("vlinkcolor", param));
   else
      renderColor(this.preferences.get("vlinkcolor"));
   return;
};

/**
 * macro rendering titlefont
 */
Layout.prototype.titlefont_macro = function(param) {
   if (param.as == "editor") {
      param.size = 40;
      Html.input(this.preferences.createInputParam("titlefont", param));
   } else
      res.write(this.preferences.get("titlefont"));
   return;
};

/**
 * macro rendering titlesize
 */
Layout.prototype.titlesize_macro = function(param) {
   if (param.as == "editor")
      Html.input(this.preferences.createInputParam("titlesize", param));
   else
      res.write(this.preferences.get("titlesize"));
   return;
};

/**
 * macro rendering titlecolor
 */
Layout.prototype.titlecolor_macro = function(param) {
   if (param.as == "editor")
      Html.input(this.preferences.createInputParam("titlecolor", param));
   else
      renderColor(this.preferences.get("titlecolor"));
   return;
};

/**
 * macro rendering smallfont
 */
Layout.prototype.smallfont_macro = function(param) {
   if (param.as == "editor") {
      param.size = 40;
      Html.input(this.preferences.createInputParam("smallfont", param));
   } else
      res.write(this.preferences.get("smallfont"));
   return;
};

/**
 * macro rendering smallfont-size
 */
Layout.prototype.smallsize_macro = function(param) {
   if (param.as == "editor")
      Html.input(this.preferences.createInputParam("smallsize", param));
   else
      res.write(this.preferences.get("smallsize"));
   return;
};

/**
 * macro rendering smallfont-color
 */
Layout.prototype.smallcolor_macro = function(param) {
   if (param.as == "editor")
      Html.input(this.preferences.createInputParam("smallcolor", param));
   else
      renderColor(this.preferences.get("smallcolor"));
   return;
};

/**
 * renders the layout title as editor
 */
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

/**
 * macro renders an image out of the layout imagepool
 * either as plain image, thumbnail, popup or url
 * param.name can contain a slash indicating that
 * the image belongs to a different site or to root
 */
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

/**
 * render a link to testdrive if the layout is *not*
 * the currently active layout
 */
Layout.prototype.testdrivelink_macro = function(param) {
   if (this.isDefaultLayout())
      return;
   Html.link({href: this.href("startTestdrive")},
             param.text ? param.text : getMessage("Layout.test"));
   return;
};

/**
 * render a link for deleting the layout, but only if
 * layout is *not* the currently active layout
 */
Layout.prototype.deletelink_macro = function(param) {
   if (this.isDefaultLayout() || this.sharedBy.size() > 0)
      return;
   Html.link({href: this.href("delete")},
             param.text ? param.text : getMessage("generic.delete"));
   return;
};

/**
 * render a link for activating the layout, but only if
 * layout is *not* the currently active layout
 */
Layout.prototype.activatelink_macro = function(param) {
   if (this.isDefaultLayout())
      return;
   Html.link({href: this._parent.href() + "?activate=" + this.alias},
             param.text ? param.text : getMessage("Layout.activate"));
   return;
};

/**
 * render the description of a layout, either as editor
 * or as plain text
 */
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

/**
 * render the property "shareable" either as editor (checkbox)
 * or as plain text (editor-mode works only for root-layouts)
 */
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

/**
 * render the title of the parent layout
 */
Layout.prototype.parent_macro = function(param) {
   if (param.as == "editor") {
      this._parent.renderParentLayoutChooser(this, param.firstOption);
   } else if (this.parent)
      return this.parent.title;
   return;
};

/**
 * render the copyright information of this layout
 * either as editor or as plain text
 */
Layout.prototype.copyright_macro = function(param) {
   if (param.as == "editor" && !this.imported && !this.parent)
      Html.input(this.preferences.createInputParam("copyright", param));
   else if (this.preferences.get("copyright"))
      res.write(this.preferences.get("copyright"));
   return;
};

/**
 * render the contact email address of this layout
 * either as editor or as plain text
 */
Layout.prototype.email_macro = function(param) {
   if (param.as == "editor" && !this.imported)
      Html.input(this.preferences.createInputParam("email", param));
   else if (this.preferences.get("email"))
      res.write(this.preferences.get("email"));
   return;
};


/**
 * overwrite the switch macro in antvillelib
 * for certain properties (but pass others thru)
 */
Layout.prototype.switch_macro = function(param) {
   if (param.name == "active") {
      var currLayout = res.handlers.context.getLayout();
      return currLayout == this ? param.on : param.off;
   }
   HopObject.prototype.apply(this, [param]);
   return;
};
/**
 * constructor function for layout objects
 */
Layout.prototype.constructor = function(site, title, creator) {
   this.site = site;
   this.title = title;
   this.creator = creator;
   this.createtime = new Date();
   this.shareable = 0;
   var prefs = new HopObject();
   prefs.bgcolor = "ffffff";
   prefs.textfont = "Verdana, Helvetica, Arial, sans-serif";
   prefs.textsize = "13px";
   prefs.textcolor = "000000";
   prefs.linkcolor = "ff4040";
   prefs.alinkcolor = "ff4040";
   prefs.vlinkcolor = "ff4040";
   prefs.titlefont = "Verdana, Helvetica, Arial, sans-serif";
   prefs.titlesize = "15px";
   prefs.titlecolor = "d50000";
   prefs.smallfont = "Verdana, Arial, Helvetica, sans-serif";
   prefs.smallsize = "11px";
   prefs.smallcolor = "959595";
   this.preferences_xml = Xml.writeToString(prefs);
   return this;
};

/**
 * evaluate submitted form values and update
 * the layout object
 */
Layout.prototype.evalLayout = function(param, modifier) {
   if (!param.title || !param.title.trim())
      throw new Exception("layoutTitleMissing");
   this.title = param.title;
   this.description = param.description;
   // get preferences from param object
   var prefs = this.preferences.get();
   for (var i in param) {
      if (i.startsWith("preferences_"))
         prefs[i.substring(12)] = param[i];
   }
   // store preferences
   this.preferences.setAll(prefs);
   // parent layout
   this.parent = param.layout ? root.layouts.get(param.layout) : null;
   this.shareable = param.shareable ? 1 : 0;
   this.modifier = modifier;
   this.modifytime = new Date();
   return new Message("layoutUpdate", this.title);
};

/**
 * delete all skins and images belonging to this layout
 */
Layout.prototype.deleteAll = function() {
   this.images.deleteAll();
   this.skins.deleteAll();
   return true;
};

/**
 * Return the name of this layout
 * to be used in the global linkedpath macro
 * @see hopobject.getNavigationName()
 */
Layout.prototype.getNavigationName = function() {
   return this.title;
};

/**
 * render the path to the static directory of this
 * layout object
 * @param String name of subdirectory (optional)
 */
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

/**
 * return the path to the static directory of this
 * layout object
 * @param String name of subdirectory (optional)
 * @return String path to static directory
 */
Layout.prototype.getStaticPath = function(subdir) {
   res.push();
   this.staticPath(subdir);
   return res.pop();
};

/**
 * render the URL of the directory where images
 * of this layout are located
 */
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

/**
 * return the URL of the directory where images
 * of this layout are located
 * @return String URL of the image directory
 */
Layout.prototype.getStaticUrl = function() {
   res.push();
   this.staticUrl();
   return res.pop();
};

/**
 * return the directory where images of this layout
 * are stored
 * @return Object File Object representing the image
 *                directory on disk
 */
Layout.prototype.getStaticDir = function(subdir) {
   var f = new Helma.File(this.getStaticPath(subdir));
   f.mkdir();
   return f;
};

/**
 * Helper function: is this layout the default in the current context?
 */
Layout.prototype.isDefaultLayout = function() {
   if (this.site && this.site.layout == this)
      return true;
   if (!this.site && root.sys_layout == this)
      return true;
   return false;
};

/**
 * make this layout object a child layout of the one
 * passed as argument and copy the layout-relevant
 * preferences
 * @param Object parent layout object 
 */
Layout.prototype.setParentLayout = function(parent) {
   this.parent = parent;
   // child layouts are not shareable
   this.shareable = 0;
   // copy relevant preferences from parent
   var prefs = new HopObject();
   var parentPrefs = parent.preferences.get();
   prefs.bgcolor = parentPrefs.bgcolor;
   prefs.textfont = parentPrefs.textfont;
   prefs.textsize = parentPrefs.textsize;
   prefs.textcolor = parentPrefs.textcolor;
   prefs.linkcolor = parentPrefs.linkcolor;
   prefs.alinkcolor = parentPrefs.alinkcolor;
   prefs.vlinkcolor = parentPrefs.vlinkcolor;
   prefs.titlefont = parentPrefs.titlefont;
   prefs.titlesize = parentPrefs.titlesize;
   prefs.titlecolor = parentPrefs.titlecolor;
   prefs.smallfont = parentPrefs.smallfont;
   prefs.smallsize = parentPrefs.smallsize;
   prefs.smallcolor = parentPrefs.smallcolor;
   prefs.copyright = parentPrefs.copyright;
   prefs.email = parentPrefs.email;
   this.preferences.setAll(prefs);
   return;
};

/**
 * dump a layout object by copying all necessary properties
 * to a transient HopObject and then return the Xml dump
 * of it (this way we avoid any clashes with usernames)
 * @param Object Zip object to dump layout to
 * @param Boolean true for full export, false for incremental
 * @return Boolean true
 */
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

/**
 * create a .zip file containing the whole layout (including
 * skins, images and properties)
 * @param Boolean true for full export, false for incremental
 * @param Object Byte[] containing the binary data of the zip file
 */
Layout.prototype.evalDownload = function(fullExport) {
   // create the zip file
   var z = new Zip();
   this.dumpToZip(z, fullExport);
   this.images.dumpToZip(z, fullExport);
   this.skins.dumpToZip(z, fullExport);
   z.close();
   return z.getData();
};

/**
 * retrieve an image from ImageMgr
 * this method walks up the hierarchy of layout objects
 * until it finds an image, otherwise returns null
 * @param String name of image to retrieve
 * @param String name of fallback image to retrieve (optional)
 * @return Object image object or null
 */
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

/**
 * walk up the layout hierarchy and add all skinmgr
 * to an array
 * @return Object Array containing skinmgr objects
 */
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

/**
 * walk up all parents and add them to a Hashtable
 * (the key is the layout._id, value is Boolean true
 * @return Object java.util.Hashtable
 */
Layout.prototype.getParents = function() {
   var parents = new java.util.Hashtable();
   var handler = this;
   while ((handler = handler.parent) != null)
      parents.put(handler._id, true);
   return parents;
};
/**
 * permission check (called by hopobject.onRequest())
 * @param String name of action
 * @param Obj User object
 * @param Int Membership level
 * @return Obj Exception object or null
 */
Layout.prototype.checkAccess = function(action, usr, level) {
   checkIfLoggedIn(this.href(req.action));
   try {
      this.checkEdit(usr, level);
   } catch (deny) {
      res.message = deny.toString();
      res.redirect(this._parent.href());
   }
   return;
};

/**
 * check if user is allowed to edit this layout
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */
Layout.prototype.checkEdit = function(usr, level) {
   if ((level & MAY_EDIT_LAYOUTS) == 0 && !session.user.sysadmin)
      throw new DenyException("skinEditDenied");
   return null;
};
