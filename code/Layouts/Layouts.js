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
// $Revision:3337 $
// $LastChangedBy:piefke3000 $
// $LastChangedDate:2007-09-21 15:54:30 +0200 (Fri, 21 Sep 2007) $
// $URL$
//

Layouts.prototype.getPermission = function(action) {
   if (!this._parent.getPermission("main")) {
      return false;
   }
   switch (action) {
      case ".":
      case "main":
      case "create":
      case "import":
      return Membership.require(Membership.OWNER) || 
            User.require(User.PRIVILEGED);
   }
   return false;
};

Layouts.prototype.main_action = function() {
   res.data.title = gettext("Layouts of {0}", res.handlers.site.title);
   res.data.action = this.href();
   res.data.list = renderList(this, "mgrlistitem", 10, req.queryParams.page);
   res.data.pager = renderPageNavigation(this, 
         this.href(), 10, req.queryParams.page);
   res.data.body = this.renderSkinAsString("main");
   res.handlers.site.renderSkin("page");
   return;
};

Layouts.prototype.create_action = function() {
   var layout = new Layout();

   if (req.postParams.create) {
      try {
         this.update(req.postParams);
         res.message = gettext('Successfully created the layout "{0}".', layout.name);
         res.redirect(layout.href("edit"));
      } catch (ex) {
         res.message = ex;
         app.log(ex);
      }
   }

   res.data.list = renderList(root.layouts.commons, 
         "chooserlistitem", 5, req.queryParams.page);
   res.data.pager = renderPageNavigation(root.layouts.commons, 
         this.href(req.action), 5, req.queryParams.page);

   res.data.title = gettext("Create layout for {0}", res.handlers.site.title);
   res.data.action = this.href(req.action);
   res.data.body = layout.renderSkinAsString("Layout#create");
   res.handlers.site.renderSkin("page");
   return;
};

Layouts.prototype.import_action = function() {
   var layout = new Layout;
   if (req.postParams["import"]) {
      try {
         layout["import"](req.postParams);
         res.message;
         res.redirect(this.href());
      } catch (ex) {
         res.message = ex;
         app.log(ex);
      }
   }
   res.data.list = renderList(root.layouts.commons, 
         "chooserlistitem", 5, req.postParams.page);
   res.data.pager = renderPageNavigation(root.layouts.commons, 
         this.href(req.action), 5, req.postParams.page);
   res.data.title = gettext("Import layout for {0}", res.handlers.site.title);
   res.data.action = this.href(req.action);
   res.data.body = layout.renderSkinAsString("import");
   res.handlers.site.renderSkin("page");
   return;
};

Layouts.prototype.evalImport = function(param, creator) {
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
