/**
 * constructor function for site objects
 * @param String Title
 * @param String Alias
 * @param Object Creator
 */
function constructor(title, alias, creator) {
   this.title = title;
   this.alias = alias;
   this.creator = creator;
   this.createtime = this.lastoffline = new Date();
   this.email = creator.email;
   this.online = 0;
   this.blocked = 0;
   this.trusted = creator.trusted;
   this.enableping = 0;

   // create initial preferences
   var prefs = new HopObject();
   prefs.tagline = null;
   prefs.discussions = 1;
   prefs.usercontrib = 0;
   prefs.archive = 1;
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
   prefs.days = 3;
   // retrieve locale-object from root
   var loc = root.getLocale();
   prefs.language = loc.getLanguage();
   prefs.country = loc.getCountry();
   prefs.timezone = root.getTimeZone().getID();
   prefs.longdateformat = "EEEE, dd. MMMM yyyy, h:mm a";
   prefs.shortdateformat = "yyyy.MM.dd, HH:mm";
   this.preferences_xml = Xml.writeToString(prefs);
}

/**
 * function saves new properties of site
 * @param Obj Object containing the form values
 * @param Obj User-Object modifying this site
 * @throws Exception
 */

function evalPreferences(param, modifier) {
   if (!evalEmail(param.email))
      throw new Exception("emailInvalid");
   this.title = stripTags(param.title);
   this.email = param.email;
   if (this.online && !param.online)
      this.lastoffline = new Date();
   this.online = param.online ? 1 : 0;
   this.enableping = param.enableping ? 1 : 0;

   // store new preferences
   var prefs = new HopObject();
   for (var i in param) {
      if (i.startsWith("preferences_"))
         prefs[i.substring(12)] = param[i];
   }
   prefs.days = !isNaN(parseInt(param.preferences_days, 10)) ? parseInt(param.preferences_days, 10) : 3;
   prefs.discussions = param.preferences_discussions ? 1 : 0;
   prefs.usercontrib = param.preferences_usercontrib ? 1 : 0;
   prefs.archive = param.preferences_archive ? 1 : 0;
   // store selected locale
   if (param.locale) {
      var loc = param.locale.split("_");
      prefs.language = loc[0];
      prefs.country = loc.length == 2 ? loc[1] : null;
   }
   prefs.timezone = param.timezone;
   prefs.longdateformat = param.longdateformat;
   prefs.shortdateformat = param.shortdateformat;
   // store preferences
   this.preferences.setAll(prefs);

   // reset cached locale, timezone and dateSymbols
   this.cache.locale = null;
   this.cache.timezone = null;
   this.cache.dateSymbols = null;

   this.modifytime = new Date();
   this.modifier = modifier;
   return new Message("update");
}


/**
 * function checks if language and country were specified
 * for this site. if so, it returns the specified Locale-object
 * otherwise it calls getLocale() for root
 */

function getLocale() {
   var locale = this.cache.locale;
   if (locale) 
       return locale;
   if (this.preferences.getProperty("language")) {
      if (this.preferences.getProperty("country"))
         locale = new java.util.Locale(this.preferences.getProperty("language"),
                                       this.preferences.getProperty("country"));
      else
         locale = new java.util.Locale(this.preferences.getProperty("language"));
   } else
      locale = root.getLocale();
   this.cache.locale =locale;
   return locale;
}

/**
 * function returns the (already cached) DateFormatSymbols according
 * to the locale defined for a site
 */
function getDateSymbols() {
   var symbols = this.cache.dateSymbols;
   if (symbols)
      return symbols;
   this.cache.dateSymbols = new java.text.DateFormatSymbols(this.getLocale());
   return this.cache.dateSymbols;
}

/**
 * function returns the (already cached) TimeZone-Object
 * according to site-preferences
 */
function getTimeZone() {
   var tz = this.cache.timezone;
   if (tz)
       return tz;
   if (this.preferences.getProperty("timezone"))
       tz = java.util.TimeZone.getTimeZone(this.preferences.getProperty("timezone"));
   else
       tz = root.getTimeZone();
   this.cache.timezone = tz;
   return tz;
}


/**
 * helper function to sort story reads
 * @param Obj story a to be compared with story b
 * @param Obj story b to be compared with story a
 * @return Integer -1: a>b; 1: a<b; 0: a=b
 */
function sortMostReads(s1, s2) {
   var s1reads = s1.reads + s1.cache.reads;
   var s2reads = s2.reads + s2.cache.reads;
   if (s1reads > s2reads)
      return(-1);
   else if (s1reads < s2reads)
      return(1);
   else
      return(0);
}

/**
 * function deletes all assets of a site (recursive!)
 */

function deleteAll() {
   this.images.deleteAll();
   this.files.deleteAll();
   this.skins.deleteAll();
   this.stories.deleteAll();
   this.members.deleteAll();
   return true;
}

/**
 * send notification to weblogs.com
 * that this site was updated
 * @return Object with properties error and message
 */

function ping() {
   var title = this.title ? this.title : this.alias;

   // we're doing it the xml-rpc way
   // (specs at http://newhome.weblogs.com/directory/11)
   var xr = new Remote("http://rpc.weblogs.com/RPC2");
   var ping = xr.weblogUpdates.ping(title, this.href());
   if (!ping.result)
      return;
   var result = new Object();
   result.error = ping.result.flerror;
   result.message = ping.result.message;

   if (result.error)
      app.log("Error when notifying weblogs.com for updated site \"" + this.alias + "\": " + result.message);

   // lastping is always set to now to prevent blogs
   // hanging in the scheduler if a fatal error occurs
   this.lastping = new Date();
   return(result);
}


/**
 *  href URL postprocessor. If a virtual host mapping is defined
 *  for this site's alias, use it. Otherwise, use normal site URL.
 */
function processHref(href) {
   var vhost = getProperty("vhost."+this.alias);
   if (vhost)
      return vhost+href;
   else
      return getProperty("defaulthost")+"/"+this.alias+href;
}

