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

app.addRepository(app.dir + "/../lib/rome-0.9.jar");
app.addRepository(app.dir + "/../lib/jdom.jar");
app.addRepository(app.dir + "/../lib/itunes-0.4.jar");

app.addRepository("modules/core/Global.js");
app.addRepository("modules/core/HopObject.js");
app.addRepository("modules/core/Number.js");
app.addRepository("modules/core/Filters.js");

app.addRepository("modules/helma/Image.js");
app.addRepository("modules/helma/Html.js");
app.addRepository("modules/helma/Http.js");
app.addRepository("modules/helma/Mail.js");
app.addRepository("modules/helma/Search.js");
app.addRepository("modules/helma/Zip.js");

app.addRepository("modules/jala/code/Date.js");
app.addRepository("modules/jala/code/HopObject.js");
app.addRepository("modules/jala/code/I18n.js");
app.addRepository("modules/jala/code/ListRenderer.js");
app.addRepository("modules/jala/code/Utilities.js");

// FIXME: Be careful with property names of app.data;
// they inherit all properties from HopObject!
app.data.entries || (app.data.entries = []);
app.data.mails || (app.data.mails = []);
app.data.requests || (app.data.requests = {});
app.data.callbacks || (app.data.callbacks = []);
app.data.exports || (app.data.exports = []);
app.data.imports || (app.data.imports = []);

/**
 * Extend the Mail prototype with a method that simply adds a mail object 
 * to an application-wide array (mail queue).
 */
helma.Mail.prototype.queue = function() {
   return app.data.mails.push(this);
}

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
   return res.handlers.site.getLocale();
});

var SHORTDATEFORMAT = "yyyy-MM-dd HH:mm";
var LONGDATEFORMAT = "EEEE, d. MMMM yyyy, HH:mm";
var SQLDATEFORMAT = "yyyy-MM-dd HH:mm:ss";

var idle = new Function;
var html = new helma.Html();

var rome = new JavaImporter(
   Packages.com.sun.syndication.feed.synd,
   Packages.com.sun.syndication.io.SyndFeedOutput,
   Packages.com.sun.syndication.feed.module.itunes,
   Packages.com.sun.syndication.feed.module.itunes.types
);

function onStart() {
   if (typeof root === "undefined") {
      app.logger.error("Error in database configuration: no root site found.");
      return;
   }
   app.addCronJob("nightly", "*", "*", "*", "*", "5", "0");      
   // FIXME: Does database exist?
   /*var db = getDBConnection("antville");
   var rows = db.executeRetrieval("select min(id) as id from site");
   rows.next();
   var id = rows.getColumnItem("id");
   //Packages.helma.main.Server.getServer().stopApplication(app.name);
   rows.release();*/
   return;
}

function defineConstants(ctor /*, arguments */) {
   var constants = [], name;
   for (var i=1; i<arguments.length; i+=1) {
      name = arguments[i].toUpperCase().replace(/\s/g, "");
      if (ctor[name]) {
         //app.logger.warn("Constant already defined: " + ctor.name + "." + name);
      }
      ctor[name] = arguments[i];
      constants.push({
         value: arguments[i],
         display: arguments[i]
      });
   }
   return function() {
      return constants;
   };
}

function disableMacro(ctor, name) {
   return ctor.prototype[name + "_macro"] = idle;
}

function scheduler() {
   Root.commitEntries();
   Root.commitRequests();
   Root.invokeCallbacks();
   Root.updateHealth();
   Root.exportImport();
   helma.Mail.flushQueue();
   return 5000;
}

function nightly() {
   Root.purgeReferrers();
   //Admin.purgeDatabase();
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
 * @returns The resulting value
 * @type String
 * @member Global
 */
function if_macro(param, firstValue, _is_, secondValue, _then_, firstResult, 
      _else_, secondResult) {
   return (("" + firstValue) == ("" + secondValue)) ? firstResult : secondResult;
}

function gettext_macro(param, text /*, value1, value2, ...*/) {
   var args = [text];
   for (var i=2; i<arguments.length; i+=1) {
      args.push(arguments[i]);
   }
   return gettext.apply(this, args);
}

function ngettext_macro(param, singular, plural, value1 /*, value2, value3, ...*/) {
   var args = [singular, plural, value1];
   for (var i=4; i<arguments.length; i+=1) {
      args.push(arguments[i]);
   }
   return ngettext.apply(this, args);
}

function now_macro(param, format) {
   return formatDate(new Date, format || param.format);
}

function link_macro() {
   return renderLink.apply(this, arguments);
}

// FIXME: The definition with "var" is necessary; otherwise the skin_macro()
// method won't be overwritten reliably. (Looks like a Helma bug.)
var skin_macro = function(param, name) {
  return HopObject.prototype.skin_macro.apply(this, arguments);
}

function breadcrumbs_macro (param, delimiter) {
   delimiter || (delimiter = param.separator || " : ");
   var offset = res.handlers.site === root ? 0 : 1;
   for (var i=offset; i<path.length-1; i+=1) {
      html.link({href: path[i].href()}, path[i].getTitle());
      res.write(delimiter);
   }
   var title = path[i].getTitle();
   if (req.action !== "main" && path[i].main_action) {
      html.link({href: path[i].href()}, title);
   } else {
      res.write(title);
   }
   return;
}

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
         poll.renderSkin("$Poll#results");
      else {
         poll.renderSkin("$Poll#main");
      }
   }
   return;
}

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
         var comments = site.stories.comments;
         collection = comments.list().filter(filter).filter(commentFilter);
         skin = "Story#preview";
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
         return site.tags.list_macro(param, "$Tag#item");
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

function renderLink(param, url, text, handler) {
   url || (url = param.url || "");
   text || (text = param.text || url);
   if (!text) {
      return;
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

function validateEmail(str) {
   if (str.isEmail()) {
      return str;
   }
   return null;
}

function validateUrl(str) {
   if (str) {
      if (url = helma.Http.evalUrl(str)) {
         return String(url);
      } else if (str.contains("@")) {
         return "mailto:" + str;
      } else {
         return "http://" + str;
      }
   }
   return null;
}

function quote(str) {
   if (/[\W\D]/.test(str)) {
      str = '"' + str + '"';
   }
   return str;
}

function formatNumber(number, pattern) {
   return Number(number).format(pattern, res.handlers.site.getLocale());
}

function formatDate(date, pattern) {
   if (!date) {
      return null;
   }
   pattern || (pattern = "short");
   var site = res.handlers.site;
   var format = site.metadata.get(pattern.toLowerCase() + "DateFormat");
   if (!format) {
      format = global[pattern.toUpperCase() + "DATEFORMAT"] || pattern;
   }
   try {
      return date.format(format, site.getLocale(), site.getTimeZone());
   } catch (ex) {
      return "[Macro error: Invalid date format]";
   }
   return;
}

/**
 * Injects the XSLT stylesheet until Mozilla developers will have mercy.
 * @param {String} xml The original XML code
 * @returns The XML code with the appropriate element for the XSLT stylesheet
 * @type String
 */
function injectXslDeclaration(xml) {
   res.push();
   renderSkin("Global#xslDeclaration");
   return xml.replace(/(\?>\r?\n?)/, "$1" + res.pop());
}

/**
 * General mail sending function. Mails will be queued in app.data.mails.
 * @param {String} sender The sender's e-mail address
 * @param {Object} recipient The recipient's email addresses
 * @param {String} subject The e-mail's subject
 * @param {String} body The body text of the e-mail
 * @return The status code of the underlying helma.Mail instance.
 * @type Number
 */
function sendMail(sender, recipient, subject, body) {
   if (!recipient || !body) {
      throw Error("Insufficient arguments in method sendMail()");
   }
   var mail = new helma.Mail();
   mail.setFrom("noreply@antville.org");
   if (recipient instanceof Array) {
      for (var i in recipient) {
         mail.addBCC(recipient[i]);
      }
   } else {
      mail.addTo(recipient);
   }
   mail.setSubject(subject);
   mail.setText(body);
   mail.addText(renderSkinAsString("$Global#disclaimer"));
   mail.queue();
   return mail.status;
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

function age_filter(value, param) {
   if (!value || value.constructor !== Date) {
      return value;
   }
   return value.getAge()
}

function link_filter(value, param, url) {
   if (value) { 
      url || (url = value);
      return renderLink(param, url, value);
   }
   return;
}

function format_filter(value, param, pattern) {
   if (!value && value !== 0) {
      return;
   }
   var f = global["format" + value.constructor.name];
   if (f && f.constructor === Function) {
      return f(value, pattern || param.pattern);
   }
   return value;
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

// FIXME:
function fixRssText(str) {
   var re = new RegExp("<img src\\s*=\\s*\"?([^\\s\"]+)?\"?[^>]*?(alt\\s*=\\s*\"?([^\"]+)?\"?[^>]*?)?>", "gi");
   str = str.replace(re, "[<a href=\"$1\" title=\"$3\">Image</a>]");
   return str;
}

// FIXME:
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

// FIXME:
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

// FIXME:
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

// FIXME: Rewrite using jala.ListRenderer?
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

var wait = function(millis) {
   millis || (millis = Date.ONESECOND);
   var now = new Date;
   while (new Date - now < millis) {
      void null;
   }
   return;
}
