// The Antville Project
// http://code.google.com/p/antville
//
// Copyright 2007-2011 by Tobi Schäfer.
//
// Copyright 2001–2007 Robert Gaggl, Hannes Wallnöfer, Tobi Schäfer,
// Matthias & Michael Platzer, Christoph Lincke.
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
// $Author$
// $Date$
// $URL$

/**
 * @fileOverview Defines global variables and functions.
 */

app.addRepository(app.dir + "/../lib/rome-1.0.jar");
app.addRepository(app.dir + "/../lib/jdom.jar");
app.addRepository(app.dir + "/../lib/itunes-0.4.jar");

app.addRepository("modules/core/Global.js");
app.addRepository("modules/core/HopObject.js");
app.addRepository("modules/core/Filters.js");
app.addRepository("modules/core/JSON");
app.addRepository("modules/core/Number.js");

app.addRepository("modules/helma/File");
app.addRepository("modules/helma/Image.js");
app.addRepository("modules/helma/Html.js");
app.addRepository("modules/helma/Http.js");
app.addRepository("modules/helma/Mail.js");
app.addRepository("modules/helma/Zip.js");

app.addRepository("modules/jala/code/Date.js");
app.addRepository("modules/jala/code/HopObject.js");
app.addRepository("modules/jala/code/ListRenderer.js");
app.addRepository("modules/jala/code/Utilities.js");

var dir = new helma.File(app.dir, "../i18n");
for each (let fname in dir.list()) {
   fname.endsWith(".js") && app.addRepository(app.dir + "/../i18n/" + fname);
}
// I18n.js needs to be added *after* the message files or the translations get lost
app.addRepository("modules/jala/code/I18n.js");

// FIXME: Be careful with property names of app.data;
// they inherit all properties from HopObject!
/**
 * @name app.data 
 * @namespace
 */
/** @name app.data.callbacks */
app.data.callbacks || (app.data.callbacks = []);
/** @name app.data.entries */
app.data.entries || (app.data.entries = []);
/** @name app.data.features */
app.data.features || (app.data.features = []);
/** @name app.data.mails */
app.data.mails || (app.data.mails = []);
/** @name app.data.requests */
app.data.requests || (app.data.requests = {});

/**
 * @name helma.File
 * @namespace
 */
/**
 * @param {helma.File} target
 */
helma.File.prototype.copyDirectory = function(target) {
   /*
   // Strange enough, Apache commons is not really faster...
   var source = new java.io.File(this.toString());
   target = new java.io.File(target.toString());
   return Packages.org.apache.commons.io.FileUtils.copyDirectory(source, target);
   */
   this.list().forEach(function(name) {
      var file = new helma.File(this, name);
      if (file.isDirectory()) {
         file.copyDirectory(new helma.File(target, name));
      } else {
         target.makeDirectory();
         file.hardCopy(new helma.File(target, name));
      }
   });
   return;
}

/**
 * @name helma.Mail
 * @namespace
 */
/**
 * Extend the Mail prototype with a method that simply adds a mail object 
 * to an application-wide array (mail queue).
 * @returns {Number} The number of mails waiting in the queue
 */
helma.Mail.prototype.queue = function() {
   return app.data.mails.push(this);
}

/**
 * 
 */
helma.Mail.flushQueue = function() {
   if (app.data.mails.length > 0) {
      app.debug("Flushing mail queue, sending " + 
            app.data.mails.length + " messages");
      var mail;
      while (app.data.mails.length > 0) {
         mail = app.data.mails.pop();
         mail.send();
         if (mail.status > 0) {
            app.debug("Error while sending e-mail (status " + mail.status + ")");
            mail.writeToFile(getProperty("smtp.dir"));
         }
      }
   }
   return;
}

jala.i18n.setLocaleGetter(function() {
   return (res.handlers.site || root).getLocale();
});

/** @constant */
var SQLDATEFORMAT = "yyyy-MM-dd HH:mm:ss";

// RegExp according to Jala’s HopObject.getAccessName()
/** @constant */
var NAMEPATTERN = /[\/+\\]/;

/** @function */
var idle = new Function;

/** */
var html = new helma.Html();

/** */
var rome = new JavaImporter(
   Packages.com.sun.syndication.io,
   Packages.com.sun.syndication.feed.synd,
   Packages.com.sun.syndication.feed.module.itunes,
   Packages.com.sun.syndication.feed.module.itunes.types
);

/**
 * 
 */
function onStart() {
   if (typeof root === "undefined") {
      app.logger.error("Error in database configuration: no root site found.");
      return;
   }
   // This is necessary once to be sure that aspect-oriented code will be applied
   HopObject.prototype.onCodeUpdate && HopObject.prototype.onCodeUpdate();
   return;
}

/**
 * 
 */
function onStop() { /* Currently empty, just to avoid annoying log message */ }

/**
 * 
 * @param {HopObject} ctor
 * @returns {Function} 
 */
function defineConstants(ctor /*, arguments */) {
   var constants = [], name;
   for (var i=1; i<arguments.length; i+=1) {
      name = arguments[i].toUpperCase().replace(/\s/g, "");
      ctor[name] = arguments[i].toLowerCase();
      constants.push(arguments[i]);
   }
   return function() {
      return constants.map(function(item) {
         return {
            value: item.toLowerCase(),
            display: gettext(item)
         }
      });
   };
}

/**
 * Disable a macro with the idle function
 * @param {HopObject} ctor
 * @param {String} name
 * @returns {Function}
 */
function disableMacro(ctor, name) {
   return ctor.prototype[name + "_macro"] = idle;
}

/**
 * @returns {Number} The period in milliseconds the scheduler will be 
 * called again. 
 */
function scheduler() {
   helma.Mail.flushQueue();
   Admin.commitEntries();
   Admin.commitRequests();
   Admin.invokeCallbacks();
   Admin.updateDomains();
   Admin.updateHealth();
   return app.properties.schedulerInterval;
}

/**
 * 
 */
function nightly() {
   var now = new Date;
   if (now - (global.nightly.lastRun || -Infinity) < Date.ONEMINUTE) {
      return; // Avoid running twice when main scheduler runs more than once per minute
   }
   app.log("***** Running nightly scripts *****");
   Admin.purgeReferrers();
   Admin.purgeSites();
   Admin.dequeue();
   global.nightly.lastRun = now;
   return;
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
 * @returns {String} The resulting value
 */
function if_macro(param, firstValue, _is_, secondValue, _then_, firstResult, 
      _else_, secondResult) {
   return (("" + firstValue) == ("" + secondValue)) ? firstResult : secondResult;
}

/**
 * 
 * @param {Object} param
 * @param {String} format
 * @returns {String} The formatted current date string
 * @see formatDate
 */
function now_macro(param, format) {
   return formatDate(new Date, format || param.format);
}

/**
 * @returns {String} The rendered link element
 * @see renderLink
 */
function link_macro() {
   return renderLink.apply(this, arguments);
}

/**
 * 
 * @param {Object} param
 * @param {String} name
 * @returns {String} The rendered skin
 * @see HopObject#skin_macro
 */
// FIXME: The definition with "var" is necessary; otherwise the skin_macro()
// method won't be overwritten reliably. (Looks like a Helma bug.)
var skin_macro = function(param, name) {
  return HopObject.prototype.skin_macro.apply(this, arguments);
}

/**
 * 
 * @param {Object} param
 * @param {String} delimiter
 */
function breadcrumbs_macro (param, delimiter) {
   delimiter || (delimiter = param.separator || " : ");
   //html.link({href: res.handlers.site.href()}, res.handlers.site.getTitle());
   var offset = res.handlers.site === root ? 1 : 2;
   for (var item, title, i=offset; i<path.length; i+=1) {
      if (item = path[i]) {
         if (!isNaN(item._id) && item.constructor !== Layout) {
            continue;
         }
         if (i === path.length-1 && req.action === "main") {
            res.write(item.getTitle());
         } else {
            html.link({href: path[i].href()}, item.getTitle());
         }
         (i < path.length-1) && res.write(delimiter);
     }
   }
   if (req.action !== "main") {
      res.write(delimiter);
      res.write(gettext(req.action.titleize()));
   }
   return;
}

/**
 * Helper macro for checking if a user session is authenticated (logged in).
 * Returns true if user is logged in, false otherwise.
 * @returns Boolean
 */
function user_macro() {
   return !!session.user;
}

/**
 * 
 * @param {Object} param
 * @param {String} id
 * @param {String} mode
 */
function story_macro(param, id, mode) {
   var story = HopObject.getFromPath(id, "stories");
   if (!story || !story.getPermission("main")) {
      return;
   }

   switch (mode) {
      case "url":
      res.write(story.href());
      break;
      case "link":
      html.link({href: story.href()}, story.getTitle());
      break;
      default:
      story.renderSkin("Story#" + (param.skin || "embed"));
   }
   return;
}

/**
 * 
 * @param {Object} param
 * @param {String} id
 * @param {String} mode
 */
function file_macro(param, id, mode) {
   if (!id) {
      return;
   }

   var file;
   if (id.startsWith("/")) {
      name = id.substring(1);
      if (mode === "url") {
         res.write(root.getStaticUrl(name));
      } else {
         file = root.getStaticFile(name);
         res.push();
         File.prototype.contentLength_macro.call({
            contentLength: file.getLength()
         });
         res.handlers.file = {
            href: root.getStaticUrl(name),
            name: name,
            contentLength: res.pop()
         };
         File.prototype.renderSkin("File#main");
      }
      return;
   }

   file = HopObject.getFromPath(id, "files");
   if (!file) {
      return;
   }
   if (mode === "url") {
      res.write(file.getUrl());
   } else {
      file.renderSkin(param.skin || "File#main");
   }
   return;
}

/**
 * 
 * @param {Object} param
 * @param {String} id
 * @param {String} mode
 */
function image_macro(param, id, mode) {
   if (!id) {
      return;
   }

   var image;
   if (id.startsWith("/")) {
      var name = id.substring(1);
      image = Images.Default[name] || Images.Default[name + ".gif"];
   } else {
      image = HopObject.getFromPath(id, "images");
      if (!image && param.fallback) {
         image = HopObject.getFromPath(param.fallback, "images");
      }
   }

   if (!image) {
      return;
   }
   
   switch (mode) {
      case "url":
      res.write(image.getUrl());
      break;
      case "thumbnail":
      case "popup":
      var url = image.getUrl();
      html.openTag("a", {href: url});
      // FIXME: Bloody popups belong to compatibility layer
      (mode === "popup") && (param.onclick = 'javascript:openPopup(\'' + 
            url + '\', ' + image.width + ', ' + image.height + '); return false;')
      image.thumbnail_macro(param);
      html.closeTag("a");
      break;
      default:
      image.render_macro(param);
   }
   return;
}

/**
 * 
 * @param {Object} param
 * @param {String} id
 * @param {String} mode
 */
function poll_macro(param, id, mode) {
   if (!id) {
      return;
   }

   var poll = HopObject.getFromPath(id, "polls");
   if (!poll) {
      return;
   }

   switch (mode) {
      case "url":
      res.write(poll.href());
      break;
      case "link":
      html.link({
         href: poll.href(poll.status === Poll.CLOSED ? "result" : "")
      }, poll.question);
      break;
      default:
      if (poll.status === Poll.CLOSED || mode === "results")
         poll.renderSkin("$Poll#results", {});
      else {
         poll.renderSkin("$Poll#main", {});
      }
   }
   return;
}

/**
 * 
 * @param {Object} param
 * @param {String} id
 * @param {String} limit
 */
function list_macro(param, id, limit) {
   if (!id) {
      return;
   }
   
   var max = Math.min(limit || 25, 50);
   var collection, skin;
   if (id === "sites") {
      collection = root.sites.list(0, max);
      skin = "Site#preview";
   } else if (id === "updates") {
      collection = root.updates.list(0, limit);
      skin = "Site#preview";
   } else {
      var site;
      var parts = id.split("/");
      if (parts.length > 1) {
         type = parts[1];
         site = root.sites.get(parts[0]);
      } else {
         type = parts[0];
      }

      site || (site = res.handlers.site);
      var filter = function(item, index) {
         return index < max && item.getPermission("main");
      }
      
      var commentFilter = function(item) {
         if (item.story.status !== Story.CLOSED && 
               item.site.commentMode !== Site.DISABLED &&
               item.story.commentMode !== Story.CLOSED) {
            return true;
         }
         return false;
      }

      switch (type) {
         case "comments":
         if (site.commentMode !== Site.DISABLED) {
            var comments = site.stories.comments;
            collection = comments.list().filter(filter);
            skin = "Story#preview";
         }
         break;
         
         case "featured":
         collection = site.stories.featured.list(0, max);
         skin = "Story#preview";
         break;
         
         case "images":
         collection = site.images.list(0, max);
         skin = "Image#preview";
         break;
         
         case "postings":
         content = site.stories.union;
         collection = content.list().filter(filter).filter(function(item) {
            if (item.constructor === Comment) {
               return commentFilter(item);
            }
            return true;
         });
         skin = "Story#preview";
         break;
         
         case "stories":
         var stories = site.stories.recent;
         var counter = 0;
         collection = stories.list().filter(function(item, index) {
            return item.constructor === Story && filter(item, counter++);
         });
         skin = "Story#preview";
         break;
         
         case "tags":
         return site.tags.list_macro(param, param.skin || "$Tag#preview");
         break;
         
         default:
         break;
      }
   }
   param.skin && (skin = param.skin);
   for each (var item in collection) {
      // FIXME: Work-around for "story" handlers in comment skins
      // (Obsolete as soon as "story" handlers are replaced with "this")
      if (item.constructor === Comment) {
         res.handlers.story = item;
      }
      item.renderSkin(skin);
   }
   return;
}

/**
 * 
 * @param {Object} param
 * @param {String} name
 * @param {String} value
 */
function value_macro(param, name, value) {
   if (!name) {
      return;
   }
   name = name.toLowerCase();
   if (!value) {
      res.write(res.meta.values[name]);
   } else {
      //res.write("/* set " + name + " to " + value + " */");
      res.meta.values[name] = value;
   }
   return;
}

/**
 * 
 * @param {Object} param
 * @param {String} id
 */
function randomize_macro(param, id) {
   var getRandom = function(n) {
      return Math.floor(Math.random() * n);
   };

   var site;
   if (id === "sites") {
      site = root.sites.get(getRandom(root.sites.size()));
      site.renderSkin(param.skin || "Site#preview");
      return;
   }

   var parts = id.split("/");
   if (parts.length > 1) {
      type = parts[1];
      site = root.sites.get(parts[0]);
   } else {
      type = parts[0];
   }
   site || (site = res.handlers.site);
   switch (type) {
      case "stories":
      var stories = site.stories["public"];
      var story = stories.get(getRandom(stories.size()));
      story && story.renderSkin(param.skin || "Story#preview");
      break;
      case "images":
      var image = site.images.get(getRandom(site.images.size()));
      image && image.renderSkin(param.skin || "Image#preview");
      break;
   }
   return;
}

/**
 * 
 */
function listItemFlag_macro(param, str) {
   res.push();
   for (var i=0; i<str.length; i+=1) {
      res.write(str.charAt(i));
      res.write("<br />");
   }
   renderSkin("$Global#listItemFlag", {text: res.pop()});
   return;
}

/**
 * 
 * @param {Object} param
 * @param {String} url
 * @param {String} text
 * @param {HopObject} handler
 */
function renderLink(param, url, text, handler) {
   url || (url = param.url || String.EMPTY);
   text || (text = param.text || url);
   if (!text || (handler && !handler.href)) {
      return;
   }
   if (url === "." || url === "main") {
      url = String.EMPTY;
   }
   delete param.url;
   delete param.text;
   param.title || (param.title = String.EMPTY);
   if (!handler || url.contains(":")) {
      param.href = url;
   } else if (url.contains("/") || url.contains("?") || url.contains("#")) {
      var parts = url.split(/(\/|\?|#)/);
      param.href = handler.href(parts[0]) + parts.splice(1).join(String.EMPTY);
   } else {
      param.href = handler.href(url);
   }
   html.link(param, text);
   return;
}

/**
 * 
 * @param {String} str
 * @returns {String|null} The e-mail string if valid, null otherwise
 */
function validateEmail(str) {
	if (str) {
      if (str.isEmail()) {
         return str;
      }
   }
   return null;
}

/**
 * 
 * @param {String} str
 * @returns {String|null} The URL string if valid, null otherwise
 */
function validateUrl(str) {
   if (str) {
      if (str.isUrl()) {
         return str;
      } else if (str.isEmail()) {
         return "mailto:" + str;
      } else {
         return null;
      }
   }
   return null;
}

/**
 * 
 * @param {String} str
 * @returns {String} The processed string
 */
function quote(str) {
   if (/[\W\D]/.test(str)) {
      str = '"' + str + '"';
   }
   return str;
}

/**
 * 
 * @param {Number} number
 * @param {String} pattern
 * @returns {String} The formatted number string
 */
function formatNumber(number, pattern) {
   return Number(number).format(pattern, res.handlers.site.getLocale());
}

/**
 * 
 * @param {Date} date
 * @param {String} format
 * @returns {String} The formatted date string
 */
function formatDate(date, format) {
   if (!date) {
      return null;
   }
   
   var pattern, 
         site = res.handlers.site,
         locale = site.getLocale();

   switch (format) {
      case null:
      case undefined:
      format = "full"; // Caution! Passing through to next case block!
      case "short":
      case "medium":
      case "long":
      case "full":
      var type = java.text.DateFormat[format.toUpperCase()];
      pattern = java.text.DateFormat.getDateTimeInstance(type, type, locale).toPattern();
      break;
      
      case "date":
      var type = java.text.DateFormat.FULL
      pattern = java.text.DateFormat.getDateInstance(type, locale).toPattern();
      break;

      case "time":
      var type = java.text.DateFormat.SHORT;
      pattern = java.text.DateFormat.getTimeInstance(type, locale).toPattern();
      break;
      
      case "iso":
      pattern = Date.ISOFORMAT;
      break;
      
      case "text":
      var text,
            now = new Date,
            diff = now - date;
      if (diff < 0) {
         // FIXME: Do something similar for future dates
         text = formatDate(date);
      } else if (diff < Date.ONEMINUTE) {
         text = gettext("Right now");
      } else if (diff < Date.ONEHOUR) {
         text = ngettext("{0} minute ago", "{0} minutes ago",
               parseInt(diff / Date.ONEMINUTE, 10));
      } else if (diff < Date.ONEDAY) {
         text = ngettext("{0} hour ago", "{0} hours ago",
               parseInt(diff / Date.ONEHOUR, 10));
      } else if (diff < 2 * Date.ONEDAY) {
         text = gettext("Yesterday");
      } else {
         text = ngettext("{0} day ago", "{0} days ago",
               parseInt(diff / Date.ONEDAY, 10));
      }
      return text;
      
      default:
      pattern = format;
   }

   try {
      return date.format(pattern, locale, site.getTimeZone());
   } catch (ex) {
      return "[Invalid date format]";
   }

   return String.EMPTY;
}

/**
 * Injects the XSLT stylesheet declaration into an XML string until  
 * Mozilla developers will have mercy.
 * @param {String} xml An XML string
 * @returns {String} An XML string containing the XSLT stylesheet declaration
 */
function injectXslDeclaration(xml) {
   res.push();
   renderSkin("Global#xslDeclaration");
   return xml.replace(/(\?>\r?\n?)/, "$1" + res.pop());
}

/**
 * General mail sending function. Mails will be queued in app.data.mails.
 * @param {Object} recipient The recipient's email addresses
 * @param {String} subject The e-mail's subject
 * @param {String} body The body text of the e-mail
 * @returns {Number} The status code of the underlying helma.Mail instance
 */
function sendMail(recipient, subject, body, options) {
   options || (options = {});
   if (!recipient || !body) {
      throw Error("Insufficient arguments in method sendMail()");
   }
   var mail = new helma.Mail(getProperty("smtp", "localhost"), 
         getProperty("smtp.port", "25"));
   mail.setFrom(root.replyTo || "root@localhost");
   if (recipient instanceof Array) {
      for (var i in recipient) {
         mail.addBCC(recipient[i]);
      }
   } else {
      mail.addTo(recipient);
   }
   mail.setSubject(subject);
   mail.setText(body);
   if (options.footer !== false) { // It is the exception to have no footer
      mail.addText(renderSkinAsString("$Global#mailFooter"));
   }
   mail.queue();
   return mail.status;
}

/**
 * 
 * @param {String} language
 * @returns {java.util.Locale} The corresponding locale object
 */
function getLocale(language) {
   return new java.util.Locale(language || "english");
}

/**
 * Creates an array of all available Java locales sorted by their names.
 * @param {String} language The optional language of the locales
 * @returns {Object[]} A sorted array containing the corresponding locales
 */
function getLocales(language) {
   var result = [], locale, localeString;
   var locales = java.util.Locale.getAvailableLocales();
   for (var i in locales) {
      locale = locales[i];
      localeString = locale.toString();
      if (!localeString.contains("_")) {
         result.push({
            value: localeString,
            display: locale.getDisplayName(locale),
            "class": jala.i18n.getCatalog(jala.i18n.getLocale(localeString)) ? "translated" : ""
         });
      }
   }
   result.sort(new String.Sorter("display"));
   return result;
}

/**
 * This method returns an array of structs providing two properties each:
 * <code>value</code> – a unique time zone ID
 * <code>display</code> – a (more) user-friendly string
 * Although Java is great in providing all time zones one can imagine, this
 * vast amount of choices fails to support easy time zone selection.
 * Furthermore, the L10n features of the java.util.TimeZone class are insufficient
 * as they do only translate the generic string returned by the getDisplayName()
 * method (e.g. Central European Time), not the more usable time zone IDs 
 * (e.g. Europe/Vienna). Thus, time zone selection in Antville is rather limited.
 * @param {String} language
 * @returns {Object[]} A sorted array containing the corresponding timezones
 */
function getTimeZones(language) {
   var result = [],
         timeZones = [],
         locale = getLocale(language),
         ids = java.util.TimeZone.getAvailableIDs();

   for each (let id in ids) {
      // Exclude confusing time zones
      if (id.length < 4 || !id.contains("/") || 
            id.startsWith("Etc") || id.startsWith("System")) {
         continue;
      }
      let timeZone = java.util.TimeZone.getTimeZone(id);
      // Exclude more confusing time zones
      if (timeZone.getDisplayName().startsWith("GMT")) {
         continue;
      }
      result.push({
         value: timeZone.getID(),
         display: timeZone.getID().replace(/_/g, String.SPACE)
      })
      timeZones.push(timeZone);
   }

   return result.sort(new String.Sorter("display"));
}

/**
 * 
 * @param {Object} value
 * @param {Object} param
 * @param {Object} defaultValue
 * @returns {Object} The value argument if truthy, the defaultValue argument
 * otherwise
 */
function default_filter(value, param, defaultValue) {
   return value || defaultValue;
}

/**
 * 
 * @param {Date} value
 * @param {Object} param
 * @returns {String} The age string of a date
 */
function age_filter(value, param) {
   if (!value || value.constructor !== Date) {
      return value;
   }
   return value.getAge()
}

/**
 * 
 * @param {String} text
 * @param {String} param
 * @param {Object} url
 * @returns {String} The rendered link element
 * @see renderLink
 */
function link_filter(text, param, url) {
   if (text) {
      url || (url = text);
      res.push();
      renderLink(param, url, text);
      return res.pop();
   }
   return;
}

/**
 * 
 * @param {Object} string
 * @param {Object} param
 * @param {String} pattern
 * @param {String} type
 * @returns {String} The formatted string
 */
function format_filter(value, param, pattern, type) {
   if (!value && value !== 0) {
      return;
   }
   var f = global["format" + value.constructor.name];
   if (f && f.constructor === Function) {
      return f(value, pattern || param.pattern, type);
   }
   return value;
}

/**
 * 
 * @param {String} input
 * @param {Object} param
 * @param {Number} limit
 * @param {String} clipping
 * @param {String} delimiter
 * @returns {String} The clipped input
 */
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

// FIXME:
/**
 * 
 * @param {String} rss
 * @returns {String} The fixed RSS string
 */
function fixRssText(rss) {
   var re = new RegExp("<img src\\s*=\\s*\"?([^\\s\"]+)?\"?[^>]*?(alt\\s*=\\s*\"?([^\"]+)?\"?[^>]*?)?>", "gi");
   rss = rss.replace(re, "[<a href=\"$1\" title=\"$3\">Image</a>]");
   return rss;
}

// FIXME:
/**
 * 
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

// FIXME:
/**
 * @ignore
 * @param {Object} src
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

// FIXME: Rewrite with jala.ListRenderer?
/**
 * 
 * @param {HopObject|Array} collection
 * @param {Function|Skin} funcOrSkin
 * @param {Number} itemsPerPage
 * @param {Number} pageIdx
 * @returns {String} The rendered list
 */
function renderList(collection, funcOrSkin, itemsPerPage, pageIdx) {
   var currIdx = 0, item;
   var isArray = collection instanceof Array;
   var stop = size = isArray ? collection.length : collection.size();

   if (itemsPerPage) {
      var totalPages = Math.ceil(size/itemsPerPage);
      if (isNaN(pageIdx) || pageIdx > totalPages || pageIdx < 0) {
         pageIdx = 0;
      }
      currIdx = pageIdx * itemsPerPage;
      stop = Math.min(currIdx + itemsPerPage, size);
   }

   var isFunction = (funcOrSkin instanceof Function) ? true : false;
   res.push();
   while (currIdx < stop) {
      item = isArray ? collection[currIdx] : collection.get(currIdx);
      isFunction ? funcOrSkin(item) : item.renderSkin(funcOrSkin);
      currIdx += 1;
   }
   return res.pop();
}

// FIXME: Rewrite using jala.ListRenderer or rename (eg. renderIndex)
/**
 * 
 * @param {HopObject|Array|Number} collectionOrSize
 * @param {String} url
 * @param {Number} itemsPerPage
 * @param {Number} pageIdx
 * @returns {String} The rendered index
 */
function renderPager(collectionOrSize, url, itemsPerPage, pageIdx) {
   // Render a single item for the navigation bar
   var renderItem = function(text, cssClass, url, page) {
      var param = {"class": cssClass};
      if (!url) {
         param.text = text;
      } else {
         if (url.contains("?"))
            param.text = html.linkAsString({href: url + "&page=" + page}, text);
         else
            param.text = html.linkAsString({href: url + "?page=" + page}, text);
      }
      renderSkin("$Global#pagerItem", param);
      return;
   }

   var maxItems = 10;
   var size = 0;
   if (collectionOrSize instanceof Array) {
      size = collectionOrSize.length;
   } else if (collectionOrSize instanceof HopObject) {
      size = collectionOrSize.size();
   } else if (!isNaN(collectionOrSize)) {
      size = parseInt(collectionOrSize, 10);
   }
   var lastPageIdx = Math.ceil(size/itemsPerPage)-1;
   // If there's just one page no navigation will be rendered
   if (lastPageIdx <= 0) {
      return null;
   }

   // Initialize the parameter object
   var param = {};
   var pageIdx = parseInt(pageIdx, 10);
   // Check if the passed index is correct
   if (isNaN(pageIdx) || pageIdx > lastPageIdx || pageIdx < 0) {
      pageIdx = 0;
   }
   param.display = ((pageIdx * itemsPerPage) + 1) + "-" + 
         (Math.min((pageIdx * itemsPerPage) + itemsPerPage, size));
   param.total = size;

   // Render the navigation-bar
   res.push();
   (pageIdx > 0) && renderItem("[–]", "pageNavItem", url, pageIdx-1);
   var offset = Math.floor(pageIdx / maxItems) * maxItems;
   (offset > 0) && renderItem("[..]", "pageNavItem", url, offset-1);
   var currPage = offset;
   var stop = Math.min(currPage + maxItems, lastPageIdx+1);
   while (currPage < stop) {
      if (currPage === pageIdx) {
         renderItem("[" + (currPage +1) + "]", "pageNavSelItem");
      } else {
         renderItem("[" + (currPage +1) + "]", "pageNavItem", url, currPage);
      }
      currPage += 1;
   }
   if (currPage < lastPageIdx) {
      renderItem("[..]", "pageNavItem", url, offset + maxItems);
   }
   if (pageIdx < lastPageIdx) {
      renderItem("[+]", "pageNavItem", url, pageIdx +1);
   }
   param.pager = res.pop();
   return renderSkinAsString("$Global#pager", param);
}

/**
 * 
 * @param {String} plural
 * @returns {String} The english singular form of the input
 */
function singularize(plural) {
   if (plural.endsWith("ies")) {
      return plural.substring(0, plural.length-3) + "y";
   }
   return plural.substring(0, plural.length-1);
}

/**
 * 
 * @param {String} singular
 * @returns {String} The english plural form of the input
 */
function pluralize(singular) {
   if (singular.endsWith("y")) {
      return singular.substring(0, singular.length-1) + "ies";
   }
   return singular + "s";
}

/**
 * 
 * @param {Number} millis
 */
var wait = function(millis) {
   millis || (millis = Date.ONESECOND);
   var now = new Date;
   while (new Date - now < millis) {
      void null;
   }
   return;
}

/**
 *
 * @param {Object} param
 * @param {String} type
 */
function version_macro(param, type) {
   var version = Root.VERSION;
   var result = version[type || "default"];
   return result || version;
}
