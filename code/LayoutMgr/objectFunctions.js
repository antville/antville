/**
 * create a new layout based on a chosen parent layout
 * @param Object Object containing the submitted form values
 * @param Object Creator of the layout object
 */
function evalNewLayout(param, creator) {
   var newLayout = new layout(this._parent instanceof site ? this._parent : null,
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
}

/**
 * function deletes a layout
 * @param Obj Layout-HopObject to delete
 */
function deleteLayout(layout) {
   layout.deleteAll();
   var title = layout.title;
   if (!this.remove(layout))
      throw new Exception("layoutDelete", title);
   return new Message("layoutDelete", title);
}

/**
 * Set the layout with the alias passed as argument
 * to the default site layout
 */
function setDefaultLayout(alias) {
   var l = this.get(alias);
   if (l && this._parent.layout != l)
      this._parent.layout = l;
   return;
}

/**
 * import a new layout that was uploaded as a zip file
 */
function evalImport(param, creator) {
   if (param.uploadError) {
      // looks like the file uploaded has exceeded uploadLimit ...
      throw new Exception("layoutImportTooBig");
   } else if (!param.zipfile || param.zipfile.contentLength == 0) {
      // looks like nothing was uploaded ...
      throw new Exception("layoutImportNoUpload");
   }
   try {
      var contents = ZipLib.extractAll(param.zipfile.getContent());
      // first, check if there's a file called "preferences" in the archive
      // and convert it into a HopObject
      var data = contents.files["preferences.xml"].data;
      var importLayout = Xml.readFromString(new java.lang.String(data, 0, data.length));
      // start with the actual import
      var newLayout = new layout(this._parent instanceof site ? this._parent : null, 
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
}
