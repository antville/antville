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
   prefs.days = 3;
   // retrieve locale-object from root
   var loc = root.getLocale();
   prefs.language = loc.getLanguage();
   prefs.country = loc.getCountry();
   prefs.timezone = root.getTimeZone().getID();
   prefs.longdateformat = "EEEE, dd. MMMM yyyy, h:mm a";
   prefs.shortdateformat = "yyyy.MM.dd, HH:mm";
   this.preferences_xml = Xml.writeToString(prefs);
   return this;
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

   // layout
   this.layout = param.layout ? this.layouts.get(param.layout) : null;

   // e-mail notification
   prefs.notify_create = parseInt(param.notify_create, 10) || null;
   prefs.notify_update = parseInt(param.notify_update, 10) || null;
   prefs.notify_upload = parseInt(param.notify_upload, 10) || null;

   // store preferences
   this.preferences.setAll(prefs);
   // call the evalPreferences method of every module
   for (var i in app.modules)
      this.applyModuleMethod(app.modules[i], "evalPreferences", param);


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
 * function deletes all assets of a site (recursive!)
 */
function deleteAll() {
   this.images.deleteAll();
   this.files.deleteAll();
   // FIXME: add deleting of all layouts!
   // this.layouts.deleteAll();
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
   return result;
}


/**
 *  href URL postprocessor. If a virtual host mapping is defined
 *  for this site's alias, use it. Otherwise, use normal site URL.
 */
function processHref(href) {
   var vhost = app.properties["vhost." + this.alias];
   if (vhost)
      return vhost + href;
   else
      return app.properties.defaulthost + "/" + this.alias + href;
}


/**
 * basic check if email notification is enabled for a site
 * @param Obj site object
 * @return Boolean true if notification is enabled, false otherwise
 */
function isNotificationEnabled() {
   if (root.sys_allowEmails == 1 || root.sys_allowEmails == 2 && this.trusted)
      return true;
   return false;
}

/**
 * send e-mail notification if necessary
 * @param String type of changes (e.g. createStory)
 * @param HopObject the HopObject the changes were applied to
 */
function sendNotification(type, obj) {
   var notify = this.preferences.getProperty("notify_" + type);
   if (this.online === 0 || !notify || notify == 0)
      return;
   var recipients = new Array();
   for (var i=0; i<this.members.size(); i++) {
      var m = this.members.get(i);
      if ((type != "update" && m.user == obj.creator) || (type == "update" && m.user == obj.modifier))
         continue;
      if (notify == 1 && m.level >= CONTENTMANAGER)
         recipients.push(m.user.email);
      else if (notify == 2 && m.level >= CONTRIBUTOR)
         recipients.push(m.user.email);
   }
   if (recipients.length > 0) {
      var param = {
         user: obj.modifier ? obj.modifier.name :
            (obj.creator ? obj.creator.name : null),
         url: obj.href()
      };
      var sender = root.sys_title + "<" + root.sys_email + ">";
      var subject = getMessage("mail.notification");
      var body = this.renderSkinAsString("notificationMail", param);
      sendMail(sender, recipients, subject, body);
   }
   return;
}

/**
 * return the currently enabled layout object
 */
function getLayout() {
   if (this.layout)
      return this.layout;
   return root.getLayout();
}

/**
 * render the path to the static directory
 * of this site
 * @param String name of subdirectory (optional)
 */
function staticPath(subdir) {
   res.write(app.properties.staticPath);
   res.write(this.alias);
   res.write("/");
   if (subdir)
      res.write(subdir);
   return;
}

/**
 * return the path to the static directory
 * of this site
 * @param String name of subdirectory (optional)
 * @return String path to the static directory
 */
function getStaticPath(subdir) {
   res.push();
   this.staticPath(subdir);
   return res.pop();
}

/**
 * render the url of the static directory
 * of this site
 * @param String optional subdirectory
 */
function staticUrl(subdir) {
   res.write(app.properties.staticUrl);
   res.write(this.alias);
   res.write("/");
   if (subdir)
      res.write(subdir);
   return;
}

/**
 * return the url of the static directory
 * of this site
 * @param String optional subdirectory
 * @return String static url
 */
function getStaticUrl(subdir) {
   res.push();
   this.staticUrl(subdir);
   return res.pop();
}

/**
 * return the directory containing static contents
 * @param String subdirectory (optional)
 * @return Object File object
 */
function getStaticDir(subdir) {
   var f = new Helma.File(this.getStaticPath(subdir));
   f.mkdir();
   return f;
}

/**
 * function returns the title of a site
 */
function getTitle() {
   if (this.title && this.title.trim())
     return stripTags(this.title);
   else
     return "[" + getMessage("generic.untitled") + "]";
}


/**
 * function returns the used disk space for this site in Kilobyte
 */
function getDiskUsage() {
   if (this.diskusage == null) {
      this.diskusage = 0;
      for (var i=0; i<this.files.count(); i++)
         this.diskusage += this.files.get(i).filesize;
      for (var i=0; i<this.images.count(); i++) {
         if (this.images.get(i).filesize == null)
            this.images.get(i).filesize = this.images.get(i).getFile().getLength();
         this.diskusage += this.images.get(i).filesize;
      }
   }
   return Math.round(this.diskusage / 1024);
}


/**
 * function returns the disk quota in Kilobyte for this site
 */
function getDiskQuota() {
   if (this.trusted || !root.sys_diskQuota) 
      return Infinity;
   else 
      return root.sys_diskQuota;
}


/**
 * returns the corresponding Index object for a site
 * for performance reasons the Index object is cached
 */
function getIndex(force) {
   if (!this.cache.index || force) {
      var baseDir = new Helma.File(app.properties.indexPath);
      var index, analyzer;
      if (this.getLocale().getLanguage() == java.util.Locale.GERMAN)
         analyzer = Search.getAnalyzer(java.util.Locale.GERMAN);
      else
         analyzer = Search.getAnalyzer();
      // try to mount an existing index, if this fails create a new one
      try {
         index = Search.mountIndex(this.alias, baseDir, analyzer);
         app.log("[" + this.alias + "] mounted index " + index);
      } catch (e) {
         try {
            index = Search.createIndex(this.alias, baseDir, analyzer);
            app.log("[" + this.alias + "] created index " + index);
         } catch (e) {
            throw ("[" + this.alias + "] Error: unable to mount or create index");
            return;
         }
      }
      this.cache.index = index;
   }
   return this.cache.index;
};


/**
 * re-indexes all stories and comments of a site
 * @param Object instance of Search.Index
 * @return void
 */
function rebuildIndex() {
   /**
    * private method for constructing an index document
    * based on the data retrieved via direct db
    */
   function getIndexDocument() {
      var doc = new Search.Document();
      doc.addField("prototype", rows.getColumnItem("TEXT_PROTOTYPE"));
      switch (rows.getColumnItem("TEXT_PROTOTYPE")) {
         case "Comment":
            doc.addField("story", rows.getColumnItem("TEXT_F_TEXT_STORY"), {store: true, index: true, tokenize: false});
            if (parent = rows.getColumnItem("TEXT_F_TEXT_PARENT"))
               doc.addField("parent", parent, {store: true, index: true, tokenize: false});
            break;
         default:
            doc.addField("day", rows.getColumnItem("TEXT_DAY"), {store: true, index: true, tokenize: false});
            if (topic = rows.getColumnItem("TEXT_TOPIC"))
               doc.addField("topic", topic, {store: true, index: true, tokenize: true});
            break;
      }
   
      doc.addField("online", rows.getColumnItem("TEXT_ISONLINE"), {store: true, index: true, tokenize: false});
      doc.addField("site", self._id, {store: true, index: true, tokenize: false});
      doc.addField("id", rows.getColumnItem("TEXT_ID"), {store: true, index: true, tokenize: false});
      var content = Xml.readFromString(rows.getColumnItem("TEXT_CONTENT"));
      for (var propName in content) {
         doc.addField((propName == "title") ? "title" : "text",
                      stripTags(content[propName]),
                      {store: false, index: true, tokenize: true});
      }
      if (creator = rows.getColumnItem("USER_NAME")) {
         doc.addField("creator", creator, {store: false, index: true, tokenize: false});
         doc.addField("createtime", (new Date(rows.getColumnItem("TEXT_CREATETIME").getTime())).format("yyyyMMdd", locale, timeZone),
                      {store: false, index: true, tokenize: false});
      }
      return doc;
   }

   var parent, topic, title, text, creator;
   // lock the index queue to prevent it
   // from being flushed by the IndexManager
   var queue = app.data.indexManager.getQueue(this);
   queue.lock();
   var index = this.getIndex();
   index.clear();

   var buf = new java.util.Vector(500, 500);
   var cnt = 0;
   var now = new Date();
   var start = new Date();
   var locale = this.getLocale();
   var timeZone = this.getTimeZone();
   var dbCon = getDBConnection("antville");
   var rows = dbCon.executeRetrieval("select TEXT_ID, TEXT_PROTOTYPE, TEXT_DAY, TEXT_TOPIC, TEXT_ALIAS, TEXT_F_TEXT_STORY, TEXT_F_TEXT_PARENT, TEXT_PROTOTYPE, TEXT_ISONLINE, TEXT_CONTENT, USER_NAME, TEXT_CREATETIME from AV_TEXT, AV_USER where TEXT_F_SITE = " + this._id + " and TEXT_F_USER_CREATOR = USER_ID");
   app.log("[" + this.alias + "] retrieved indexable contents in " + ((new Date()).diff(now)) + " ms");
   if (dbCon.lastError != null) {
      app.log("[" + this.alias + "] unable to retrieve indexable contents, reason: " + dbCon.lastError);
   } else {
      var self = this;
      while (rows.next()) {
         try {
            buf.add(getIndexDocument());
            if (cnt > 0 && cnt % 2000 == 0) {
               index.addDocument(buf);
               buf.clear();
               app.log("[" + this.alias + "] added " + cnt + " documents to index (last 1000 in " + ((new Date()).diff(now)) + " ms)");
               now = new Date();
            }
         } catch (e) {
            app.log("[" + this.alias + "] Error: unable to add document " + cnt + " to index. Reason: " + e.toString());
         }
         cnt++;
      }
      rows.release();
      index.addDocument(buf);
      app.log("[" + this.alias + "] finished adding " + cnt + " documents to index in " + ((new Date()).diff(start)) + " ms");
      index.optimize();
   }

   // unlock the queue again
   queue.unlock();
   return cnt;
}
