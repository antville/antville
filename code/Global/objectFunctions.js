/**
 * check if email-adress is syntactically correct
 */
function evalEmail(address) {
   var m = new Mail();
   m.addTo(address);
   if (m.status != 0)
      throw new Exception("emailInvalid");
   return address;
}

/**
 * function checks if url is correct
 * if not it assumes that http is the protocol
 */
function evalURL(url) {
   if (!url || url.contains("://") || url.contains("mailto:"))
      return url;
   if (url.contains("@"))
      return "mailto:" + url;
   else
      return "http://" + url;
}

/**
 * function returns file-extension according to mimetype of raw-image
 * returns false if mimetype is unknown
 * @param String Mimetype of image
 * @return String File-Extension to use
 */
function evalImgType(ct) {
   switch (ct) {
      case "image/jpeg" :
         return "jpg";
         break;
      case "image/pjpeg" :
         return "jpg";
         break;
      case "image/gif" :
         return "gif";
         break;
      case "image/x-png" :
         return "png";
         break;
      case "image/png" :
         return "png";
         break;
      case "image/x-icon" :
         return "ico";
   }
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
   if ((u.password + req.data.http_remotehost).md5() != pw)
      return;
   else if (session.login(name, u.password)) {
      u.lastVisit = new Date();
      res.message = getMessage("confirm.welcome", [(res.handlers.site ? res.handlers.site : root).getTitle(), session.user.name]);
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
function getPoolObj(objName, pool) {
   var p = new Object();
   if (objName.contains("/")) {
      var objPath = objName.split("/");
      p.parent = root.get(objPath[0]);
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
      if (!referrer.contains("http"))
         return;
      var siteHref = site.href().toLowerCase();
      if (referrer.toLowerCase().contains(siteHref.substring(0, siteHref.length-1)))
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
 * function formats a date to a string. It checks if a site object is
 * in the request path and if so uses its locale and timezone.
 *
 * @param Object Date to be formatted
 * @param String The format string
 * @return String The date formatted as string
 */
function formatTimestamp(ts, dformat) {
   var fmt;
   switch (dformat) {
      case "short" :
         fmt = res.handlers.site ?
               res.handlers.site.preferences.getProperty("shortdateformat") :
               root.shortdateformat;
         break;
      case "long" :
         fmt = res.handlers.site ?
               res.handlers.site.preferences.getProperty("longdateformat") :
               root.longdateformat;
         break;
      default :
         fmt = dformat;
   }
   // if we still have no format pattern use a default one
   if (!fmt)
      var fmt = "yyyy-MM-dd HH:mm";
   var handler = res.handlers.site ? res.handlers.site : root;
   try {
      return ts.format(fmt, handler.getLocale(), handler.getTimeZone());
   } catch (err) {
      return "[invalid format pattern]";
   }
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
   // countUsers();
   // write the log-entries in app.data.accessLog into DB
   writeAccessLog();
   // store a timestamp in app.data indicating when last update
   // of accessLog was finished
   app.data.lastAccessLogUpdate = new Date();
   // store the readLog in app.data.readLog into DB
   writeReadLog();
   // send mails and empty mail queue
   flushMailQueue();
   return 30000;
}


/**
 * constructor function for Message objects
 * @param String Name of the message
 * @param Obj String or Array of strings passed to message-skin
 * @param Obj Result Object (optional)
 */
function Message(name, value, obj) {
   this.name = name;
   this.value = value;
   this.obj = obj;
   this.toString = function() {
      return getMessage("confirm." + this.name, this.value);
   }
}

/**
 * constructor function for Exception objects
 * @param String Name of the message
 * @param Obj String or Array of strings passed to message-skin
 */
function Exception(name, value) {
   this.name = name;
   this.value = value;
   this.toString = function() {
      return getMessage("error." + this.name, this.value);
   }
}

/**
 * constructor function for MailException objects
 * @param String Name of the message
 */
function MailException(name) {
   this.name = name;
   this.toString = function() {
      return getMessage("error." + this.name);
   }
}


/**
 * constructor function for DenyException objects
 * @param String Name of the message
 */
function DenyException(name) {
   this.name = name;
   this.toString = function() {
      return getMessage("deny." + this.name);
   }
}


/**
 * function retrieves a message from the message file
 * of the appropriate language
 */
function getMessage(property, value) {
   // create array containing languages to search for message
   var languages = new Array();
   if (res.handlers.site)
      languages[0] = res.handlers.site.getLocale().getLanguage();
   languages[languages.length] = (root.getLocale()).getLanguage();
   // the last language to search for messages is always english
   if ("en" != languages[languages.length-1])
      languages[languages.length] = "en";
   // loop over languages and try to find the message
   for (var i in languages) {
      var lang = app.data[languages[i]];
      if (lang && lang.getProperty(property)) {
         var source = lang.getProperty(property);
         var param = new Object();
         // check if value passed is a string or an array
         if (value) {
            if (value instanceof Array) {
               for (var i in value)
                  param["value" + (parseInt(i, 10)+1)] = value[i];
            } else
               param.value1 = value;
         }
         return (renderSkinAsString(createSkin(source), param));
      }
   }
   // still no message found, so return
   return "[couldn't find message!]";
}

/**
 * function gets a MimePart passed as argument and
 * constructs an object-alias based on the name of the uploaded file
 * @param Obj MimePart-Object
 * @param Obj Destination collection
 */
function buildAliasFromFile(uploadFile, collection) {
   var rawName = uploadFile.getName().split("/");
   var filename = rawName[rawName.length-1];
   if (filename.lastIndexOf(".") > -1)
      filename = filename.substring(0, filename.lastIndexOf("."));
   return (buildAlias(filename, collection));
}

/**
 * function gets a String passed as argument and
 * constructs an object-alias which is unique in
 * a collection
 * @param String proposed alias for object
 * @param Obj Destination collection
 * @return String determined name
 */
function buildAlias(alias, collection) {
   // clean name from any invalid characters
   var newAlias = alias.toLowerCase().toFileName();
   if (collection && collection.get(newAlias)) {
      // alias is already existing in collection, so we append a number
      var nr = 1;
      while (collection.get(newAlias + nr.toString()))
         nr++;
      return (newAlias + nr.toString());
   } else
      return (newAlias);
}

/**
 * function loads messages on startup
 */
function onStart() {
   // load application messages and modules
   var dir = FileLib.get(app.dir);
   var arr = dir.list();
   for (var i in arr) {
      var fname = arr[i];
   	if (fname.startsWith("messages.")) {
         var name = fname.substring(fname.indexOf(".") + 1, fname.length);
   		var msgFile = FileLib.get(dir, fname);
   		app.data[name] = new Packages.helma.util.SystemProperties(msgFile.getAbsolutePath());
   		app.log("loaded application messages (language: " + name + ")");
   	}
   }
   // load macro help file
   var macroHelpFile = FileLib.get(dir, "macro.help");
   app.data.macros = new Packages.helma.util.SystemProperties(macroHelpFile.getAbsolutePath());
   //eval(macroHelpFile.readAll());
   app.log("loaded macro help file");
   // creating the vector for referrer-logging
   app.data.accessLog = new java.util.Vector();
   // creating the hashtable for storyread-counting
   app.data.readLog = new java.util.Hashtable();
   // define the global mail queue
   app.data.mailQueue = new Array();
   return;
}


/**
 * This function parses a string for <img> tags and turns them
 * into <a> tags.
 */
function fixRssText(str) {
   var re = new RegExp("<img src\\s*=\\s*\"?([^\\s\"]+)?\"?[^>]*?(alt\\s*=\\s*\"?([^\"]+)?\"?[^>]*?)?>", "gi");
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
      if (i.startsWith("content_"))
         session.data.rescuedText[i] = param[i];
   }
   session.data.rescuedText.discussions = param.discussions;
   session.data.rescuedText.topic = param.topic;
   session.data.rescuedText.discussions_array = param.discussions_array;
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
 * function returns the level of the membership in cleartext
 * according to passed level
 */
function getRole(lvl) {
   switch (parseInt(lvl, 10)) {
      case CONTRIBUTOR :
         return "Contributor";
         break;
      case CONTENTMANAGER :
         return "Content Manager";
         break;
      case ADMIN :
         return "Administrator";
         break;
      default :
         return "Subscriber";
   }
}

/**
 * extract content properties from the object containing
 * the submitted form values (req.data)
 * @param Obj Parameter object (usually req.data)
 * @param Obj HopObject containing any already existing content
 * @return Obj JS object containing the following properties:
 *             .value: HopObject() containing extracted content
 *             .exists: Boolean true in case content was found
 *             .isMajorUpdate: Boolean true in case one content property
 *                             differs for more than 50 characters
 */
function extractContent(param, origContent) {
   var result = {isMajorUpdate: false, exists: false, value: new HopObject()};
   for (var i in param) {
      if (i.startsWith("content_")) {
         var partName = i.substring(8);
         var newContentPart = param[i].trim();
         // check if there's a difference between old and
         // new text of more than 50 characters:
         if (!result.isMajorUpdate && origContent) {
            var len1 = origContent[partName] ? origContent[partName].length : 0;
            var len2 = newContentPart.length;
            result.isMajorUpdate = Math.abs(len1 - len2) >= 50;
         }
         result.value[partName] = newContentPart;
         if (newContentPart)
            result.exists = true;
      }
   }
   return result;
}

/**
 * general mail-sending function
 * @param String sending email address
 * @param Obj String or Array of Strings containing recipient email addresses
 * @param String subject line
 * @param String Body to use in email
 * @return Obj Message object
 */
function sendMail(from, to, subject, body) {
   if (!from || !to || !body)
      throw new MailException("mailMissingParameters");
   var mail = new Mail();
   mail.setFrom(from ? from : root.sys_email);
   if (to && to instanceof Array) {
      for (var i in to)
         mail.addBCC(to[i]);
   } else
      mail.addTo(to);
   mail.setSubject(subject);
   mail.setText(body);
   switch (mail.status) {
      case 10 :
         throw new MailException("mailSubjectMissing");
         break;
      case 11 :
         throw new MailException("mailTextMissing");
         break;
      case 12 :
         throw new MailException("mailPartMissing");
         break;
      case 20 :
         throw new MailException("mailToInvalid");
         break;
      case 21 :
         throw new MailException("mailCCInvalid");
         break;
      case 22 :
         throw new MailException("mailCCInvalid");
         break;
      case 30 :
         throw new MailException("mailSend");
         break;
   }
   // finally send the mail
   mail.queue();
   return new Message("mailSend");
}


/**
 * extend the Mail prototype with a method
 * that simply adds a mail object to an
 * application-wide array (mail queue).
 */
Mail.prototype.queue = function() {
   app.data.mailQueue.push(this);
   return;
}


/**
 * send all mails contained in the
 * application-wide mail queue
 */
function flushMailQueue() {
   if (app.data.mailQueue.length > 0) {
      app.debug("flushing mailQueue, sending " + app.data.mailQueue.length + " eMail(s) ...");
      while (app.data.mailQueue.length) {
         var mail = app.data.mailQueue.pop();
         mail.send();
         if (mail.status > 0)
            app.debug("Error while sending eMail, status = " + mail.status);
      }
   }
   return;
}
