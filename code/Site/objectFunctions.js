/**
 * check if there are any stories in the previous month
 */

function renderLinkToPrevMonth(cal) {
   // create Object used to pass to format-function
   var tsParam = new Object();
   tsParam.format = "MMMM";

   if (!this.size())
      return ("&nbsp;");
   if (parseInt(this.get(this.size()-1).groupname,10) < parseInt(cal.getTime().format("yyyyMMdd"),10)) {
      // there are any stories left back in history, so try to get them ...
      prevDay = false;
      while (!prevDay) {
         cal.add(java.util.Calendar.DATE,-1);
         if (this.get(cal.getTime().format("yyyyMMdd")))
            prevDay = this.get(cal.getTime().format("yyyyMMdd"));
      }
      return ("<a href=\"" + prevDay.href() + "\">" + this.formatTimestamp(cal.getTime(),tsParam) + "</a>");
   } else {
      return ("&nbsp;");
   }
}


/**
 * check if there are any stories in the previous month
 */

function renderLinkToNextMonth(cal) {
   // create Object used to pass to format-function
   var tsParam = new Object();
   tsParam.format = "MMMM";

   if (!this.size())
      return ("&nbsp;");
   if (parseInt(this.get(0).groupname,10) > parseInt(cal.getTime().format("yyyyMMdd"),10)) {
      // there are any stories, so try to get them ...
      nextDay = false;
      while (!nextDay) {
         cal.add(java.util.Calendar.DATE,1);
         if (this.get(cal.getTime().format("yyyyMMdd")))
            nextDay = this.get(cal.getTime().format("yyyyMMdd"));
      }
      return ("<a href=\"" + nextDay.href() + "\">" + this.formatTimestamp(cal.getTime(),tsParam) + "</a>");
   } else {
      return ("&nbsp;");
   }
}



/**
 * function saves new properties of weblog
 * @param Obj Object containing the form values
 * @param Obj User-Object modifying this weblog
 * @return Obj Object containing two properties:
 *             - error (boolean): true if error happened, false if everything went fine
 *             - message (String): containing a message to user
 */

function evalPreferences(param,modifier) {
   var result = new Object();
   result.error = false;
   if (!checkEmail(param.email)) {
      result.message = "The email-address is invalid!";
      result.error = true;
      return (result);
   }
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
   this.days = parseInt(param.days,10);
   var online = parseInt(param.online,10);
   if (this.online && !online)
      this.lastoffline = new Date();
   this.online = online;
   this.online = parseInt(param.online,10);
   this.discussions = parseInt(param.discussions,10);
   this.usercontrib = parseInt(param.usercontrib,10);
   this.archive = parseInt(param.archive,10);
   this.enableping = parseInt(param.enableping,10);
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
   if (!newZone)
      this.timezone = null;
   else
      this.timezone =newZone;
   // reset cached locale and timezone
   this.cache.locale = null;
   this.cache.timezone = null;

   // long dateformat
   var patterns = getDefaultDateFormats();
   var ldf = patterns[parseInt(param.longdateformat,10)];
   this.longdateformat = ldf ? ldf : null;

   // short dateformat
   var patterns = getDefaultDateFormats("short");
   var ldf = patterns[parseInt(param.shortdateformat,10)];
   this.shortdateformat = ldf ? ldf : null;

   this.modifytime = new Date();
   this.modifier = modifier;
   result.message = "The changes were saved successfully!";
   return (result);
}


/**
 * function returns true if discussions are enabled
 * for this weblog
 */

function hasDiscussions() {
   if (parseInt(this.discussions,10))
      return true;
   return false;
}

/**
 * function returns true if weblog is online
 * otherwise false
 */

function isOnline() {
   if (parseInt(this.online,10))
      return true;
   return false;
}

/**
 * function creates the directory that will contain the images of this weblog
 */

function createImgDirectory() {
   var dir = new File(getProperty("imgPath") + this.alias + "/");
   return (dir.mkdir());
}

/**
 * function checks if language and/or country was specified for this weblog
 * if true, it returns the timestamp formatted with the given locale
 */

function formatTimestamp(ts,param) {
   formatTimestamp(ts,param.format);
}

/**
 * function checks if language and country were specified
 * for this weblog. if so, it returns a Locale-object
 * otherwise false
 */

function getLocale() {
   var locale = this.cache.locale;
   if (locale) 
       return locale;
   if (this.language)
      locale = new java.util.Locale(this.language,this.country ? this.country : "");
   else
      locale = java.util.Locale.getDefault();
   this.cache.locale =locale;
   return locale;
}

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
 * function checks if story is online in weblog
 * @param Obj story to check
 * @return Boolean true if online, false if not
 */

function isStoryOnline(st) {
   if (parseInt(st.online,10) == 2)
      return true;
   return false;
}


/**
 * This function parses a string for <img> tags and turns them
 * into <a> tags.  
 */ 

function rssConvertHtmlImageToHtmlLink(str) {
   var re = new RegExp("<img src\\s*=\\s*\"?([^\\s\"]+)?\"?[^>]*?(alt\\s*=\\s*\"?([^\"]+)?\"?[^>]*?)?>");
   re.ignoreCase = true;
   re.global = true;
   str = str.replace(re, "[<a href=\"$1\" title=\"$3\">Image</a>]");
 	return(str);
}

/**
 * function deletes all assets of a weblog (recursive!)
 */

function deleteAll() {
   this.members.deleteAll();
   this.images.deleteAll();
   this.goodies.deleteAll();
   this.skins.deleteAll();
   this.stories.deleteAll();
   return true;
}

/**
 * check if weblog is trusted
 * @return Boolean true in case weblog is trusted, false otherwise
 */

function isTrusted() {
   if (parseInt(this.trusted,10))
      return true;
   return false;
}


/**
 * send notification to weblogs.com
 * that this weblog was updated
 * @return Object with properties error and message
 */

function ping() {
	var title = this.title ? this.title : this.alias;

	// we're doing it the xml-rpc way
	// (specs at http://newhome.weblogs.com/directory/11)
	var xr = new Remote("http://rpc.weblogs.com/RPC2");
	var ping = xr.weblogUpdates.ping(title, this.href());

	var result = new Object();
	result.error = ping.result.flerror;
	result.message = ping.result.message;

	if (result.error)
		app.__app__.logEvent("Error when notifying weblogs.com for updated weblog #" + this._id + ": " + result.message);

	// this is the easy post url method (maybe faster?)
	// var ping = getURL("http://newhome.weblogs.com/pingSiteForm?name=" + this.title + "&url=" + this.href());

	// lastping is always set to now to prevent blogs
	// hanging in the scheduler if a fatal error occurs
	this.lastping = new Date();
	return(result);
}

