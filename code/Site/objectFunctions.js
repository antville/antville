/**
 * function saves new properties of site
 * @param Obj Object containing the form values
 * @param Obj User-Object modifying this site
 * @return Obj Object containing two properties:
 *             - error (boolean): true if error happened, false if everything went fine
 *             - message (String): containing a message to user
 */

function evalPreferences(param,modifier) {
   if (!checkEmail(param.email))
      return (getError("emailInvalid"));
   this.title = stripTags(param.title);
   this.tagline = param.tagline;
   this.email = param.email;
   this.bgcolor = param.bgcolor;
   this.textfont = param.textfont;
   this.textsize = param.textsize;
   this.textcolor = param.textcolor;
   this.linkcolor = param.linkcolor;
   this.alinkcolor = param.alinkcolor;
   this.vlinkcolor = param.vlinkcolor;
   this.titlefont = param.titlefont;
   this.titlesize = param.titlesize;
   this.titlecolor = param.titlecolor;
   this.smallfont = param.smallfont;
   this.smallsize = param.smallsize;
   this.smallcolor = param.smallcolor;
   this.days = !isNaN(parseInt(param.days,10)) ? parseInt(param.days,10) : 3;
   if (this.online && !param.online)
      this.lastoffline = new Date();
   this.online = param.online ? 1 : 0;
   this.discussions = param.discussions ? 1 : 0;
   this.usercontrib = param.usercontrib ? 1 : 0;
   this.archive = param.archive ? 1 : 0;
   this.enableping = param.enableping ? 1 : 0;
   // store selected locale in this.language and this.country
   var locs = java.util.Locale.getAvailableLocales();
   var newLoc = locs[parseInt(param.locale,10)];
   if (!newLoc)
      newLoc = java.util.Locale.getDefault();
   this.country = newLoc.getCountry();
   this.language = newLoc.getLanguage();
   // store selected timezone in this.timezone
   var timezones = java.util.TimeZone.getAvailableIDs();
   var newZone = timezones[parseInt(param.timezone,10)];
   this.timezone = newZone ? newZone : null;

   // reset cached locale, timezone and dateSymbols
   this.cache.locale = null;
   this.cache.timezone = null;
   this.cache.dateSymbols = null;

   // long dateformat
   var ldf = LONGDATEFORMATS[parseInt(param.longdateformat,10)];
   this.longdateformat = ldf ? ldf : null;

   // short dateformat
   var sdf = SHORTDATEFORMATS[parseInt(param.shortdateformat,10)];
   this.shortdateformat = sdf ? sdf : null;

   this.modifytime = new Date();
   this.modifier = modifier;
   return (getConfirm("update"));
}


/**
 * function creates the directory that will contain the images of this site
 */

function createImgDirectory() {
   var dir = new File(getProperty("imgPath") + this.alias + "/");
   return (dir.mkdir());
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
   if (this.language)
      locale = new java.util.Locale(this.language,this.country ? this.country : "");
   else
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
   var timezone = this.cache.timezone;
   if (timezone)
       return timezone;
   if (this.timezone)
       timezone = java.util.TimeZone.getTimeZone(this.timezone);
   else
       timezone = java.util.TimeZone.getDefault();
   this.cache.timezone =timezone;
   return timezone;
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
   this.members.deleteAll();
   this.images.deleteAll();
   this.files.deleteAll();
   this.skins.deleteAll();
   this.stories.deleteAll();
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
      return "/"+this.alias+href;
}

