/**
 * named array containing the display-names of
 * path-objects which is used by linkedpath_macro()
 */

DISPLAY = new Array();
DISPLAY["root"] = "Root";
DISPLAY["site"] = "Home";
DISPLAY["topicmgr"] = "Topics";
DISPLAY["storymgr"] = "Stories";
DISPLAY["filemgr"] = "Files";
DISPLAY["imagemgr"] = "Images";
DISPLAY["membermgr"] = "Members";
DISPLAY["sysmgr"] = "System Management";
DISPLAY["pollmgr"] = "Polls";
DISPLAY["skinmgr"] = "Skins";
DISPLAY["story"] = "Story";

/**
 * check if email-adress is syntactically correct
 */

function checkEmail(address) {
   var m = new Mail();
   m.addTo(address);
   if (m.status)
      return false;
   return true;
}


/**
 * function checks if the string passed contains special characters like
 * spaces, brackets etc.
 */

function isClean(str) {
   var invalidChar = new RegExp("[^a-zA-Z0-9]");
   if (invalidChar.exec(str))
      return false;
   return true;
}

/**
 * function checks if the string passed contains any characters that
 * are forbidden in URLS
 */

function isCleanForURL(str) {
   var invalidChar = new RegExp("[\\/?&=\\+#äöüß\\\\]");
   invalidChar.ignoreCase = true;
   if (invalidChar.exec(str))
      return false;
   return true;
}

/**
 * function checks if the string passed contains any characters that
 * are forbidden in image- or filenames
 */

function isCleanForName(str) {
   var invalidChar = new RegExp("[^a-zA-Z0-9\\.\\-_ ]");
   if (invalidChar.exec(str))
      return false;
   return true;
}

/**
 * function checks if there is a site-object in path
 * if true, it returns it
 * if false, it returns root
 */

function getParent() {
   if (res.handlers.site)
      return (res.handlers.site);
   else
      return (root);
}

/**
 * function creates macro-tags out of plain urls in text
 * does this with three replace-operations
 */

function formatLinks(str) {
   var pre = "<% this.link to=\"";
   var mid = "\" text=\"";
   var post = "\" %>";
   var l0 = new RegExp("<a href\\s*=\\s*\"?([^\\s\"]+)?\"?[^>]*?>([^<]*?)</a>");
   var l1 = new RegExp("([fhtpsr]+:\\/\\/[^\\s]+?)([\\.,;\\)\\]\"]?(\\s|$))");
   var l2 = new RegExp("(<%[^%]*?)" + pre + "(.*?)" + mid + ".*?" + post + "([^%]*?%>)");
   l0.ignoreCase = l1.ignoreCase = l2.ignoreCase = true;
   l0.global = l1.global = l2.global = true;
   
   str = str.replace(l0, pre + "$1" + mid + "$2" + post);
   str = str.replace(l1, pre + "$1" + mid + "$1" + post + "$3");
   str = str.replace(l2, "$1$2$3");
   return (str);
}

/**
 * function activates URLs to HTML link tags
 */

function activateLinks (str) {
   var pre = "<a href=\"";
   var mid = "\">";
   var post = "</a>";

   var l1 = new RegExp("(^|/>|\\s+)([fhtpsr]+:\\/\\/[^\\s]+?)([\\.,;\\)\\]\"]?)(?=[\\s<]|$)");
   l1.ignoreCase = true;
   l1.global = true;
   str = str.replace(l1, "$1" + pre + "$2" + mid + "$2" + post + "$3");
   return (str);
}

/**
 * function checks if url is correct
 * if not it assumes that http is the protocol
 */

function evalURL(url) {
   if (url && url.indexOf("@") > 0 && url.indexOf("mailto:") == -1)
      return ("mailto:" + url);
   else if (url && url.indexOf("://") == -1 && url.indexOf("mailto:") == -1)
      return ("http://" + url);
   return (url);
}

/**
 * function checks if user has permanent cookies
 * storing username and password
 */

function autoLogin() {
   if (session.user)
      return;
   var name = req.data.avUsr;
   var pw = req.data.avPw;
   if (!name || !pw)
      return;
   var u = root.users.get(name);
   if (!u)
      return;
   if (Packages.helma.util.MD5Encoder.encode(u.password+req.data.http_remotehost) != pw)
      return;
   else {
      if (session.login(name,u.password)) {
         u.lastVisit = new Date();
         res.message = getMessage("confirm","welcome",new Array(res.handlers.site ? res.handlers.site.title : root.getSysTitle(),session.user.name));
      } else
         return;
   }
}

/**
 * function checks if the name of the requested object has a slash in it
 * if true, it tries to fetch the appropriate parent-object (either site or root)
 * and to fetch the object with the requested name in the specified collection
 * @param String Name of the object to retrieve
 * @param String Name of the pool to search in
 * @return Obj Object with two properties: one containing the parent-object of the pool,
 *             the other containing the object itself;
 *             If parent or object is null, the function returns null.
 */

function getPoolObj(objName,pool) {
   var p = new Object();
   if (objName.indexOf("/") >= 0) {
      var objPath = objName.split("/");
      p.parent = (!objPath[0] || objPath[0] == "root") ? root : root.get(objPath[0]);
      p.objName = objPath[1];
   } else {
      p.parent = res.handlers.site;
      p.objName = objName;
   }
   if (!p.parent)
      return null;
   p.obj = p.parent[pool].get(p.objName);
   if (!p.obj)
      return null;
   return (p);
}

/**
 * function builds an array containing
 * default dateformat-patterns
 */

function getDefaultDateFormats(version) {
   var patterns = new Array();
   if (version == "short") {
      patterns[0] = "dd.MM.yyyy, HH:mm";
      patterns[1] = "dd.MM.yyyy, h:mm a";
      patterns[2] = "yyyy.MM.dd, HH:mm";
      patterns[3] = "yyyy.MM.dd, h:mm a";
      patterns[4] = "MM.dd, HH:mm";
      patterns[5] = "MM.dd, h:mm a";
      patterns[6] = "dd.MM, HH:mm";
      patterns[7] = "dd.MM, h:mm a";
      patterns[8] = "d.M, HH:m";
      patterns[9] = "d.M, h:m a";
      patterns[10] = "HH:mm";
      patterns[11] = "h:mm a";
      patterns[12] = "EEEE, HH:mm";
      patterns[13] = "EEEE, h:mm a";
      patterns[14] = "EE, HH:mm";
      patterns[15] = "EE, h:mm a";
   } else {
      patterns[0] = "EEEE, dd. MMMM yyyy, HH:mm";
      patterns[1] = "EEEE, dd. MMMM yyyy, h:mm a";
      patterns[2] = "EEEE, MMMM dd yyyy, h:mm a";
      patterns[3] = "EE, dd. MMM. yyyy, HH:mm";
      patterns[4] = "EE, dd. MMM. yyyy, h:mm a";
      patterns[5] = "EE, MMM dd yyyy, h:mm a";
      patterns[6] = "EE, dd.MM.yyyy, HH:mm";
      patterns[7] = "EE, dd.MM.yyyy, h:mm a";
      patterns[8] = "EE, MM.dd.yyyy, h:mm a";
      patterns[9] = "dd.MM.yyyy, HH:mm";
      patterns[10] = "MM.dd.yyyy, h:mm a";
      patterns[11] = "yyyy.MM.dd, HH:mm";
      patterns[12] = "yyyy.MM.dd, h:mm a";
      patterns[13] = "dd.MM, HH:mm";
      patterns[14] = "MM.dd, h:mm a";
   }
   return (patterns);
}


/**
 * This is a simple logger that creates a DB entry for 
 * each request that contains an HTTP referrer.
 * due to performance-reasons this is not written directly
 * into database but instead written to app.data.accessLog (=Vector)
 * and written to database by the scheduler once a minute
 */

function logAccess() {
   if (req.data.http_referer) {
      var site = res.handlers.site ? res.handlers.site : root;
      var referrer = req.data.http_referer;

      // no logging at all if the referrer comes from the same site
      // or is not a http-request
      if (referrer.indexOf("http") < 0)
         return;
      var siteHref = site.href().toLowerCase();
      if (referrer.toLowerCase().indexOf(siteHref.substring(0,siteHref.length-1)) >= 0)
         return;
      var logObj = new Object();
      logObj.storyID = path.story ? path.story._id : null;
      logObj.siteID = site._id;
      logObj.referrer = referrer;
      logObj.remoteHost = req.data.http_remotehost;
      logObj.browser = req.data.http_browser;
      
      // log to app.data.accessLog
      app.data.accessLog.add(logObj);
   }
   return;
}


/**
 * to register updates of a site at weblogs.com
 * (and probably other services, soon), this 
 * function can be called via the scheduler.
 */
function pingUpdatedSites() {
   var c = getDBConnection("antville");
   var dbError = c.getLastError();
   if (dbError) {
      app.log("Error establishing DB connection: " + dbError);
      return;
   }

   var query = "select SITE_ALIAS from AV_SITE where SITE_ISONLINE = 1 and SITE_ENABLEPING = 1 and  (SITE_LASTUPDATE > SITE_LASTPING or SITE_LASTPING is null)";
   var rows = c.executeRetrieval(query);
   var dbError = c.getLastError();
   if (dbError) {
      app.log("Error executing SQL query: " + dbError);
      return;
   }

   while (rows.next()) {
      var site = root.get(rows.getColumnItem("SITE_ALIAS"));
      app.log("Notifying weblogs.com for updated site '" + site.alias + "' (id " + site._id + ")");
      site.ping();
   }

   rows.release();
   return;
}


/**
 * parse a timestamp into a date object. This is used when  users
 * want to set createtime explicitly when creating/editing stories.
 *
 * @param time    The time as string
 * @param format   The format of the time string
 * @return            The parsed Date
 */
function parseTimestamp (time, format) {
   var df = new java.text.SimpleDateFormat (format);
   if (res.handlers.site)
       df.setTimeZone(res.handlers.site.getTimeZone());
   // time may be a number like "20021020", so convert to string
   return df.parse (time.toString());
}

/**
 * function formats a date to a string. It checks if a site object is
 * in the request path and if so uses its locale and timezone.
 *
 * @param Object Date to be formatted
 * @param String The format string
 * @return String The date formatted as string
 */
function formatTimestamp(ts,dformat) {
   // date format parsing is quite expensive, but date formats
   // are not thread safe, so what we do is to cache them per request
   // in the response object
   var sdf = res.data["timeformat"];
   var fmt = "yyyy/MM/dd HH:mm";
   var obj = res.handlers.site ? res.handlers.site : root;
   if (dformat == "short")
      fmt = obj.shortdateformat ? obj.shortdateformat : "yy.MM.dd-HH:mm";
   else if (dformat == "long")
      fmt = obj.longdateformat ? obj.longdateformat : "d. MMMM yyyy HH:mm'h'";
   else if (dformat)
      fmt = dformat;

   if (!sdf) {
      var locale = res.handlers.site ? res.handlers.site.getLocale() : root.getLocale();
      sdf = new java.text.SimpleDateFormat(fmt, locale);
      res.data["timeformat"] = sdf;
   } else if (fmt != sdf.toPattern()) {
      sdf.applyPattern(fmt);
   }
   var result = sdf.format(ts);
   return result;
}

/**
 * scheduler performing auto-disposal of inactive sites
 * and auto-blocking of private sites
 */

function scheduler() {
   // call autocleanup
   root.manage.autoCleanUp();
   // notify updated sites
   pingUpdatedSites();
   countUsers();
   // write the log-entries in app.data.accessLog into DB
   writeAccessLog();
   // store a timestamp in app.data indicating when last update
   // of accessLog was finished
   app.data.lastAccessLogUpdate = new Date();
   // store the readLog in app.data.readLog into DB
   writeReadLog();
   return (30000);
}


/**
 * this function is used to replicate a javascript object
 * (like a nacro's param object)
 * @param Object JavaScript-Object to clone
 * @return Object cloned JavaScript-Object
 */

function cloneObject(obj) {
  var clone = new Object();
  if (typeof obj != "object")
    return(obj);
  for (var i in obj)
    clone[i] = obj[i];
  return(clone);
}

/**
 * function constructs a server-message
 * @param String Name of message to display
 * @param optional String (or Array containing several Strings)
 *        to pass to message-skin
 * @return String rendered message
 */

function getMessage(msgClass,msgName,value) {
   // create array containing languages to search for message
   var languages = new Array();
   if (res.handlers.site && res.handlers.site.language)
      languages[0] = (res.handlers.site.getLocale().getLanguage());
   languages[languages.length] = (root.getLocale()).getLanguage();
   // the last language to search for messages is always english
   languages[languages.length] = "en";
   // loop over languages and try to find the message
   for (var i in languages) {
      var lang = app.data[languages[i]];
      if (lang && lang.getProperty(msgClass + "." + msgName)) {
         var message = lang.getProperty(msgClass + "." + msgName);
         // create param-object needed to render Skin
         var param = new Object();
         // check if value passed is actually an array
         if (value && typeof(value) == typeof(String()))
            param.value1 = value;
         else if (value && value.length > 0) {
            for (var i in value)
               param["value" + (parseInt(i,10)+1)] = value[i];
         }
         return (renderSkinAsString(createSkin(message),param));
      }
   }
   // still no message found, so return
   return ("[couldn't find message!]");
}

/**
 * function creates a result-object that contains a message
 * and a property indicating if this result-object is classified
 * as error or not
 * @param String Class of message
 * @param String Name of message
 * @param optional String (or Array containing several Strings)
 *        to pass to message-skin
 * @param Boolean flag indicating error or not
 * @return Obj result-Object
 */

function createResultObj(msgClass,msgName,value,error) {
   var result = new Object();
   result.message = getMessage(msgClass,msgName,value);
   result.error = error;
   return (result);
}

/**
 * wrapper-function to create a result-object of type "error"
 */

function getError(msgName,value) {
   return (createResultObj("error",msgName,value,true));
}

/**
 * wrapper-function to create a result-object of type "confirm"
 */

function getConfirm(msgName,value) {
   return (createResultObj("confirm",msgName,value,false));
}

/**
 * function gets a MimePart passed as argument and
 * constructs an alias based on the name
 * @param Obj MimePart-Object
 * @return String determined name
 */

function buildAliasFromFile(uploadFile) {
   var rawName = uploadFile.getName().split("/");
   var name = rawName[rawName.length-1];
   if (name.indexOf(".") > -1)
      name = name.substring(0,name.indexOf("."));
   // clean name from any invalid characters
   var invalidChars = new RegExp("[ \\/?&=\\+#äöüß\\\\]");
   invalidChars.ignoreCase = true;
   invalidChars.global = true;
   return (name.replace(invalidChars,""));
}

/**
 * function loads messages on startup
 */

function onStart() {
   // load application messages
   var dir = app.__app__.getAppDir();
   var arr = dir.list();
   for (var i in arr) {
   	if (arr[i].indexOf("messages.") > -1) {
         var name = arr[i].substring(arr[i].indexOf(".")+1,arr[i].length);
   		var msgFile = new File(dir, arr[i]);
   		app.data[name] = new Packages.helma.util.SystemProperties (msgFile.getAbsolutePath());
   		app.log ("loaded application messages (language: " + name + ")");
   	}
   }
   // load macro help file
   var macroHelpFile = new File(dir, "macro.help");
   app.data.macros = new Packages.helma.util.SystemProperties (macroHelpFile.getAbsolutePath());
   //eval(macroHelpFile.readAll());
   app.log("loaded macro help file");
   // creating the vector for referrer-logging
   app.data.accessLog = new java.util.Vector();
   // creating the hashtable for storyread-counting
   app.data.readLog = new java.util.Hashtable();
   return;
}


/**
 * translates all characters of a string into HTML entities
 * @param String characters to be translated
 * @return String translated result
 */

function translateToEntities(str) {
   var result = "";
   for (var i=0; i<str.length; i++) {
      result += "&#" + str.charCodeAt(i) + ";";
   }
   return(result);
}


/**
 * function retuns only a part of the text passed as argument
 * length of the string to show is defined by argument "limit"
 */
function clipText(text, limit, clipping) {
   var text = stripTags(text);
   if (text.length <= limit)
      return text;
   if (!clipping)
      clipping = "...";
   var cut = text.indexOf(" ",limit);
   if (cut == -1)
      return text;
   return text.substring(0,cut)+clipping;
}


/**
 * function adds a <wbr /> tag each 30 characters
 */

function softwrap(str) {
   if (str.length<30)
      return str;
   var wrapped = new java.lang.StringBuffer();
   for (var i=0; i<str.length; i=i+30) {
      var strPart = str.substring(i, i+30);
      wrapped.append(strPart);
      if (strPart.length == 30 && strPart.indexOf(" ") < 0)
         wrapped.append("<wbr />");
   }
   return (wrapped.toString());
}


/**
 * This function parses a string for <img> tags and turns them
 * into <a> tags.  
 */ 

function fixRssText(str) {
   var re = new RegExp("<img src\\s*=\\s*\"?([^\\s\"]+)?\"?[^>]*?(alt\\s*=\\s*\"?([^\"]+)?\"?[^>]*?)?>");
   re.ignoreCase = true;
   re.global = true;
   str = str.replace(re, "[<a href=\"$1\" title=\"$3\">Image</a>]");
 	return str;
}


/**
 * function counting active users and anonymous sessions
 * (thought to be called by the scheduler)
 */

function countUsers() {
   app.data.activeUsers = new Array();
   var l = app.getActiveUsers();
   for (var i in l)
      app.data.activeUsers[app.data.activeUsers.length] = l[i];
   l = app.getSessions();
   app.data.sessions = 0;
   for (var i in l) {
      if (!l[i].user)
         app.data.sessions++;
   }
   app.data.activeUsers.sort();
}

/**
 * function swaps app.data.accessLog, loops over the objects
 * contained in Vector and inserts records for every log-entry
 * in AV_ACCESSLOG
 */
function writeAccessLog() {
   if (app.data.accessLog.size() == 0)
      return;
   // first of all swap app.data.accessLog
   var size = app.data.accessLog.size();
   var log = app.data.accessLog;
   app.data.accessLog = new java.util.Vector(size);
   // open database-connection
   var c = getDBConnection("antville");
   var dbError = c.getLastError();
   if (dbError) {
      app.log("Error establishing DB connection: " + dbError);
      return;
   }
   // loop over log-vector
   var query;
   for (var i=0;i<log.size();i++) {
      var logObj = log.get(i);
      query = "insert into AV_ACCESSLOG (ACCESSLOG_F_SITE,ACCESSLOG_F_TEXT," +
         "ACCESSLOG_REFERRER,ACCESSLOG_IP,ACCESSLOG_BROWSER) values (" + 
         logObj.siteID + "," + logObj.storyID + ",'" + logObj.referrer + "','" + logObj.remoteHost + 
         "','" + logObj.browser + "')";
      c.executeCommand(query);
      if (dbError) {
         app.log("Error executing SQL query: " + dbError);
         return;
      }
   }
   app.log("wrote " + i + " referrers into database");
   return;
}

/**
 * function swaps app.data.readLog, loops over the logObjects
 * contained in the Hashtable and updates the read-counter
 * of all stories
 */
function writeReadLog() {
   if (app.data.readLog.size() == 0)
      return;
   // first of all swap app.data.readLog
   var size = app.data.readLog.size();
   var log = app.data.readLog;
   app.data.readLog = new java.util.Hashtable(size);
   // loop over Hashtable
   var reads = log.elements();
   while (reads.hasMoreElements()) {
      var el = reads.nextElement();
      var story = root.storiesByID.get(String(el.story));
      if (!story)
         continue;
      story.reads = el.reads;
   }
   app.log("updated read-counter of " + log.size() + " stories in database");
   return;
}

/**
 * rescue story/comment by copying all necessary properties to
 * session.data.rescuedText. this will be copied back to
 * req.data by restoreRescuedText() after successful login
 * @param Object req.data
 */
function rescueText(param) {
   session.data.rescuedText = new Object();
   for (var i in param) {
      if (i.indexOf("content_") == 0)
         session.data.rescuedText[i] = param[i];
   }
   session.data.rescuedText.discussions = param.discussions;
   session.data.rescuedText.topic = param.topic;
   session.data.rescuedText.discussions_array = param.discussions_array;
   session.data.rescuedText.submit = param.submit;
   session.data.rescuedText.save = param.save;
   session.data.rescuedText.topicidx = param.topicidx;
   session.data.rescuedText.online = param.online;
   session.data.rescuedText.editableby = param.editableby;
   session.data.rescuedText.createtime = param.createtime;
   return;
}

/**
 * restore rescued Text in session.data by copying
 * all properties back to req.data
 */
function restoreRescuedText() {
   // copy story-parameters back to req.data
   for (var i in session.data.rescuedText)
      req.data[i] = session.data.rescuedText[i];
   session.data.rescuedText = null;
   return;
}


/**
 * helper function to calculate percentages
 * @param Number base value
 * @param Number percent value
 * @return Float percentage
 */

function percentage(base, n) {
	var p = n / (base / 100);
	return Math.round(p * 100) / 100;   
}
