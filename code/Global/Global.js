//
// The Antville Project
// http://code.google.com/p/antville
//
// Copyright 2001-2007 by The Antville People
//
// Licensed under the Apache License, Version 2.0 (the ``License'');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an ``AS IS'' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// $Revision$
// $LastChangedBy$
// $LastChangedDate$
// $URL$
//

app.addRepository("modules/core/HopObject.js");
app.addRepository("modules/core/Number.js");
app.addRepository("modules/core/Filters.js");

app.addRepository("modules/helma/Image.js");
app.addRepository("modules/helma/Html.js");
app.addRepository("modules/helma/Mail.js");
app.addRepository("modules/helma/Search.js");
app.addRepository("modules/helma/Zip.js");

app.addRepository("modules/jala/code/Form.js");
app.addRepository("modules/jala/code/HopObject.js");
app.addRepository("modules/jala/code/I18n.js");
app.addRepository("modules/jala/code/IndexManager.js");
app.addRepository("modules/jala/code/ListRenderer.js");
app.addRepository("modules/jala/code/Utilities.js");

var _ = gettext;

var search = new helma.Search();
var html = new helma.Html();

/**
 * Extend the Mail prototype with a method that simply adds a mail object 
 * to an application-wide array (mail queue).
 */
helma.Mail.prototype.queue = function() {
   return app.data.mailQueue.push(this);
};

function scheduler() {
   flushLog();
   // FIXME: root.manage.autoCleanUp();
   // FIXME: pingUpdatedSites();
   // FIXME: countUsers();
   app.data.lastAccessLogUpdate = new Date();
   writeReadLog();
   flushMailQueue();
   app.data.indexManager.flush();
   return 5000;
}

function disableMacro(ctor, name) {
   return ctor.prototype[name + "_macro"] = function() {return};
};

function defineConstants(ctor, getterName /* , arguments */) {
   var constants = [], name;
   for (var i=2; i<arguments.length; i+=1) {
      name = arguments[i].toUpperCase().replace(/\s/g, "");
      if (ctor[name]) {
         app.logger.warn("Constant already defined: " + ctor.name + "." + name);
      }
      ctor[name] = arguments[i];
      constants.push({
         value: arguments[i],
         display: arguments[i]
      });
   }
   ctor[getterName] = function() {
      return constants;
   };
   return;
}

function logAction(context, action) {
   if (context) {
      root.admin.log.add(new LogEntry(context, action));      
   } else {
      root.admin.log.cache.add(new LogEntry(path[path.length - 1]));
   }
   return;
   
   /* FIXME: check whether request really should be logged
   var site = res.handlers.site ? res.handlers.site: root;
   var url = http.evalUrl(req.data.http_referer);

   // no logging at all if the referrer comes from the same site
   // or is not a http-request
   if (!url)
      return;
   var referrer = url.toString();
   var siteHref = site.href().toLowerCase();
   if (referrer.toLowerCase().contains(siteHref.substring(0, siteHref.length-1)))
      return;
   var logObj = new Object();
   logObj.storyID = path.Story ? path.Story._id : null;
   logObj.siteID = site._id;
   logObj.referrer = referrer;
   logObj.remoteHost = req.data.http_remotehost;
   logObj.browser = req.data.http_browser;
   */
   return root.admin.syslogs.add(new SysLog(type, object, text, session.user));   
}

function flushLog() {
   var log = root.admin.log;
   var n = log.cache.size();
   if (n < 1) {
      return;
   }
   log.cache.forEach(function() {
      return log.add(this);
   });
   res.commit();
   log.clearCache();
   app.logger.info("Wrote " + n + " log entries to DB");
   return;
}

MAY_ADD_STORY = 1;
MAY_VIEW_ANYSTORY = 2;
MAY_EDIT_ANYSTORY = 4;
MAY_DELETE_ANYSTORY = 8;
MAY_ADD_COMMENT = 16;
MAY_EDIT_ANYCOMMENT = 32;
MAY_DELETE_ANYCOMMENT = 64;
MAY_ADD_IMAGE = 128;
MAY_EDIT_ANYIMAGE = 256;
MAY_DELETE_ANYIMAGE = 512;
MAY_ADD_FILE = 1024;
MAY_EDIT_ANYFILE = 2048;
MAY_DELETE_ANYFILE= 4096;
MAY_VIEW_STATS = 8192;
MAY_EDIT_PREFS = 16384;
MAY_EDIT_LAYOUTS = 32768;
MAY_EDIT_MEMBERS = 65536;

EDITABLEBY_ADMINS       = 0;
EDITABLEBY_CONTRIBUTORS = 1;
EDITABLEBY_SUBSCRIBERS  = 2;

SHORTDATEFORMAT = "yyyy-MM-dd HH:mm";
LONGDATEFORMAT = "EEEE, d. MMMM yyyy, HH:mm";

ONEMINUTE = 60000;
ONEHOUR = 3600000;
ONEDAY = 86400000;

function now_macro(param, format) {
   return formatDate(new Date, format || param.format);
}

function logo_macro(param, name) {
   Images.Default.render(name || param.name || "smallchaos", param);
   return;
}

function image_macro(param, name, mode) {
  name || (name = param.name);
   if (!name) {
      return;
   }
   mode || (mode = param.as);
   var action = param.linkto;
   delete(param.name);
   delete(param.as);
   delete(param.linkto);

   if (name.startsWith("/")) {
      return Images.Default.render(name.substring(1), param);
   }

   var image = HopObject.getFromPath(name, "images");
   if (!image && param.fallback) {
      image = HopObject.getFromPath(param.fallback, "images");
   }
   if (!image) {
      return;
   }

   switch (mode) {
      case "url" :
      return image.getUrl();
      case "thumbnail":
      action || (action = image.getUrl());
      return image.thumbnail_macro(param);
   }
   return image.render_macro(param);
}

/**
 *  Global link macro. In contrast to the hopobject link macro,
 *  this reproduces the link target without further interpretation.
 */
function link_macro() {
   return renderLink.apply(this, arguments);
}

function renderLink(param, url, text, handler) {
   url || (url = param.url || "");
   text || (text = param.text || url);
   if (!text) {
      return;
   }
   delete param.url;
   delete param.text;
   if (!handler || url.contains(":") || url.contains("?")) {
      param.href = url;
   } else if (url.contains("/")) {
      param.href = handler.href() + url;
   } else {
      param.href = handler.href(url);
   }
   html.link(param, text);
}

/**
 * macro fetches a file-object and renders a link to "getfile"-action
 */
function file_macro(param) {
   if (!param.name)
      return;
   var p = getPoolObj(param.name, "files");
   if (!p)
      return;
   if (param.as == "url")
      res.write(p.obj.getUrl());
   else {
      if (!param.text)
         param.text = p.obj.alias;
      p.obj.renderSkin(param.skin ? param.skin : "main", param);
   }
   return;
}

/**
 * Macro creates a string representing the objects in the
 * current request path, linked to their main action.
 */
function breadcrumbs_macro (param) {
   var separator = param.separator;
   if (!separator)
      separator = " : ";
   var title;
   var start = (path.Site == null) ? 0 : 1;
   for (var i=start; i<path.length-1; i++) {
      title = path[i].getNavigationName();
      html.link({href: path[i].href()}, title);
      res.write(separator);
   }
   title = path[i].getNavigationName();
   if (req.action != "main" && path[i].main_action)
      html.link({href: path[i].href()}, title);
   else
      res.write(title);
   return;
}

/**
 * Renders the story with the specified id; uses preview.skin as default
 * but the skin to be rendered can be chosen with parameter skin="skinname"
 */
function story_macro(param) {
   if (!param.id)
      return;
   var storyPath = param.id.split("/");
   if (storyPath.length == 2) {
      var site = root.get(storyPath[0]);
      if (!site || !site.online)
         return;
   } else if (res.handlers.site)
      var site = res.handlers.site;
   else
      return;
   var story = site.allstories.get(storyPath[1] ? storyPath[1] : param.id);
   if (!story)
      return getMessage("error", "storyNoExist", param.id);
   switch (param.as) {
      case "url":
         res.write(story.href());
         break;
      case "link":
         var title = param.text ? param.text : 
                     story.content.get("title");
         html.link({href: story.href()}, title ? title : story._id);
         break;
      default:
         story.renderSkin(param.skin ? param.skin : "embed");
   }
   return;
}

/**
 * Renders a poll (optionally as link or results)
 */
function poll_macro(param) {
   if (!param.id)
      return;
   // disable caching of any contentPart containing this macro
   res.meta.cachePart = false;
   var parts = param.id.split("/");
   if (parts.length == 2)
      var site = root.get(parts[0]);
   else
      var site = res.handlers.site;
   if (!site)
      return;
   var poll = site.polls.get(parts[1] ? parts[1] : param.id);
   if (!poll)
      return getMessage("error.pollNoExist", param.id);
   switch (param.as) {
      case "url":
         res.write(poll.href());
         break;
      case "link":
         html.link({
            href: poll.href(poll.closed ? "results" : "")
         }, poll.question);
         break;
      default:
         if (poll.closed || param.as == "results")
            poll.renderSkin("results");
         else {
            res.data.action = poll.href();
            poll.renderSkin("main");
         }
   }
   return;
}

/**
 * macro basically renders a list of sites
 * calling root.renderSitelist() to do the real job
 */
function sitelist_macro(param) {
   // setting some general limitations:
   var minDisplay = 10;
   var maxDisplay = 25;
   var max = Math.min((param.limit ? parseInt(param.limit, 10) : minDisplay), maxDisplay);
   root.renderSitelist(max);
   res.write(res.data.sitelist);
   delete res.data.sitelist;
   return;
}

/**
 * wrapper-macro for imagelist
 */
function imagelist_macro(param) {
   var site = param.of ? root.get(param.of) : res.handlers.site;
   if (!site)
      return;
   if (!site.images.size())
      return;
   var max = Math.min(param.limit ? param.limit : 5, site.images.size());
   var idx = 0;
   var imgParam;
   var linkParam = {};
   delete param.limit;

   while (idx < max) {
      var imgObj = site.images.get(idx++);

      imgParam = Object.clone(param);
      delete imgParam.itemprefix;
      delete imgParam.itemsuffix;
      delete imgParam.as;
      delete linkParam.href;
      delete linkParam.onclick;

      res.write(param.itemprefix);
      // return different display according to param.as
      switch (param.as) {
         case "url":
            res.write(imgObj.getUrl());
            break;
         case "popup":
            linkParam.onclick = imgObj.getPopupUrl();
         case "thumbnail":
            linkParam.href = param.linkto ? param.linkto : imgObj.getUrl();
            if (imgObj.thumbnail)
               imgObj = imgObj.thumbnail;
         default:
            if (linkParam.href) {
               html.openLink(linkParam);
               renderImage(imgObj, imgParam);
               html.closeLink();
            } else
               renderImage(imgObj, imgParam);
      }
      res.write(param.itemsuffix);
   }
   return;
}

/**
 * wrapper-macro for topiclist
 */
function topiclist_macro(param) {
   var site = param.of ? root.get(param.of) : res.handlers.site;
   if (!site)
      return;
   site.topics.topiclist_macro(param);
   return;
}

/**
 * macro checks if the current session is authenticated
 * if true it returns the username
 */
function username_macro(param) {
   if (!session.user)
      return;
   if (session.user.url && param.as == "link")
      html.link({href: session.user.url}, session.user.name);
   else if (session.user.url && param.as == "url")
      res.write(session.user.url);
   else
      res.write(session.user.name);
   return;
}

/**
 * function renders a form-input
 */
function input_macro(param) {
   switch (param.type) {
      case "button" :
         break;
      case "radio" :
         param.selectedValue = req.data[param.name];
         break;
      default :
         param.value = param.name && req.data[param.name] ? req.data[param.name] : param.value;
   }
   switch (param.type) {
      case "textarea" :
         html.textArea(param);
         break;
      case "checkbox" :
         html.checkBox(param);
         break;
      case "button" :
         // FIXME: this is left for backwards compatibility
         html.submit(param);
         break;
      case "submit" :
         html.submit(param);
         break;
      case "password" :
         html.password(param);
         break;
      case "radio" :
         html.radioButton(param);
         break;
      case "file" :
         html.file(param);
         break;
      default :
         html.input(param);
   }
   return;
}

/**
 * function renders a list of stories either contained
 * in a topic or from the story collection.
 * param.sortby determines the sort criteria
 * (title, createtime, modifytime);
 * param.order determines the sort order (asc or desc)
 * param.show determines the text type (story, comment or all)
 * param.skin determines the skin used for each stories (default is title as link) 
 */
function storylist_macro(param) {
   // disable caching of any contentPart containing this macro
   res.meta.cachePart = false;
   var site = param.of ? root.get(param.of) : res.handlers.site;
   if (!site)
      return;

   // untrusted sites are only allowed to use "light" version
   if (res.handlers.site && !res.handlers.site.trusted) {
      param.limit = param.limit ? Math.min(site.allstories.count(), parseInt(param.limit), 50) : 25;
      for (var i=0; i<param.limit; i++) {
         var story = site.allcontent.get(i);
         if (!story)
            continue;
         res.write(param.itemprefix);
         html.openLink({href: story.href()});
         var str = story.title;
         if (!str)
            str = story.getRenderedContentPart("text").stripTags().clip(10, "...", "\\s").softwrap(30);
         res.write(str ? str : "...");
         html.closeLink();
         res.write(param.itemsuffix);
      }
      return;
   }

   // this is db-heavy action available for trusted users only (yet?)
   if (param.sortby != "title" && param.sortby != "createtime" && param.sortby != "modifytime")
      param.sortby = "modifytime";
   if (param.order != "asc" && param.order != "desc")
      param.order = "asc";
   var order = " order by TEXT_" + param.sortby.toUpperCase() + " " + param.order;
   var rel = "";
   if (param.show == "stories")
      rel += " and TEXT_PROTOTYPE = 'story'";
   else if (param.show == "comments")
      rel += " and TEXT_PROTOTYPE = 'comment'";
   if (param.topic)
      rel += " and TEXT_TOPIC = '" + param.topic + "'";
   var query = "select TEXT_ID from AV_TEXT where TEXT_F_SITE = " + site._id + " and TEXT_ISONLINE > 0" + rel + order;
   var connex = getDBConnection("antville");
   var rows = connex.executeRetrieval(query);

   if (rows) {
      var cnt = 0;
      param.limit = param.limit ? Math.min(parseInt(param.limit), 100) : 25;
      while (rows.next() && (cnt < param.limit)) {
         cnt++;
         var id = rows.getColumnItem("TEXT_ID").toString();
         var story = site.allcontent.get(id);
         if (!story)
            continue;
         if (param.skin) {
            story.renderSkin(param.skin);
         } else {
            res.write(param.itemprefix);
            html.openLink({href: story.href()});
            var str = story.title;
            if (!str)
               str = story.getRenderedContentPart("text").stripTags().clip(10, "...", "\\s").softwrap(30);
            res.write(str ? str : "...");
            html.closeLink();
            res.write(param.itemsuffix); 
         }         
      }
   }
   rows.release();
   return;
}

/**
 * a not yet sophisticated macro to display a
 * colorpicker. works in site prefs and story editors
 */
function colorpicker_macro(param) {
   if (!param || !param.name)
      return;

   var param2 = new Object();
   param2.as = "editor";
   param2["size"] = "10";
   param2.onchange = "Antville.ColorPicker.set('" + param.name + "', this.value);";
   param2.id = "Antville_ColorValue_" + param.name;
   if (!param.text)
      param.text = param.name;
   if (param.color)
   	param.color = renderColorAsString(param.color);

   if (path.Story || path.StoryMgr) {
      var obj = path.Story ? path.Story : new Story();
      param2.part = param.name;
      // use res.push()/res.pop(), otherwise the macro
      // would directly write to response
      res.push();
      obj.content_macro(param2);
      param.editor = res.pop();
      param.color = renderColorAsString(obj.content.get(param.name));
   } else if (path.Layout) {
      var obj = path.Layout;
      // use res.push()/res.pop(), otherwise the macro
      // would directly write to response
      res.push();
      obj[param.name + "_macro"](param2);
      param.editor = res.pop();
      param.color = renderColorAsString(obj.preferences.get(param.name));
   } else
      return;
   renderSkin("colorpickerWidget", param);
   return;
}

/**
 * fakemail macro <%fakemail number=%>
 * generates and renders faked email-adresses
 * param.number
 * (contributed by hr@conspirat)
 */
function fakemail_macro(param) {
	var tldList = ["com", "net", "org", "mil", "edu", "de", "biz", "de", "ch", "at", "ru", "de", "tv", "com", "st", "br", "fr", "de", "nl", "dk", "ar", "jp", "eu", "it", "es", "com", "us", "ca", "pl"];
   var nOfMails = param.number ? (param.number <= 50 ? param.number : 50) : 20;
   for (var i=0;i<nOfMails;i++) {
   	var tld = tldList[Math.floor(Math.random()*tldList.length)];
   	var mailName = "";
      var serverName = "";
   	var nameLength = Math.round(Math.random()*7) + 3;
   	for (var j=0;j<nameLength;j++)
   		mailName += String.fromCharCode(Math.round(Math.random()*25) + 97);
   	var serverLength = Math.round(Math.random()*16) + 8;
   	for (var j=0;j<serverLength;j++)
   		serverName += String.fromCharCode(Math.round(Math.random()*25) + 97);
      var addr = mailName + "@" + serverName + "." + tld;
      html.link({href: "mailto:" + addr}, addr);
      if (i+1 < nOfMails)
         res.write(param.delimiter ? param.delimiter : ", ");
   }
	return;
}

/**
 * picks a random site, image or story by setting
 * param.what to the corresponding prototype
 * by default, embed.skin will be rendered but this
 * can be overriden using param.skin
 */
function randomize_macro(param) {
   var site, obj;
   if (param.site) {
      var site = root.get(param.site);
      if (!site.online)
         return;
   } else {
      var max = root.publicSites.size();
      while (!site || site.online < 1)
         site = root.publicSites.get(Math.floor(Math.random() * max));
   }
   var coll;
   switch (param.what) {
      case "stories":
         obj = site.stories.get(Math.floor(Math.random() * site.allstories.size()));
         break;
      case "images":
         obj = site.images.get(Math.floor(Math.random() * site.images.size()));
         break;
      case "sites":
      default:
         obj = site;
         break;
   }
   obj.renderSkin(param.skin ? param.skin : "embed");
   return;
}

/**
 * macro renders a random image
 *  list of images can be specified in the images-attribute
 *
 * @param images String (optional), comma separated list of image aliases
 * all other parameters are passed through to the global image macro
 * this macro is *not* allowed in stories
 */
function randomimage_macro(param) {
   if (param.images) {
      var items = new Array();
      var aliases = param.images.split(",");
      for (var i=0; i<aliases.length; i++) {
         aliases[i] = aliases[i].trim();
         var img = getPoolObj(aliases[i], "images");
         if (img && img.obj) items[items.length] = img.obj;
      }
   } 
   delete(param.images);
   var idx = Math.floor(Math.random()*items.length);
   var img = items[idx];
   param.name = img.alias;
   return image_macro(param);
}

/**
 * macro renders the most recently created image of a site
 * @param topic String (optional), specifies from which topic the image should be taken
 * all other parameters are passed through to the global image macro
 * FIXME: this function needs testing and proof of concept
 */
function imageoftheday_macro(param) {
   var s = res.handlers.site;
   var pool = res.handlers.site.images;
   if (pool==null) return;
   delete(param.topic);
   var img = pool.get(0);
   param.name = img.alias;
   return image_macro(param);
}

/**
 * function loads messages on startup
 */
function onStart() {
   // load application messages and modules
   var dir = new Helma.File(app.dir, "../i18n");
   var arr = dir.list();
   for (var i in arr) {
      var fname = arr[i];
   	if (fname.startsWith("messages.")) {
         var name = fname.substring(fname.indexOf(".") + 1, fname.length);
   		var msgFile = new Helma.File(dir, fname);
   		app.data[name] = new Packages.helma.util.SystemProperties(msgFile.getAbsolutePath());
   		app.log("loaded application messages (language: " + name + ")");
   	}
   }
   // init index manager
   app.data.indexManager = new IndexManager();
   // build macro help
   app.data.macros = buildMacroHelp();
   //eval(macroHelpFile.readAll());
   app.log("loaded macro help file");
   // creating the vector for referrer-logging
   app.data.accessLog = new java.util.Vector();
   // creating the hashtable for storyread-counting
   app.data.readLog = new java.util.Hashtable();
   // define the global mail queue
   app.data.mailQueue = new Array();
   // init constants
   initConstants();
   // call onStart methods of modules
   for (var i in app.modules) {
      if (app.modules[i].onStart)
         app.modules[i].onStart();
   }
   return;
}

/**
 * check if email-adress is syntactically correct
 */
function evalEmail(str) {
   if (!str.isEmail()) {
      return null;
   }
   return str;
}

/**
 * function checks if url is correct
 * if not it assumes that http is the protocol
 */
function evalURL(str) {
   if (url = helma.Http.evalUrl(str)) {
      return String(url);
   } else if (str.contains("@")) {
      return "mailto:" + str;
   } else {
      return "http://" + str;
   }
   return null;
}

/**
 * function checks if user has permanent cookies
 * storing username and password
 */
function autoLogin() {
   if (session.user) {
      return;
   }
   var name = req.cookies.avUsr;
   var hash = req.cookies.avPw;
   if (!name || !hash) {
      return;
   }
   var user = User.getByName(name);
   if (!user) {
      return;
   }
   var ip = req.data.http_remotehost.clip(getProperty ("cookieLevel","4"),
         "", "\\.");
   if ((user.hash + ip).md5() !== hash) {
      return;
   }
   session.login(user);
   user.touch();
   res.message = gettext('Welcome to "{0}", {1}. Have fun!',
         res.handlers.site.title, user.name);
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

   var query = "select name from site where mode = 'online' and " +
         "SITE_ENABLEPING = 1 and  (SITE_LASTUPDATE > SITE_LASTPING or SITE_LASTPING is null)";
   var rows = c.executeRetrieval(query);
   var dbError = c.getLastError();
   if (dbError) {
      app.log("Error executing SQL query: " + dbError);
      return;
   }

   while (rows.next()) {
      var site = root.get(rows.getColumnItem("name"));
      app.log("Notifying weblogs.com for updated site '" + site.alias + 
            "' (id " + site._id + ")");
      site.ping();
   }

   rows.release();
   return;
}

function formatDate(date, pattern) {
   if (!date) {
      return null;
   }
   pattern || (pattern = "short");
   var site = res.handlers.site;
   var format = site[pattern.toLowerCase() + "DateFormat"];
   if (!format) {
     format = pattern;
   }
   try {
      return date.format(format, site.getLocale(), site.getTimeZone());
   } catch (ex) {
      app.log(ex);
      return "[Macro error: Invalid date format]";
   }
   return;
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
   return this;
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
   };
   res.debug("Exception  " + name + ": " + value);
   return this;
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
   return this;
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
   return this;
}

/**
 * function retrieves a message from the message file
 * of the appropriate language
 */
function getMessage(property, value) {
   var languages = getLanguages();
   // loop over languages and try to find the message
   var lang;
   var source;
   for (var i=0;i<languages.length;i++) {
      if (!(lang = app.data[languages[i]]))
         continue;
      if (!(source = lang.getProperty(property)))
         continue;
      var param = new Object();
      // check if value passed is a string or an array
      if (value) {
         if (value instanceof Array) {
            for (var j=0;j<value.length;j++)
               param["value" + (j+1)] = value[j];
         } else if (typeof value == "object") {
            param = value;
         } else {
            param.value1 = value;
         }
      }
      return renderSkinAsString(createSkin(source), param);
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
   var filename = uploadFile.getName().split("/").pop();
   var pos = filename.lastIndexOf(".");
   if (pos > 0)
      filename = filename.substring(0, pos);
   return buildAlias(filename, collection);
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
   if (newAlias.startsWith("."))
      newAlias = newAlias.substring(1);
   if (collection && collection.get(newAlias)) {
      // alias is already existing in collection, so we append a number
      var nr = 1;
      while (collection.get(newAlias + nr.toString()))
         nr++;
      return newAlias + nr.toString();
   } else
      return newAlias;
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
   return;
}

/**
 * functionswaps app.data.readLog, loops over the logObjects
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
      var story = Story.getById(String(el.story));
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
function sendMail(sender, recipient, subject, body) {
   if (!sender || !recipient || !body) {
      app.log("Insufficient arguments in method sendMail()");
      return;
   }
   var mail = new helma.Mail();
   mail.setFrom(sender);
   if (recipient instanceof Array) {
      for (var i in recipient) {
         mail.addBCC(recipient[i]);
      }
   } else {
      mail.addTo(recipient);
   }
   mail.setSubject(subject);
   mail.setText(body);
   // Add the message to the queue (method extension of helma.Mail)
   mail.queue();
   return mail.status;
}

/**
 * send all mails contained in the
 * application-wide mail queue
 */
function flushMailQueue() {
   if (app.data.mailQueue.length > 0) {
      app.debug("flushing mailQueue, sending " + app.data.mailQueue.length + " e-mail(s) ...");
      while (app.data.mailQueue.length) {
         var mail = app.data.mailQueue.pop();
         mail.send();
         if (mail.status > 0)
            app.debug("Error while sending e-mail, status = " + mail.status);
      }
   }
   return;
}

/**
 * construct an array containing languages keys
 * used for retrieving a localized message
 */
function getLanguages() {
   var languages = new Array("en");
   var syslang;
   if ((syslang = root.getLocale().getLanguage()) != "en")
      languages.unshift(syslang);
   if (res.handlers.site) {
      var lang = res.handlers.site.getLocale().getLanguage();
      if (lang != "en" && lang != syslang)
         languages.unshift(lang);
   }
   return languages;
}

/**
 * build a more scripting-compatible object
 * structure of the HELP.macros
 * @return Object the resulting object tree
 */
function buildMacroHelp() {
   var sorter = function(a, b) {
      var str1 = a.name.toLowerCase();
      var str2 = b.name.toLowerCase();
      if (str1 > str2)
         return 1;
      else if (str1 < str2)
         return -1;
      return 0;
   }

   var macroHelp = {};
   var ref = macroHelp.Global = [];
   var macrolist = HELP.macros.Global;
   for (var i in macrolist)
      ref.push({name: i, storyid: macrolist[i]});
   ref.sort(sorter);

   var ref = macroHelp.HopObject = [];
   var macrolist = HELP.macros.HopObject;
   for (var i in macrolist)
      ref.push({name: i, storyid: macrolist[i]});
   ref.sort(sorter);

   for (var proto in HELP.macros) {
      if (proto.indexOf("_") == 0 || proto == "Global" || proto == "HopObject")
         continue;
      var macrolist = HELP.macros[proto];
      var ref = macroHelp[proto] = [];
      var keys = "";
      for (var i in macrolist) {
         ref.push({name: i, storyid: macrolist[i]});
         keys += i + ",";
      }
      for (var n in macroHelp.HopObject) {
         var shared = macroHelp.HopObject[n];
         if (keys.indexOf(shared.name + ",") < 0)
            ref.push(shared);
      }
      ref.sort(sorter);
   }
   return macroHelp;
}

/**
 * wrapper method to expose the indexManager's
 * rebuildIndexes method to cron
 */
function rebuildIndexes() {
   app.data.indexManager.rebuildIndexes();
   return;
}

/**
 * function tries to check if the color contains just hex-characters
 * if so, it returns the color-definition prefixed with a '#'
 * otherwise it assumes the color is a named one
 */
function renderColorAsString(c) {
   if (c && c.isHexColor())
      return "#" + c;
   return c;
}

/**
 * renders a color as hex or named string
 */
function renderColor(c) {
   res.write(renderColorAsString(c));
   return;
}

/**
 * Do Wiki style substitution, transforming
 * stuff contained between asterisks into links.
 */
function doWikiStuff (src) {
   // robert, disabled: didn't get the reason for this:
   // var src= " "+src;
   if (src == null || !src.contains("<*"))
      return src;

   // do the Wiki link thing, <*asterisk style*>
   var regex = new RegExp ("<[*]([^*]+)[*]>");
   regex.ignoreCase=true;
   
   var text = "";
   var start = 0;
   while (true) {
      var found = regex.exec (src.substring(start));
      var to = found == null ? src.length : start + found.index;
      text += src.substring(start, to);
      if (found == null)
         break;
      var name = ""+(new java.lang.String (found[1])).trim();
      var item = res.handlers.site.topics.get (name);
      if (item == null && name.lastIndexOf("s") == name.length-1)
         item = res.handlers.site.topics.get (name.substring(0, name.length-1));
      if (item == null || !item.size())
         text += format(name)+" <small>[<a href=\""+res.handlers.site.stories.href("create")+"?topic="+escape(name)+"\">define "+format(name)+"</a>]</small>";
      else
         text += "<a href=\""+item.href()+"\">"+name+"</a>";
      start += found.index + found[1].length+4;
   }
   return text;
}

/**
 * function renders a dropdown-box containing all available
 * locales
 * @param Obj Locale-Object to preselect
 */
function renderLocaleChooser(loc) {
   var locs = java.util.Locale.getAvailableLocales();
   var options = new Array();
   // get the defined locale of this site for comparison
   for (var i in locs)
      options[i] = new Array(locs[i], locs[i].getDisplayName());
   html.dropDown({name: "locale"}, options, loc ? loc.toString() : null);
   return;
}

/**
 * function renders a dropdown-box for choosing dateformats
 * @param String String indicating version of dateformat to use:
 *               "short" - short date format
 *               "long" - long date format
 * @param Obj Locale object (java.util.Locale)
 * @param Obj String Pattern to preselect
 */
function renderDateformatChooser(version, locale, selectedValue) {
   var patterns = (version == "shortdateformat" ? SHORTDATEFORMATS : LONGDATEFORMATS);
   var now = new Date();
   var options = new Array();
   for (var i in patterns) {
      var sdf = new java.text.SimpleDateFormat(patterns[i], locale);
      options[i] = [encodeForm(patterns[i]), sdf.format(now)];
   }
   html.dropDown({name: version}, options, selectedValue);
   return;
}

/**
 * function renders a dropdown-box for choosing timezones
 * @param Obj Timezone object (java.util.TimeZone)
 */
function renderTimeZoneChooser(tz) {
   var zones = java.util.TimeZone.getAvailableIDs();
   var options = new Array();
   var format = new java.text.DecimalFormat ("-0;+0");
   for (var i in zones) {
      var zone = java.util.TimeZone.getTimeZone(zones[i]);
      options[i] = [zones[i], "GMT" + (format.format(zone.getRawOffset()/ONEHOUR)) + " (" + zones[i] + ")"];
   }
   html.dropDown({name: "timezone"}, options, tz ? tz.getID() : null);
   return;
}

/**
 * generic list render function. if the argument
 * "itemsPerPage" is given it renders a pagelist, otherwise
 * the *whole* collection will be rendered
 * @param Object collection to work on
 * @param Object either a string which is interpreted as name of a skin
 *               or a function to call for each item (the item is passed
 *               as argument)
 * @param Int Number of items per page
 * @param Object String or Integer representing the currently viewed page
 * @return String rendered list
 */
function renderList(collection, funcOrSkin, itemsPerPage, pageIdx) {
   var currIdx = 0;
   var isArray = collection instanceof Array;
   var stop = size = isArray ? collection.length : collection.size();

   if (itemsPerPage) {
      var totalPages = Math.ceil(size/itemsPerPage);
      if (isNaN(pageIdx) || pageIdx > totalPages || pageIdx < 0)
         pageIdx = 0;
      currIdx = pageIdx * itemsPerPage;
      stop = Math.min(currIdx + itemsPerPage, size);
   }
   var isFunction = (funcOrSkin instanceof Function) ? true : false;
   res.push();
   while (currIdx < stop) {
      var item = isArray ? collection[currIdx] : collection.get(currIdx);
      isFunction ? funcOrSkin(item) : item.renderSkin(funcOrSkin);
      currIdx++;
   }
   return res.pop();
}

/**
 * render pagewise-navigationbar
 * @param Object collection to work on (either HopObject or Array)
 * @param String url of action to link to
 * @param String Number of items on one page
 * @param Int currently viewed page index
 * @return String rendered Navigationbar
 */
function renderPageNavigation(collectionOrSize, url, itemsPerPage, pageIdx) {

   /**
    * render a single item for page-navigation bar
    */
   var renderItem = function(text, cssClass, url, page) {
      var param = {"class": cssClass};
      if (!url)
         param.text = text;
      else {
         if (url.contains("?"))
            param.text = html.linkAsString({href: url + "&page=" + page}, text);
         else
            param.text = html.linkAsString({href: url + "?page=" + page}, text);
      }
      renderSkin("pagenavigationitem", param);
      return;
   }

   var maxItems = 10;
   var size = 0;
   if (collectionOrSize instanceof Array)
      size = collectionOrSize.length;
   else if (collectionOrSize instanceof HopObject)
      size = collectionOrSize.size();
   else if (!isNaN(collectionOrSize))
      size = parseInt(collectionOrSize, 10);
   var lastPageIdx = Math.ceil(size/itemsPerPage)-1;
   // if we have just one page, there's no need for navigation
   if (lastPageIdx <= 0)
      return null;

   // init parameter object
   var param = {};
   var pageIdx = parseInt(pageIdx, 10);
   // check if the passed page-index is correct
   if (isNaN(pageIdx) || pageIdx > lastPageIdx || pageIdx < 0)
      pageIdx = 0;
   param.display = ((pageIdx*itemsPerPage) +1) + "-" + (Math.min((pageIdx*itemsPerPage)+itemsPerPage, size));
   param.total = size;

   // render the navigation-bar
   res.push();
   if (pageIdx > 0)
      renderItem("prev", "pageNavItem", url, pageIdx-1);
   var offset = Math.floor(pageIdx/maxItems)*maxItems;
   if (offset > 0)
      renderItem("[..]", "pageNavItem", url, offset-1);
   var currPage = offset;
   var stop = Math.min(currPage + maxItems, lastPageIdx+1);
   while (currPage < stop) {
      if (currPage == pageIdx)
         renderItem("[" + (currPage +1) + "]", "pageNavSelItem");
      else
         renderItem("[" + (currPage +1) + "]", "pageNavItem", url, currPage);
      currPage++;
   }
   if (currPage < lastPageIdx)
      renderItem("[..]", "pageNavItem", url, offset + maxItems);
   if (pageIdx < lastPageIdx)
      renderItem("next", "pageNavItem", url, pageIdx +1);
   param.pagenavigation = res.pop();
   return renderSkinAsString("pagenavigation", param);
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
      res.redirect(res.handlers.site ? res.handlers.site.members.href("login") : root.members.href("login"));
   }
   return;
}

function singularize(plural) {
   if (plural.endsWith("ies")) {
      return plural.substring(0, plural.length-3) + "y";
   }
   return plural.substring(0, plural.length-1);
}

function pluralize(singular) {
   if (singular.endsWith("y")) {
      return singular.substring(0, singular.length-1) + "ies";
   }
   return singular + "s";
}

function getLocale(language) {
   return java.util.Locale[(language || "english").toUpperCase()];
}

/**
 * Creates an array of all available Java locales sorted by their names.
 * @param {String} language The optional language of the locales
 * @returns The sorted array containing the locales
 * @type Array
 * @member Global 
 */
function getLocales(language) {
   var result = [], locale;
   var displayLocale = getLocale(language);
   var locales = java.util.Locale.getAvailableLocales();
   for (var i in locales) {
      locale = locales[i].toString();
      result.push({
         value: locale,
         display: locales[i].getDisplayName(displayLocale),
      });
   }
   result.sort(new String.Sorter("display"));
   return result;
}

function getTimeZones(language) {
   var result = [], timeZone, offset;
   var locale = getLocale(language); 
   var zones = java.util.TimeZone.getAvailableIDs();
   for each (var zone in zones) {
      timeZone = java.util.TimeZone.getTimeZone(zone);
      offset = timeZone.getRawOffset();
      /*res.debug("zone id: " +  zone)
      res.debug("offset: " + timeZone.getRawOffset())
      res.debug("dst savings: " + timeZone.getDSTSavings())
      res.debug("old code: " + formatter.format(offset / Date.ONEHOUR))
      res.debug("new code: " + (offset / Date.ONEHOUR).format("+00;-00") + ":" + 
            (Math.abs(offset % Date.ONEHOUR) / Date.ONEMINUTE).format("00"))*/
      result.push({
         value: zone,
         display: zone + " (UTC" + (offset / Date.ONEHOUR).format("+00;-00") + 
               ":" + (Math.abs(offset % Date.ONEHOUR) / 
               Date.ONEMINUTE).format("00") + ")"
      });
   }
   result.sort(new String.Sorter("display"));
   return result;   
}

function getDateFormats(type, language) {
   var patterns;
   if (type === "short") {
      patterns = [SHORTDATEFORMAT, "yyyy/MM/dd HH:mm", 
            "yyyy.MM.dd, HH:mm", "d. MMMM, HH:mm", "MMMM d, HH:mm", 
            "d. MMM, HH:mm", "MMM d, HH:mm", "EEE, d. MMM, HH:mm", 
            "EEE MMM d, HH:mm", "EEE, HH:mm", "EE, HH:mm", "HH:mm"];
   } else if (type === "long") {
      patterns = [LONGDATEFORMAT, "EEEE, MMMM dd, yyyy, HH:mm", 
            "EE, d. MMM. yyyy, HH:mm", "EE MMM dd, yyyy, HH:mm", 
            "EE yyyy-MM-dd HH:mm", "yyyy-MM-dd HH:mm", "d. MMMM yyyy, HH:mm", 
            "MMMM d, yyyy, HH:mm", "d. MMM yyyy, HH:mm", "MMM d, yyyy, HH:mm"];
   }
   var result = [], sdf;
   var locale = getLocale(language);
   var now = new Date;
   for each (var pattern in patterns) {
      sdf = new java.text.SimpleDateFormat(pattern, locale);
      result.push([encodeForm(pattern), sdf.format(now)]);
   }
   return result;
}

/**
 * Renders a string depending on the comparison of two values. If the first 
 * value equals the second value, the first result will be returned; the 
 * second result otherwise.
 * <p>Example: <code>&lt;% if &lt;% macro %&gt; is "value" then "yes!" else "no :(" %&gt;</code>
 * </p>
 * Note that any value or result can be a macro, too. Thus, this can be used as
 * a simple implementation of an if-then-else statement by using Helma macros
 * only. 
 * @param {Object} param The default Helma macro parameter object
 * @param {String} firstValue The first value
 * @param {String} _is_ Syntactic sugar; should be "is" for legibility
 * @param {String} secondValue The second value
 * @param {String} _then_ Syntactic sugar; should be "then" for legibility
 * @param {String} firstResult The first result, ie. the value that will be 
 * returned if the first value equals the second one
 * @param {String} _else_ Syntactic sugar; should be "else" for legibility
 * @param {String} secondResult The second result, ie. the value that will be 
 * returned if the first value does not equal the second one
 * @returns The resulting value
 * @type String
 * @member Global
 */
function if_macro(param, firstValue, _is_, secondValue, _then_, firstResult, 
      _else_, secondResult) {
   return (("" + firstValue) == ("" + secondValue)) ? firstResult : secondResult;
}

function age_filter(value, param) {
   if (!value || value.constructor !== Date) {
      return value;
   }
   return value.getAge()
}

function link_filter(value, param, url) {
   url || (url = value);
   return renderLink(param, url, value);
}

function format_filter(value, param, pattern) {
   if (value && value.format) {
      // FIXME: var locale = res.handlers.site.language;
      return value.format(pattern || param.pattern);
   }
   return;
}

function clip_filter(input, param, limit, clipping, delimiter) {
   var len = 0;
   if (input) {
      len = input.length;
      input = input.stripTags();
   }
   input || (input = ngettext("({0} character)", "({0} characters)", len));
   limit || (limit = 20);
   clipping || (clipping = "...");
   delimiter || (delimiter = "\\s");
   return String(input || "").head(limit, clipping, delimiter);
}

var gettext_macro = function(param, text /*, value1, value2, ...*/) {
   var args = [text];
   for (var i=2; i<arguments.length; i+=1) {
      args.push(arguments[i]);
   }
   return gettext.apply(this, args);
};

var ngettext_macro = function(param, singular, plural, value1 /*, value2, value3, ...*/) {
   var args = [singular, plural, value1];
   for (var i=4; i<arguments.length; i+=1) {
      args.push(arguments[i]);
   }
   return ngettext.apply(this, args);
};

