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
LayoutMgr.prototype.main_action = function() {
   if (req.data["activate"]) {
      this.setDefaultLayout(req.data["activate"]);
      res.redirect(this.href());
   }
   res.data.title = getMessage("LayoutMgr.mainTitle", {siteTitle: res.handlers.context.getTitle()});
   res.data.action = this.href();
   res.data.layoutlist = renderList(this, "mgrlistitem", 10, req.data.page);
   res.data.pagenavigation = renderPageNavigation(this, this.href(), 10, req.data.page);
   res.data.body = this.renderSkinAsString("main");
   res.handlers.context.renderSkin("page");
   return;
};

/**
 * choose a new root layout
 */
LayoutMgr.prototype.create_action = function() {
   if (req.data.cancel)
      res.redirect(this.href());
   else if (req.data.create) {
      try {
         var result = this.evalNewLayout(req.data, session.user);
         res.message = result.toString();
         res.redirect(result.obj.href("edit"));
      } catch (err) {
         res.message = err.toString();
      }
   }

   // render a list of root layouts that are shareable
   res.data.layoutlist = renderList(root.layouts.shareable, "chooserlistitem", 5, req.data.page);
   res.data.pagenavigation = renderPageNavigation(root.layouts.shareable, this.href(req.action), 5, req.data.page);

   res.data.title = getMessage("LayoutMgr.createTitle", {siteTitle: res.handlers.context.getTitle()});
   res.data.action = this.href(req.action);
   res.data.body = this.renderSkinAsString("new");
   res.handlers.context.renderSkin("page");
   return;
};

/**
 * import action
 */
LayoutMgr.prototype.import_action = function() {
   if (req.data.cancel)
      res.redirect(this.href());
   else if (req.data["import"]) {
      try {
         var result = this.evalImport(req.data, session.user);
         res.message = result.toString();
         res.redirect(this.href());
      } catch (err) {
         res.message = err.toString();
      }
   }
   // render a list of root layouts that are shareable
   res.data.layoutlist = renderList(root.layouts.shareable, "chooserlistitem", 5, req.data.page);
   res.data.pagenavigation = renderPageNavigation(root.layouts.shareable, this.href(req.action), 5, req.data.page);

   res.data.title = getMessage("LayoutMgr.importTitle", {siteTitle: res.handlers.context.getTitle()});
   res.data.action = this.href(req.action);
   res.data.body = this.renderSkinAsString("import");
   res.handlers.context.renderSkin("page");
   return;
};
/**
 * render a dropdown containing available layouts
 */
LayoutMgr.prototype.layoutchooser_macro = function(param) {
   var options = [];
   var size = this.size();
   for (var i=0;i<size;i++) {
      var l = this.get(i);
      options.push({value: l.alias, display: l.title});
   }
   Html.dropDown({name: "layout"}, options, param.selected, param.firstOption);
   return;
};
/**
 * create a new Layout based on a chosen parent layout
 * @param Object Object containing the submitted form values
 * @param Object Creator of the layout object
 */
LayoutMgr.prototype.evalNewLayout = function(param, creator) {
   var newLayout = new Layout(this._parent instanceof Site ? this._parent : null,
                              "untitled", creator);
   if (param.layout) {
      var parentLayout = root.layouts.get(param.layout);
      if (!parentLayout)
         throw new Exception("layoutParentNotFound");
      newLayout.setParentLayout(parentLayout);
      newLayout.title = parentLayout.title;
   }
   newLayout.alias = buildAlias(newLayout.title, this);
   if (!this.add(newLayout))
      throw new Exception("layoutCreate");
   return new Message("layoutCreate", newLayout.title, newLayout);
};

/**
 * function deletes a layout
 * @param Obj Layout-HopObject to delete
 */
LayoutMgr.prototype.deleteLayout = function(layout) {
   layout.deleteAll();
   var title = layout.title;
   layout.remove();
   return new Message("layoutDelete", title);
};

/**
 * Set the layout with the alias passed as argument
 * to the default site layout
 */
LayoutMgr.prototype.setDefaultLayout = function(alias) {
   var l = this.get(alias);
   if (l && this._parent.layout != l)
      this._parent.layout = l;
   return;
};

/**
 * import a new Layout that was uploaded as a zip file
 */
LayoutMgr.prototype.evalImport = function(param, creator) {
   if (param.uploadError) {
      // looks like the file uploaded has exceeded uploadLimit ...
      throw new Exception("layoutImportTooBig");
   } else if (!param.zipfile || param.zipfile.contentLength == 0) {
      // looks like nothing was uploaded ...
      throw new Exception("layoutImportNoUpload");
   }
   try {
      var contents = Zip.extractData(param.zipfile.getContent());
      // first, check if there's a file called "preferences" in the archive
      // and convert it into a HopObject
      var data = contents.files["preferences.xml"].data;
      var importLayout = Xml.readFromString(new java.lang.String(data, 0, data.length));
      // start with the actual import
      var newLayout = new Layout(this._parent instanceof Site ? this._parent : null,
                                 importLayout.title, session.user);
      newLayout.parent = param.layout ? root.layouts.get(param.layout) : null;
      newLayout.preferences.setAll(importLayout.preferences);
      newLayout.shareable = 0;
      newLayout.imported = 1;
      newLayout.alias = buildAlias(importLayout.alias, this);
      newLayout.description = importLayout.description;
      newLayout.creator = session.user;
      // FIXME: this should be done after importing skins
      // and images, buf for some reasons skins then
      // won't be stored persistent
      this.add(newLayout);
      // import skins
      newLayout.skins.evalImport(contents.files.skins);
      // import images
      newLayout.images.evalImport(contents.files.imagedata, contents.files.images);
      return new Message("layoutImport", newLayout.title);
   } catch (err) {
      throw new Exception("layoutImportCorrupt");
   }
   return;
};
/**
 * render a dropdown containing shareable system layouts
 * @param Object current layout
 */
LayoutMgr.prototype.renderParentLayoutChooser = function(selLayout, firstOption) {
   var options = [];
   var size = root.layouts.shareable.size();
   for (var i=0;i<size;i++) {
      var l = root.layouts.shareable.get(i);
      options.push({value: l.alias, display: l.title});
   }
   var selected = null;
   if (selLayout && selLayout.parent)
      selected = selLayout.parent.alias;
   Html.dropDown({name: "layout"}, options, selected, firstOption);
   return;
};
/**
 * permission check (called by hopobject.onRequest())
 * @param String name of action
 * @param Obj User object
 * @param Int Membership level
 * @return Obj Exception object or null
 */
LayoutMgr.prototype.checkAccess = function(action, usr, level) {
   checkIfLoggedIn(this.href(req.action));
   try {
      this.checkEdit(session.user, req.data.memberlevel);
   } catch (deny) {
      res.message = deny.toString();
      res.redirect(this._parent.href());
   }
   return;
};

/**
 * check if user is allowed to edit layouts
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */
LayoutMgr.prototype.checkEdit = function(usr, level) {
   if ((level & MAY_EDIT_LAYOUTS) == 0)
      throw new DenyException("layoutEdit");
   return;
};
