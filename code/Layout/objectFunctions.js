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
   prefs.linkcolor = "ff3300";
   prefs.alinkcolor = "ff0000";
   prefs.vlinkcolor = "ff3300";
   prefs.titlefont = "Verdana, Helvetica, Arial, sans-serif";
   prefs.titlesize = "15px";
   prefs.titlecolor = "cc0000";
   prefs.smallfont = "Arial, Helvetica, sans-serif";
   prefs.smallsize = "12px";
   prefs.smallcolor = "666666";
   this.preferences_xml = Xml.writeToString(prefs);
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
   this.shareable = param.shareable;
   // get preferences from param object
   var prefs = new HopObject();
   for (var i in param) {
      if (i.startsWith("preferences_"))
         prefs[i.substring(12)] = param[i];
   }
   // store preferences
   this.preferences.setAll(prefs);
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
 * return the path to the static directory of this
 * layout object
 * @return Object java.lang.StringBuffer
 */
function getStaticPath(subdir) {
   var buf = (this.site ? this.site.getStaticPath() :
              new java.lang.StringBuffer(app.properties.staticPath));
   buf.append("layouts/");
   buf.append(this.alias);
   buf.append("/");
   if (subdir)
      buf.append(subdir);
   return buf;
}

/**
 * return the URL of the directory where images
 * of this layout are located
 * @return String URL of the image directory
 */
function getStaticUrl() {
   var buf = (this.site ? this.site.getStaticUrl() :
              new java.lang.StringBuffer(app.properties.staticUrl));
   buf.append("layouts/");
   buf.append(this.alias);
   buf.append("/");
   return buf;
}

/**
 * return the directory where images of this layout
 * are stored
 * @return Object File Object representing the image
 *                directory on disk
 */
function getStaticDir(subdir) {
   return FileLib.mkdir(this.getStaticPath(subdir).toString());
}

/**
 * Helper function: is this layout the default in the current context?
 */
function isDefaultLayout() {
   if (this.site && this.site.preferences.getProperty("layout") == this.alias)
      return true;
   if (!this.site && root.sys_layout == this.alias)
      return true;
   return false;
}

/**
 * make this layout object a child layout of the one
 * passed as argument and copy the layout-relevant
 * preferences
 */
function setParentLayout(parent) {
   this.parent = parent;
   // child layouts are not shareable
   this.shareable = 0;
   // clone the layout relevant preferences from parent
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
   this.preferences.setAll(prefs);
   return;
}

/**
 * FIXME: experimental methods ...
 */

/**
 * dump a layout object by copying all necessary properties
 * to a transient HopObject and then return the Xml dump
 * of it (this way we avoid any clashes with usernames)
 * @return String Xml-Dump of the layout object
 */
function dumpToZip(z) {
   var cl = new HopObject();
   cl.title = this.title;
   cl.alias = this.alias;
   cl.description = this.description;
   cl.preferences = this.preferences.getAll();
   cl.creator = this.creator ? this.creator.name : null;
   cl.createtime = this.creator ? this.createtime : null;
   cl.exporttime = new Date();
   cl.exporter = session.user.name;
   cl.modifier = this.modifier ? this.modifier.name : null;
   cl.modifytime = this.modifytime;
   var buf = new java.lang.String(Xml.writeToString(cl)).getBytes();
   z.addData(buf, "preferences");
   return true;
}
