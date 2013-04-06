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

// Adding i18n message files as repositories
(function() {
    var dir = new helma.File(app.dir, "../i18n");
    for each (let fname in dir.list()) {
       fname.endsWith(".js") && app.addRepository(app.dir + "/../i18n/" + fname);
    }
})();
// I18n.js needs to be added *after* the message files or the translations get lost
app.addRepository("modules/jala/code/I18n.js");

// FIXME: Be careful with property names of app.data;
// they inherit all properties from HopObject!
/**
 * Helma’s built-in application-wide in-memory store.
 * @name app.data
 * @namespace
 */
/** 
 * Temporary in-memory store of site callbacks. 
 * They will be invoked asynchronously by an Admin method.
 * @see Admin.invokeCallbacks 
 * @see scheduler
 * @name app.data.callbacks
 */
app.data.callbacks || (app.data.callbacks = []);
/** 
 * Temporary in-memory store of LogEntry instances.
 * They will be made persistent asynchronously by an Admin method.
 * @see Admin.commitEntries
 * @see scheduler
 * @name app.data.entries
 * @type Array
 */
app.data.entries || (app.data.entries = []);
/** 
 * In-memory registry of Feature instances. 
 * Features are defined in the “extra” dir.
 * @name app.data.features
 * @type Array
 */
app.data.features || (app.data.features = []);
/** 
 * In-memory e-mail message queue.
 * They will be sent asynchronously by an Admin method.
 * @see helma.mail.flushQueue
 * @see scheduler
 * @name app.data.mails
 * @type Array
 */
app.data.mails || (app.data.mails = []);
/** 
 * In-memory store of remote requests for counting story hits.
 * They will be made persistent asynchronously by an Admin method.
 * @see Admin.commitRequests
 * @see scheduler
 * @name app.data.requests 
 * @type Array
 */
app.data.requests || (app.data.requests = {});

/**
 * The helma.File prototype is defined as a module.
 * @name helma.File
 * @namespace
 */
/**
 * Helper method for recursively copying a directory and its files.
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
 * The helma.Mail prototype is defined in a module.
 * @name helma.Mail
 * @namespace
 */
/**
 * Add an e-mail message to the mail queue for later sending.
 * @see app.data.mails
 * @returns {Number} The number of mails waiting in the queue
 */
helma.Mail.prototype.queue = function() {
   return app.data.mails.push(this);
}

/**
 * Try to send and remove every mail instance collected in the mail queue.
 * @see app.data.mails
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

/**
 * The jala.i18n namespace is defined in a module.
 * @name jala.i18n
 * @namespace
 */
jala.i18n.setLocaleGetter(function() {
   return (res.handlers.site || root).getLocale();
});

/** 
 * The date format used in SQL queries and commands.
 * @constant 
 * @type String
 */
var SQLDATEFORMAT = "yyyy-MM-dd HH:mm:ss";

/** 
 * Regular Expression according to Jala’s HopObject.getAccessName().
 * @constant 
 * @type RegExp
 */
var NAMEPATTERN = /[\/+\\]/;

/** 
 * Shortcut for a function with empty body.
 * Used e.g. in the disableMacro() method.
 * @see disableMacro
 * @function 
 */
var idle = new Function;

/**
 * An instance of Helma’s HTML rendering module.
 * @type helma.Html
 */
var html = new helma.Html();

/** 
 * An instance of the LESS parser.
 * @type less.Parser
 */
var lessParser = new less.Parser();

/**
 * A collection of Java classes and namespaces required for parsing and generating RSS.
 * @type Object
 */
var rome = new JavaImporter(
   Packages.com.sun.syndication.io,
   Packages.com.sun.syndication.feed.synd,
   Packages.com.sun.syndication.feed.module.itunes,
   Packages.com.sun.syndication.feed.module.itunes.types
);

/** 
 * A simple and hackish implementation of the console instance of some browsers.
 * @namespace
 */
var console = {
   /**
    * Convenience method for bridging log output from the server to the client.
    * @methodOf console
    * @param {String} text This text will be displayed in the browser’s console (if available).
    */
   log: function(text /*, text, … */) {
      if (!res.meta.__console__) {
         res.debug('<style>.helma-debug-line {border: none !important;}</style>');            
         res.meta.__console__ = true;
      }
      var now = formatDate(new Date, Date.ISOFORMAT);
      Array.prototype.unshift.call(arguments, '[Helma]', now, '===>');
      var text = Array.prototype.join.call(arguments, ' ');
      text = text.replace(/(?:\n|\r)/g, '\\n').replace(/('|")/g, '\\$1');
      res.debug('<script>console.log("' + text + '")</script>');
   }
}

/**
 * The startup handler Helma is calling automatically shortly after the application has started.
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
 * This handler is called by Helma automatically before the application is stopped.
 */
function onStop() { /* Currently empty, just to avoid annoying log message */ }

/**
 * Helper method to simultaneously define constants and a corresponding array of localized display names.
 * @param {HopObject} ctor The desired prototype constructor the constants should be defined for.
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
 * Disables a macro with the idle() function.
 * @see idle
 * @param {HopObject} ctor The prototype constructor the macro is defined for
 * @param {String} name The macro’s name
 * @returns {Function}
 */
function disableMacro(ctor, name) {
   return ctor.prototype[name + "_macro"] = idle;
}

/**
 * Helma’s built-in main scheduler function.
 * This method is regularly called by Helma after a defined period of time.
 * The period is either defined by the return value or by the schedulerInterval property in app.properties.
 * @returns {Number} The period in milliseconds the scheduler will be called again. 
 */
function scheduler() {
   helma.Mail.flushQueue();
   Admin.commitEntries();
   Admin.commitRequests();
   Admin.invokeCallbacks();
   Admin.updateDomains();
   Admin.updateHealth();
   Admin.purgeSites();
   return app.properties.schedulerInterval;
}

/**
 * The nightly scheduler. 
 * This method is called according to the cron settings in app.properties.
 */
function nightly() {
   var now = new Date;
   if (now - (global.nightly.lastRun || -Infinity) < Date.ONEMINUTE) {
      return; // Avoid running twice when main scheduler runs more than once per minute
   }
   app.log("***** Running nightly scripts *****");
   Admin.purgeReferrers();
   Admin.dequeue();
   global.nightly.lastRun = now;
   return;
}

/**
 * Renders a string depending on the comparison of two values. 
 * If the first value equals the second value, the first result will be returned; the second result otherwise.
 * @example <% if <% macro %> is value then <% yes suffix=! %> else 'no :(' %>;
 * Note that any value or result can be a macro, too. Thus, this can be used as
 * a simple implementation of an if-then-else statement by using Helma macros only. 
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
 * Renders the current date and time.
 * @see formatDate
 * @param {Object} param The default Helma macro parameter object
 * @param {String} [format] A date format string
 * @returns {String} The formatted current date string
 */
function now_macro(param, format) {
   return formatDate(new Date, format || param.format);
}

/**
 * Renders a link.
 * @see renderLink
 * @returns {String} The rendered HTML link element
 */
function link_macro() {
   return renderLink.apply(this, arguments);
}

/**
 * Renders a skin from within a skin.
 * @see HopObject#skin_macro
 * @returns {String} The rendered skin
 */
// FIXME: The definition with "var" is necessary; otherwise the skin_macro()
// method won't be overwritten reliably. (Looks like a Helma bug.)
var skin_macro = function(param, name) {
  return HopObject.prototype.skin_macro.apply(this, arguments);
}

/**
 * Renders a breadcrumbs navigation from the current HopObject path.
 * @param {Object} param The default Helma macro parameter object
 * @param {String} [delimiter=' : '] The string visually separating two navigation items
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
 * @returns {Boolean}
 */
function user_macro() {
   return !!session.user;
}

/**
 * Renders the URL of, a link to or an arbitrary skin of a story.
 * @param {Object} param The default Helma macro parameter object
 * @param {String} [param.skin='embed'] The name of a story skin
 * @param {String} id The id or path of the desired story
 * @param {String} [mode] Either of 'url' or 'link'
 * @example <% story 1810 skin=preview %> Story #1810 in preview skin
 * <% story blog/1971 url %> URL of the story of site “blog”
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
 * Renders the URL or an arbitrary skin of a file.
 * @param {Object} param The default Helma macro parameter object
 * @param {String} [param.skin='main'] The name of a file skin
 * @param {String} id The id or path of the desired file
 * @param {String} [mode] Currently only possible value is 'url'
 * @example <% file 1810 url %> URL of file #1810
 * <% file blog/text.pdf skin=preview %> File in site “blog” using preview skin
 * <% file /image.raw %> Static file of root site
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
      file.renderSkin("File#" + (param.skin || "main"));
   }
   return;
}

/**
 * Renders the URL, a thumbnail or an HTML element of an image.
 * @see Image#thumbnail_macro
 * @see Image#render_macro
 * @param {Object} param The default Helma macro parameter object
 * @param {String} id The id or path of the desired image
 * @param {String} [mode] Either of 'url' or 'thumbnail'
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
      // FIXME: Could fallback be replaced with CSS background-image?
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
 * Renders the URL, a link or the visual representation of a poll.
 * @param {Object} param The default Helma macro parameter object
 * @param {String} id The id or path of the desired poll
 * @param {String} mode Either of 'url' or 'link'
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
 * The “swiss army knife” list macro. Lists collections of HopObjects.
 * There is hardly a thing it cannot do… but it’s kind of messy, though.
 * @param {Object} param The default Helma macro parameter object
 * @param {String} [param.skin=preview] The name of a skin suitable for the collection 
 * @param {String} id The identifier of the desired collection 
 * @param {Number} [limit=25] The maximum amount of items listed
 * @example <% list sites %>
 * <% list updates 10 %>
 * <% list blog/comments %>
 * <% list featured skin=promotion %>
 * <% list images %>
 * <% list postings %>
 * <% list stories %>
 * <% list tags %>
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
         prototype = "Story#preview";
         break;
         
         case "images":
         collection = site.images.list(0, max);
         prototype = "Image#preview";
         break;
         
         case "postings":
         content = site.stories.union;
         collection = content.list().filter(filter).filter(function(item) {
            if (item.constructor === Comment) {
               return commentFilter(item);
            }
            return true;
         });
         prototype = "Story#preview";
         break;
         
         case "stories":
         var stories = site.stories.recent;
         var counter = 0;
         collection = stories.list().filter(function(item, index) {
            return item.constructor === Story && filter(item, counter++);
         });
         prototype = "Story#preview";
         break;
         
         case "tags":
         return site.tags.list_macro(param, param.skin || "$Tag#preview");
         break;
         
         default:
         break;
      }
   }
   for each (var item in collection) {
      item.renderSkin(param.skin || skin);
   }
   return;
}

/**
 * Defines and renders a value.
 * This works like a variable that can be set in one skin and rendered in another –
 * which must be rendered later than the one setting the variable.
 * @param {Object} param The default Helma macro parameter object.
 * @param {String} name The name of the value.
 * @param {String} [value] The desired value. 
 * If no value is given, the current value will be rendered.
 * @example <% value foo=bar %> Defines res.meta.values.foo = bar
 * @example <% value foo %> Renders the value of res.meta.value.foo
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
 * Renders either a skin or the URL of a random site, story or image.
 * The corresponding story and image collections will be retrieved either from res.handlers.site or 
 * from the prefixed “type” argument (e.g. “mySite/story”).
 * Furthermore, both collections can be reduced to a specific tag or gallery, resp.
 * @param {Object} param The default Helma macro parameter object.
 * @param {String} [param.skin = "preview"] The name of the skin to render in default output mode.
 * @param {String} [param.tag] Reduce the story collection to stories with the specified tag.
 * @param {String} [param.gallery] Reduce the image collection to images from the specified gallery.
 * @param {String} type The type of object to render. Either of “site”, “story” or “image”.
 * It can be prepended by a site name delimited by a slash: “mySite/image”.
 * @param {String} [mode] Set the output mode. Currently, only “url” is supported.
 * @example <% random site skin=preview %> Renders the preview skin of a random site.
 * <% random story tag=essay url %> Renders the URL of a random story tagged with “essay”.
 * <% random foo/image gallery=cat %> Renders the default skin of a random image in the gallery “cat“ of the site “foo”.
 */
function random_macro(param, type, mode) {
   var getRandom = function(n) {
      return Math.floor(Math.random() * n);
   };

   var site = res.handlers.site;

   if (type === "site") {
      site = root.sites.get(getRandom(root.sites.size()));
      mode === 'url' ? res.write(site.href()) : 
            site.renderSkin(param.skin || "Site#preview");
      return;
   }

   var parts = type.split("/");
   if (parts.length > 1) {
      site = root.sites.get(parts[0] || 'www');
      type = parts[1];
   } else {
      type = parts[0];
   }

   if (!site) {
      return;
   }

   switch (type) {
      case "story":
      case "stories":
      var stories = param.tag ? site.stories.tags.get(param.tag) : 
            site.stories.featured;
      var story = stories && stories.get(getRandom(stories.size()));
      if (story) {
         param.tag && (story = story.tagged);
         mode === 'url' ? res.write(story.href()) : 
               story.renderSkin(param.skin || "Story#preview");
      }
      break;

      case "image":
      case "images":
      var images = param.gallery ? site.images.galleries.get(param.gallery) : 
            site.images;
      var image = images && images.get(getRandom(images.size()));
      if (image) {
         param.gallery && (image = image.tagged);
         mode === 'url' ? res.write(image.href()) : 
               image.renderSkin(param.skin || "Image#preview");
      }
      break;
   }
   return;
}

/**
 * Renders the Antville version string.
 * @param {Object} param The default Helma macro parameter object.
 * @param {String} [type = 'default'] The type of version string.
 * @see Root.VERSION
 */
function version_macro(param, type) {
   var version = Root.VERSION;
   var result = version[type || "default"];
   return result || version;
}

/**
 * Renders a string vertically in the global listItemFlag skin.
 * @param {Object} param The default Helma macro parameter object.
 * @param {String} str The string to be rendered.
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
 * A simple Helma macro filter returning one of two possible values depending on which one is truthy.
 * @param {Object} value The original (desired) value.
 * @param {Object} param The default Helma macro parameter object.
 * @param {Object} defaultValue The fallback value for use if the original value should be untruthy.
 * @returns {Object} The value argument if truthy, the defaultValue argument otherwise.
 */
function default_filter(value, param, defaultValue) {
   return value || defaultValue;
}

/**
 * Helma macro filter wrapping the {@link Date#getAge} method.
 * @see Date#getAge
 * @param {Date} value The original date.
 * @param {Object} param The default Helma macro parameter object.
 * @returns {String} The resulting age string of the original date.
 */
function age_filter(value, param) {
   if (!value || value.constructor !== Date) {
      return value;
   }
   return value.getAge()
}

/**
 * Helma macro filter wrapping the {@link renderLink} method.
 * @param {String} text The link text.
 * @param {String} param The default Helma macro parameter object.
 * @param {Object} [url = text] The link URL.
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
 * Helma macro filter wrapping the global formatting methods.
 * @see formatNumber
 * @see formatDate
 * @param {Object} value The original value.
 * @param {Object} param The default Helma macro parameter object.
 * @param {String} pattern A formatting pattern suitable for the formatting method.
 * @param {String} [type] Deprecated.
 * @returns {String} The formatted string.
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
 * Macro filter for clipping output.
 * @param {String} input The original input.
 * @param {Object} param The default Helma macro parameter object.
 * @param {Number} [limit = 20] The maximum amount of text parts to be displayed.
 * @param {String} [clipping = '...'] The replacement for the clipped portions of the text.
 * @param {String} [delimiter = '\\s'] The regular expression string used to split the text into parts.
 * @returns {String} The clipped result.
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

/**
 * Renders an HTML <a> element from a URL or HopObject.
 * @see helma.Html#link
 * @see HopObject#link_macro
 * @param {Object} param The default Helma macro parameter object.
 * @param {String} [param.title] An optional link title for use in the “title” attribute.
 * @param {String} url A complete or partial URL string. Optional if “handler” is specified.
 * @param {String} [text] An optional link text. 
 * @param {HopObject} handler The HopObject used as base URL. Optional if “url” is specified.
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
 * Validates if a string is suitable for e-mail messaging.
 * @see String#isEmail
 * @param {String} str The string to be validated.
 * @returns {String|null} The e-mail string if valid, null otherwise.
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
 * Validates if a string is suitable for requesting a URL.
 * @param {String} str The string to be validated.
 * @returns {String|null} The URL string if valid, null otherwise.
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
 * Surrounds a string by programmer quotes (").
 * @param {String} str The original string.
 * @returns {String} The processed string.
 */
function quote(str) {
   if (/[\W\D]/.test(str)) {
      str = '"' + str + '"';
   }
   return str;
}

/**
 * Formats a number according to a pattern and the site’s locale setting.
 * @param {Number} number The original number.
 * @param {String} pattern The formatting pattern.
 * @returns {String} The formatted number string.
 */
function formatNumber(number, pattern) {
   return Number(number).format(pattern, res.handlers.site.getLocale());
}

/**
 * Formats a date according to a formatting string and the site’s locale and time zone. 
 * @param {Date} date The original date.
 * @param {String} [format = "full"] The formatting string. Either a {@link http://docs.oracle.com/javase/6/docs/api/java/text/SimpleDateFormat.html Java SimpleDateFormat pattern} or of “short”, “medium”, “long”, “full”, “date”, “time”, “iso” or “text”.
 * @returns {String} The formatted date string.
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
 * Injects the XSLT stylesheet declaration into an XML string until Mozilla developers will have mercy.
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
 * Retrieves the locale object from a language string.
 * @param {String} language The name of the language.
 * @returns {java.util.Locale} The corresponding locale object.
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
// FIXME:
/**
 * Replaces <img> elements in a string with <a> elements to fix RSS output which is not capable of displaying images.
 * @param {String} rss The original RSS output.
 * @returns {String} The transformed RSS output.
 */
function fixRssText(rss) {
   var re = new RegExp("<img src\\s*=\\s*\"?([^\\s\"]+)?\"?[^>]*?(alt\\s*=\\s*\"?([^\"]+)?\"?[^>]*?)?>", "gi");
   rss = rss.replace(re, "[<a href=\"$1\" title=\"$3\">Image</a>]");
   return rss;
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
 * Renders an HTML list from a HopObject collection or an array.
 * @param {HopObject|Array} collection The original collection of objects.
 * @param {Function|Skin} funcOrSkin A skin name or a rendering function.
 * @param {Number} itemsPerPage The amount of rendered items per page.
 * @param {Number} pageIdx The current page index.
 * @returns {String} The rendered list.
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
 * Renders the page navigation for a collection of HopObjects.
 * @param {HopObject|Array|Number} collectionOrSize A collection or just the size of a collection.
 * @param {String} url The base URL for rendering links.
 * @param {Number} itemsPerPage The amount of rendered items per page.
 * @param {Number} pageIdx The current page index.
 * @returns {String} The rendered page navigation.
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
 * Transforms an english plural form of a noun into its singular form.
 * @param {String} plural The noun in plural form.
 * @returns {String} The english singular form of the original input.
 */
function singularize(plural) {
   if (plural.endsWith("ies")) {
      return plural.substring(0, plural.length-3) + "y";
   }
   return plural.substring(0, plural.length-1);
}

/**
 * Transforms an english singular form of a noun into its plural form.
 * @param {String} singular The noun in singular form.
 * @returns {String} The english plural form of the original input.
 */
function pluralize(singular) {
   if (singular.endsWith("y")) {
      return singular.substring(0, singular.length-1) + "ies";
   }
   return singular + "s";
}

/**
 * Halts the execution of the thread for the specified amount of milliseconds.
 * Use only for debugging.
 * @param {Number} millis The amount of milliseconds.
 */
var wait = function(millis) {
   millis || (millis = Date.ONESECOND);
   var now = new Date;
   while (new Date - now < millis) {
      void null;
   }
   return;
}
