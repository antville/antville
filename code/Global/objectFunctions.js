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
 * function checks if req.data.date[Year|Month|Date|Hours|Minutes] is valid
 * if correct, creates dateobject and returns it
 * otherwise false
 */

function checkDate() {
   if (req.data.dateYear && req.data.dateMonth && req.data.dateDate && req.data.dateHours && req.data.dateMinutes) {
      var ts = new Date();
      ts.setYear(parseInt(req.data.dateYear));
      ts.setMonth(parseInt(req.data.dateMonth));
      ts.setDate(parseInt(req.data.dateDate));
      ts.setHours(parseInt(req.data.dateHours));
      ts.setMinutes(parseInt(req.data.dateMinutes));
      ts.setSeconds(0);
      return (ts);
   } else
      return false;
}

/**
 * function checks if the string passed contains special characters like
 * spaces, brackets etc.
 */

function isClean(str) {
   var invalidChar = new RegExp("[^a-z,^A-Z,^0-9]");
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
 * function checks if there is a site-object in path
 * if true, it returns it
 * if false, it returns root
 */

function getParent() {
   if (path.site)
      return (path.site);
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

   var l1 = new RegExp("(^|[\\s]?)([fhtpsr]+:\\/\\/[^\\s<]+?)([\\.,;\\)\\]\"]?([\\s<]|$))");
   l1.ignoreCase = true;
   l1.global = true;
   str = str.replace(l1, "$1" + pre + "$2" + mid + "$2" + post + "$4");

   // because of caching of text i had to disable the following
   // it's now done in text_macro() of comment and story
   // and in title_macro() of story
   // do Wiki style substitution
   // return (doWikiStuff (str));
   return (str);
}

/**
 * function checks if url is correct
 * if not it assumes that http is the protocol
 */

function evalURL(url) {
   if (url && url.indexOf("://") < 0)
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
   if (Packages.helma.util.MD5Encoder.encode(u.password) != pw)
      return;
   else {
      if (session.login(name,u.password)) {
         u.lastVisit = new Date();
         res.message = getMsg("confirm","welcome",new Array(path.site ? path.site.title : root.getSysTitle(),session.user.name));
      } else
         return;
   }
}

/**
 * function checks if user is logged in or not
 * if false, it redirects to the login-page
 * but before it stores the url to jump back (if passed as argument)
 */

function checkIfLoggedIn(referrer) {
   if (!session.user) {
      // user is not logged in
      if (referrer)
         session.data.referrer = referrer;
      res.redirect(path.site ? path.site.members.href("login") : root.members.href("login"));
   }
   return;
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
      p.parent = path.site;
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
      patterns[0] = "yyyy.MM.dd, HH:mm";
      patterns[1] = "yyyy.MM.dd, h:mm a";
      patterns[2] = "dd.MM.yyyy, HH:mm";
      patterns[3] = "dd.MM.yyyy, h:mm a";
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
 * each request that contains an HTTP referrer. This is
 * done by direct DB interface due to performance reasons.
 */

function logAccess() {
   if (req.data.http_referer) {
      var site = path.site ? path.site : root;
      var referrer = req.data.http_referer;

      // no logging at all if the referrer comes from the same site
      // or is not a http-request
      if (referrer.indexOf("http") < 0)
         return;
      var siteHref = site.href().toLowerCase();
      if (referrer.toLowerCase().indexOf(siteHref.substring(0,siteHref.length-1)) >= 0)
         return;

      var storyID = path.story ? path.story._id : null;

      // we're doing this with direct db access here
      // (there's no need to do it with prototypes):
      var c = getDBConnection("antville");
      var dbError = c.getLastError();
      if (dbError) {
         app.__app__.logEvent("Error establishing DB connection: " + dbError);
         return;
      }
      var query = "insert into AV_ACCESSLOG (ACCESSLOG_F_SITE, ACCESSLOG_F_TEXT, ACCESSLOG_REFERRER, ACCESSLOG_IP, ACCESSLOG_BROWSER) values (" + site._id + ", " + storyID + ", '" + referrer + "', '" + req.data.http_remotehost + "', '" + req.data.http_browser + "')";
      c.executeCommand(query);
      var dbError = c.getLastError();
      if (dbError) {
         app.__app__.logEvent("Error executing SQL query: " + dbError);
         return;
      }
      return;
   }
}


/**
 * to register updates of a site at weblogs.com
 * (and probably other services, soon), this 
 * function can be called via the scheduler.
 */
 
function pingUpdatedSites() {
   // var period = 1000 * 60 * 60; // one hour

   var c = getDBConnection("antville");
   var dbError = c.getLastError();
   if (dbError) {
      app.__app__.logEvent("Error establishing DB connection: " + dbError);
      return;
   }

   var query = "select SITE_ID from AV_SITE where SITE_ISONLINE = 1 and SITE_ENABLEPING = 1 and  (SITE_LASTUPDATE > SITE_LASTPING or SITE_LASTPING is null)";
   var rows = c.executeRetrieval(query);
   var dbError = c.getLastError();
   if (dbError) {
      app.__app__.logEvent("Error executing SQL query: " + dbError);
      return;
   }

   while (rows.next()) {
      var id = rows.getColumnItem("ID");
      var site = root.get(id.toString());
      app.__app__.logEvent("Notifying weblogs.com for updated site '" + site.alias + "' (id " + id + ")");
      blog.ping();
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
   if (path.site)
       df.setTimeZone(path.site.getTimeZone());
   return df.parse (time);
}

/**
 * function formats a date to a string. It checks if a site object is
 * in the request path and if so uses its locale and timezone.
 *
 * @param ts           Date to be formatted
 * @param format     The format string
 * @return               The date formatted as string
 */
function formatTimestamp(ts,dformat) {
   // date format parsing is quite expensive, but date formats
   // are not thread safe, so what we do is to cache them per request
   // in the response object using "timeformat_<format>" as key.
   var sdf = res.data["timeformat_"+dformat];
   if (!sdf) {
      var fmt = "yyyy/MM/dd HH:mm";
      if (path.site) {
         if (dformat == "short")
            fmt = path.site.shortdateformat ? path.site.shortdateformat : "dd.MM HH:mm";
         else if (dformat == "long")
            fmt = path.site.longdateformat ? path.site.longdateformat : "yyyy/MM/dd HH:mm";
         else if (dformat)
            fmt = dformat;
         sdf = new java.text.SimpleDateFormat(fmt,path.site.getLocale());
         sdf.setTimeZone(path.site.getTimeZone())
      } else {
         if (dformat)
            fmt = dformat;
         sdf = new java.text.SimpleDateFormat(fmt,root.getLocale());
      }
      res.data["timeformat_"+dformat] = sdf;
   }
   var result = tryEval("sdf.format(ts)");
   if (result.error)
      return (getMsg("error","wrongDateFormat"));
   return (result.value);
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
}


/**
 * DEPRECATED!
 * this function was used to replicate a read-only
 * javascript object (like a nacro's param object)
 * for the purpose of creating a writeable clone.
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

function getMsg(msgClass,name,value) {
   // create array containing languages to search for message
   var languages = new Array();
   if (path && path.site && path.site.language)
      languages[0] = (path.site.getLocale().getLanguage());
   languages[languages.length] = (root.getLocale()).getLanguage();
   // the last language to search for messages is always english
   languages[languages.length] = "en";
   // loop over languages and try to find the message
   for (var i in languages) {
      var lang = app.data[languages[i]];
      if (lang && lang[msgClass] && lang[msgClass][name]) {
         var message = lang[msgClass][name];
         // create param-object needed to render Skin
         var param = new Object();
         // check if value passed is actually an array
         if (value && typeof(value) == typeof(String()))
            param.value1 = value;
         else if (value && value.length > 0) {
            for (var i in value)
               param["value" + (parseInt(i)+1)] = value[i];
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

function createResultObj(msgClass,msg,value,error) {
   var result = new Object();
   result.message = getMsg(msgClass,msg,value);
   result.error = error;
   return (result);
}

/**
 * wrapper-function to create a result-object of type "error"
 */

function getError(messageName,value) {
   return (createResultObj("error",messageName,value,true));
}

/**
 * wrapper-function to create a result-object of type "confirm"
 */

function getConfirm(messageName,value) {
   return (createResultObj("confirm",messageName,value,false));
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