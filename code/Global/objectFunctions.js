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
 * function checks if there is a weblog-object in path
 * if true, it sets the skin of response to "page" and returns the weblog-object found
 * if false, it uses root and it's page-skin
 */

function setLayout() {
   if (path.weblog) {
      res.skin = "weblog.page";
      return (path.weblog);
   } else {
      res.skin = "root.page";
      return (root);
   }
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

   var l1 = new RegExp("(^|\\s)([fhtpsr]+:\\/\\/[^\\s]+?)([\\.,;\\)\\]\"]?(\\s|$))");
   l1.ignoreCase = true;
   l1.global = true;
   
   // this is odd, but we have to run the regexp twice to catch URLs 
   // which imediately follow each other. This is because the leading 
   // and trailing whitespaces are part of the expression, and if there's only 
   // one whitespace character between two URLs, the first match eats it up 
   // and the second URL doesn't match.
   str = str.replace(l1, "$1" + pre + "$2" + mid + "$2" + post + "$4");
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
   if (user.uid)
      return;
   var name = req.data.avUsr;
   var pw = req.data.avPw;
   if (!name || !pw)
      return;
   var u = getUser(name);
   if (!u)
      return;
   if (Packages.helma.util.MD5Encoder.encode(u.password) != pw)
      return;
   else {
      if (user.login(name,u.password)) {
         user.lastVisit = new Date();
         res.message = "Welcome to Antville, " + user.name + "! Have fun!";
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
   if (!user.uid) {
      // user is not logged in
      if (referrer)
         user.cache.referrer = referrer;
      res.redirect(path.weblog ? path.weblog.members.href("login") : root.members.href("login"));
   }
   return;
}

/**
 * function checks if the name of the requested object has a slash in it
 * if true, it tries to fetch the appropriate parent-object (either weblog or root)
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
      p.parent = path.weblog;
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
		var weblog = path["weblog"];
		var storyID = path["story"] ? path["story"]._id : null;
		var referrer = req.data.http_referer;
		var ip = req.data.http_remotehost;
		var hopPath = path[path.length-1].href();
		var action = req.action;
		var browser = req.data.http_browser;

		// we're doing this with direct db access here
		// (there's no need to do it with prototypes):
		var c = getDBConnection("antville");
		var error = c.getLastError();
		if (error) {
			writeln("Error establishing DB connection: " + error);
			return;
		}
		var query = "insert into ACCESS (WEBLOG_ID, STORY_ID, REFERRER, IP, URL, PATH, ACTION, BROWSER, DATE) values (" + weblog._id + ", " + storyID + ", \"" + referrer + "\", \"" + ip + "\", \"" + hopPath + action + "\", \"" + hopPath + "\", \"" + action + "\", \"" + browser + "\", now());";
		c.executeCommand(query);
		var error = c.getLastError();
		if (error) {
			writeln("Error executing SQL query: " + error);
			return;
		}
		// No need to release database connection, since this is the connection managed by
		// Helma and she'll release it when it's been idle long enough.
		// c.release();
		return;
	}
}


/**
 * to register updates of a weblog at weblogs.com
 * (and probably other services, soon), this 
 * function can be called via the scheduler.
 */
 
function pingUpdatedWeblogs() {
	for (var i=0; i<root.allWeblogs.size(); i++) {
		var blog = root.allWeblogs.get(i);
		var now = new Date();
		var period = 1000 * 60 * 60; // one hour
		if ((now - blog.lastPing >= period) && (now - blog.lastUpdate <= period) && blog.online) {
			writeln(blog.title + " was updated, so i'll ping weblogs.com...");
			var url = getProperty("baseURI") + blog.href();
			//var ping = getURL("http://newhome.weblogs.com/pingSiteForm?name=" + blog.title + "&url=" + url);
			var xr = new Remote("http://rpc.weblogs.com/RPC2");
			var ping = xr.weblogUpdates.ping(blog.title, url); 
			if (ping.error)
				writeln(ping.error);
			blog.lastPing = now;
		}
	}
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
   return df.parse (time);
}

/**
 * scheduler performing auto-disposal of inactive weblogs
 * and auto-blocking of private weblogs
 * if defined in app.properties
 */

function scheduler() {
   // call automatic cleanup if sysmgr is installed
   tryEval("root.manage.autoCleanUp()");
}
