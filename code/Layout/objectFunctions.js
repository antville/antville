/**
 * constructor function for layout objects
 */
function constructor(site, title, creator) {
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
}

/**
 * evaluate submitted form values and update
 * the layout object
 */
function evalLayout(param, modifier) {
   if (!param.title || !param.title.trim())
      throw new Exception("layoutTitleMissing");
   this.title = param.title;
   this.description = param.description;
   // get preferences from param object
   var prefs = this.preferences.getAll();
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
}

/**
 * delete all skins and images belonging to this layout
 */
function deleteAll() {
   this.images.deleteAll();
   this.skins.deleteAll();
   return true;
}

/**
 * Return the name of this layout
 * to be used in the global linkedpath macro
 * @see hopobject.getNavigationName()
 */
function getNavigationName() {
   return this.title;
}

/**
 * render the path to the static directory of this
 * layout object
 * @param String name of subdirectory (optional)
 */
function staticPath(subdir) {
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
}

/**
 * return the path to the static directory of this
 * layout object
 * @param String name of subdirectory (optional)
 * @return String path to static directory
 */
function getStaticPath(subdir) {
   res.push();
   this.staticPath(subdir);
   return res.pop();
}

/**
 * render the URL of the directory where images
 * of this layout are located
 */
function staticUrl() {
   if (this.site)
      this.site.staticUrl();
   else
      res.write(app.properties.staticUrl);
   res.write("layouts/");
   res.write(this.alias);
   res.write("/");
   return;
}

/**
 * return the URL of the directory where images
 * of this layout are located
 * @return String URL of the image directory
 */
function getStaticUrl() {
   res.push();
   this.staticUrl();
   return res.pop();
}

/**
 * return the directory where images of this layout
 * are stored
 * @return Object File Object representing the image
 *                directory on disk
 */
function getStaticDir(subdir) {
   var f = new Helma.File(this.getStaticPath(subdir));
   f.mkdir();
   return f;
}

/**
 * Helper function: is this layout the default in the current context?
 */
function isDefaultLayout() {
   if (this.site && this.site.layout == this)
      return true;
   if (!this.site && root.sys_layout == this)
      return true;
   return false;
}

/**
 * make this layout object a child layout of the one
 * passed as argument and copy the layout-relevant
 * preferences
 * @param Object parent layout object 
 */
function setParentLayout(parent) {
   this.parent = parent;
   // child layouts are not shareable
   this.shareable = 0;
   // copy relevant preferences from parent
   var prefs = new HopObject();
   var parentPrefs = parent.preferences.getAll();
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
}

/**
 * dump a layout object by copying all necessary properties
 * to a transient HopObject and then return the Xml dump
 * of it (this way we avoid any clashes with usernames)
 * @param Object Zip object to dump layout to
 * @param Boolean true for full export, false for incremental
 * @return Boolean true
 */
function dumpToZip(z, fullExport) {
   var cl = new HopObject();
   cl.title = this.title;
   cl.alias = this.alias;
   cl.description = this.description;
   cl.preferences = this.preferences.getAll();
   cl.creator = this.creator ? this.creator.name : null;
   cl.createtime = this.creator ? this.createtime : null;
   cl.exporttime = new Date();
   cl.exporter = session.user.name;
   cl.fullExport = fullExport;
   cl.modifier = this.modifier ? this.modifier.name : null;
   cl.modifytime = this.modifytime;
   var buf = new java.lang.String(Xml.writeToString(cl)).getBytes();
   z.addData(buf, "preferences.xml");
   return true;
}

/**
 * create a .zip file containing the whole layout (including
 * skins, images and properties)
 * @param Boolean true for full export, false for incremental
 * @param Object Byte[] containing the binary data of the zip file
 */
function evalDownload(fullExport) {
   // create the zip file
   var z = new Zip();
   this.dumpToZip(z, fullExport);
   this.images.dumpToZip(z, fullExport);
   this.skins.dumpToZip(z, fullExport);
   z.close();
   return z.getData();
}

/**
 * retrieve an image from ImageMgr
 * this method walks up the hierarchy of layout objects
 * until it finds an image, otherwise returns null
 * @param String name of image to retrieve
 * @param String name of fallback image to retrieve (optional)
 * @return Object image object or null
 */
function getImage(name, fallback) {
   var handler = this;
   while (handler) {
      if (handler.images.get(name))
         return handler.images.get(name);
      if (handler.images.get(fallback))
         handler.images.get(fallback)
      handler = handler.parent;
   }
   return null;
}

/**
 * walk up the layout hierarchy and add all skinmgr
 * to an array
 * @return Object Array containing skinmgr objects
 */
function getSkinPath() {
   var sp = [this.skins];
   var handler = this;
   while ((handler = handler.parent) != null)
      sp.push(handler.skins);
   return sp;
}

/**
 * walk up all parents and add them to a Hashtable
 * (the key is the layout._id, value is Boolean true
 * @return Object java.util.Hashtable
 */
function getParents() {
   var parents = new java.util.Hashtable();
   var handler = this;
   while ((handler = handler.parent) != null)
      parents.put(handler._id, true);
   return parents;
}
