/**
 * evaluate the submitted form values and create
 * a new layout if they're correct
 * @param Object Object containing the submitted form values
 * @param Object Creator of the layout object
 */
function evalNewLayout(param, creator) {
   if (!param.title)
      throw new Exception("layoutTitleMissing");
   var newLayout = new layout(null, param.title, creator);
   newLayout.alias = buildAlias(newLayout.title, this);
   if (param.layout && root.layouts.get(param.layout))
      newLayout.parent = root.layouts.get(param.layout);
   if (!this.add(newLayout))
      throw new Exception("layoutCreate");
   return new Message("layoutCreate", newLayout.title, newLayout);
}

/**
 * Set the layout with the alias passed as argument
 * to the default root layout
 */
function setDefaultLayout(alias) {
   if (root.sys_layout != alias)
      root.sys_layout = alias;
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
      var data = contents.files.preferences.data;
      var importLayout = Xml.readFromString(new java.lang.String(data, 0, data.length));
   } catch (err) {
      throw new Exception("layoutImportCorrupt");
   }
   // start with the actual import
   var newLayout = new layout(null, importLayout.title, session.user);
   newLayout.preferences.setAll(importLayout.preferences);
   newLayout.alias = buildAlias(importLayout.alias, this);
   newLayout.description = importLayout.description;
   newLayout.createtime = importLayout.createtime;
   newLayout.modifytime = importLayout.modifytime;
   newLayout.creator = session.user;
   this.add(newLayout);
   // import images
   newLayout.images.evalImport(contents.files.imagedata, contents.files.images);
   // import skins
   newLayout.skins.evalImport(contents.files.skins);
   return new Message("layoutImport", newLayout.title);
}
