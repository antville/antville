// The Antville Project
// http://code.google.com/p/antville
//
// Copyright 2001–2014 by the Workers of Antville.
//
// Licensed under the Apache License, Version 2.0 (the ``License'');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an ``AS IS'' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileOverview Defines global variables and functions.
 */

String.ELLIPSIS = '…';

app.addRepository(app.dir + '/../lib/jdom-1.0.jar');
app.addRepository(app.dir + '/../lib/rome-1.0.jar');
app.addRepository(app.dir + '/../lib/lesscss-1.7.0.1.1.jar');

app.addRepository('modules/core/Global.js');
app.addRepository('modules/core/HopObject.js');
app.addRepository('modules/core/Filters.js');
app.addRepository('modules/core/JSON');
app.addRepository('modules/core/Number.js');

app.addRepository('modules/helma/File');
app.addRepository('modules/helma/Image.js');
app.addRepository('modules/helma/Html.js');
app.addRepository('modules/helma/Http.js');
app.addRepository('modules/helma/Mail.js');
app.addRepository('modules/helma/Zip.js');

app.addRepository('modules/jala/code/Date.js');
app.addRepository('modules/jala/code/HopObject.js');
app.addRepository('modules/jala/code/ListRenderer.js');
app.addRepository('modules/jala/code/Utilities.js');

// Adding i18n message files as repositories
(function() {
   var dir = new helma.File(app.dir, '../i18n');
   for each (let fname in dir.list()) {
     fname.endsWith('.js') && app.addRepository(app.dir + '/../i18n/' + fname);
   }
})();
// I18n.js needs to be added *after* the message files or the translations get lost
app.addRepository('modules/jala/code/I18n.js');

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
 * In-memory registry of Claustra instances.
 * Claustra are defined in the “claustra” dir.
 * @name app.data.claustra
 * @type Array
 */
app.data.claustra || (app.data.claustra = []);
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
    app.debug('Flushing mail queue, sending ' +
        app.data.mails.length + ' messages');
    var mail;
    while (app.data.mails.length > 0) {
      mail = app.data.mails.pop();
      mail.send();
      if (mail.status > 0) {
        app.debug('Error while sending e-mail (status ' + mail.status + ')');
        mail.writeToFile(getProperty('smtp.dir'));
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
var SQLDATEFORMAT = 'yyyy-MM-dd HH:mm:ss';

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
var lessParser = {
  parse: function(lessCode, callback) {
    var less = new Packages.org.lesscss.LessCompiler();
    try {
      callback(null, {
        toCSS: function() {
          return less.compile(lessCode);
        }
      });
    } catch (error) {
      callback(error);
    }
  }
};

/**
 * A collection of Java classes and namespaces required for parsing and generating RSS.
 * @type Object
 */
var rome = new JavaImporter(
  Packages.com.sun.syndication.io,
  Packages.com.sun.syndication.feed.synd
);

var marked = require('marked/lib/marked');
var sanitizeHtml = require('sanitize-html/dist/sanitize-html');

/**
 * A simple and hackish implementation of the console instance of some browsers.
 * @namespace
 */
var console = function (type) {
  /**
   * Convenience method for bridging log output from the server to the client.
   * @methodOf console
   * @param {String} text This text will be displayed in the browser’s console (if available).
   */
  return function(text /*, text, … */) {
    var now = formatDate(new Date, 'yyyy/MM/dd HH:mm:ss');
    var argString = Array.prototype.join.call(arguments, String.SPACE);
    var shellColors = {
      debug: '\u001B[1;34m',
      error: '\u001B[1;97;101m',
      info: '\u001B[34m',
      log: '\u001B[90m',
      warn: '\u001B[1;103m'
    };

    var output = [
      shellColors[type],
      '[', now, '] ',
      '[', type.toUpperCase(), '] ',
      '[console] ',
      argString,
      '\u001B[0m'
    ];

    writeln(output.join(''));

    if (typeof res !== 'undefined') {
      res.debug('<script>console.' + type + '("%c%s", "font-style: italic;", ' +
          JSON.stringify(argString) + ');</script>');
    }
  }
};

console.log = console('log');
console.debug = console('debug');
console.info = console('info');
console.warn = console('warn');
console.error = console('error');

/**
 * The startup handler Helma is calling automatically shortly after the application has started.
 */
function onStart() {
  if (typeof root === 'undefined') {
    app.logger.error('Error in database configuration: no root site found.');
    return;
  }
  // Load add-ons aka claustra
  Claustra.load();
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
    name = arguments[i].toUpperCase().replace(/\s/g, '');
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
  return ctor.prototype[name + '_macro'] = idle;
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
  Admin.purgeAccounts();
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
  app.log('***** Running nightly scripts *****');
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
 * @param {String} _is_ Syntactic sugar; should be 'is' for legibility
 * @param {String} secondValue The second value
 * @param {String} _then_ Syntactic sugar; should be 'then' for legibility
 * @param {String} firstResult The first result, ie. the value that will be
 * returned if the first value equals the second one
 * @param {String} _else_ Syntactic sugar; should be 'else' for legibility
 * @param {String} secondResult The second result, ie. the value that will be
 * returned if the first value does not equal the second one
 * @returns {String} The resulting value
 */
function if_macro(param, firstValue, _is_, secondValue, _then_, firstResult,
    _else_, secondResult) {
  return (('' + firstValue) == ('' + secondValue)) ? firstResult : secondResult;
}

/**
 * Renders the current date and time.
 * @see formatDate
 * @param {Object} param The default Helma macro parameter object
 * @param {String} [format] A date format string
 * @returns {String} The formatted current date string
 */
var now_macro = function(param, format) {
  return formatDate(new Date, format || param.format);
};

/**
 * Renders a link.
 * @see renderLink
 * @returns {String} The rendered HTML link element
 */
function link_macro() {
  return renderLink.apply(this, arguments);
}

/**
 *
 * @param {Object} param
 * @param {HopObject} object
 */
function count_macro(param, object) {
  if (object && object.size && object.size instanceof Function) {
    res.write(object.size());
  }
  return;
}

/**
 * Renders a skin from within a skin.
 * @see HopObject#skin_macro
 * @returns {String} The rendered skin
 */
// FIXME: The definition with 'var' is necessary; otherwise the skin_macro()
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
  delimiter || (delimiter = param.separator || ' : ');
  //html.link({href: res.handlers.site.href()}, res.handlers.site.getTitle());
  var offset = res.handlers.site === root ? 1 : 2;
  for (var item, title, i=offset; i<path.length; i+=1) {
    if (item = path[i]) {
      if (!isNaN(item._id) && item.constructor !== Layout) {
        continue;
      }
      if (i === path.length-1 && req.action === 'main') {
        res.write(item.getTitle());
      } else {
        html.link({href: path[i].href()}, item.getTitle());
      }
      (i < path.length-1) && res.write(delimiter);
    }
  }
  if (req.action !== 'main') {
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

function username_macro() {
  res.write(session.user ? session.user.name : '');
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
  var story = HopObject.getFromPath(id, 'stories');
  if (!story || !story.getPermission('main')) {
    return;
  }

  switch (mode) {
    case 'url':
    res.write(story.href());
    break;
    case 'link':
    html.link({href: story.href()}, param.text || story.getTitle());
    break;
    default:
    var skin = param.skin ? 'Story#' + param.skin : '$Story#embed';
    story.renderSkin(skin);
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
  if (id.startsWith('/')) {
    name = id.substring(1);
    if (mode === 'url') {
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
      File.prototype.renderSkin('File#main');
    }
    return;
  }

  file = HopObject.getFromPath(id, 'files');

  if (!file) {
     if (res.contentType === 'text/html' && !id.contains('/')) {
      res.handlers.site.link_macro({
        'class': 'uk-icon-button uk-icon-file-o',
        'data-uk-tooltip': "{pos: 'right'}",
        title: gettext('Create missing file'),
      }, 'files/create?name=' + encodeURIComponent(id), ' ');
    }
    return;
  }

  if (mode === 'url') {
    res.write(file.getUrl());
  } else {
    if (mode === 'player') {
      param.skin = file.contentType.split('/')[0];
    }
    file.renderSkin('File#' + (param.skin || 'main'));
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
  if (id.startsWith('/')) {
    var name = id.substring(1);
    image = Images.Default[name] || Images.Default[name + '.gif'];
  } else {
    image = HopObject.getFromPath(id, 'images');
  }

  if (!image && param.fallback) {
    image = HopObject.getFromPath(param.fallback, 'images');
  }

  if (!image) {
     if (res.contentType === 'text/html' && !id.contains('/')) {
      res.handlers.site.link_macro({
        'class': 'uk-icon-button uk-icon-picture-o',
        'data-uk-tooltip': "{pos: 'right'}",
        title: gettext('Create missing image'),
      }, 'images/create?name=' + encodeURIComponent(id), ' ');
    }
    return;
  }

  switch (mode) {
    case 'url':
    res.write(image.getUrl());
    break;
    case 'thumbnail':
    case 'popup':
    var url = param.link || image.getUrl();
    html.openTag('a', {href: url});
    // FIXME: Bloody popups belong to compatibility layer
    if (mode === 'popup') {
      param.onclick = 'javascript: openPopup(\'' + url + '\', ' + image.width + ', ' + image.height + '); return false;';
    }
    image.thumbnail_macro(param);
    html.closeTag('a');
    break;
    case 'box':
    // Default Images do not provide the renderSkin() method
    if (image.renderSkin) {
      if (!param.link) param.link = image.getUrl();
      image.renderSkin(param.skin || '$Image#embed', param);
    }
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

  var poll = HopObject.getFromPath(id, 'polls');
  if (!poll) {
    return;
  }

  switch (mode) {
    case 'url':
    res.write(poll.href());
    break;
    case 'link':
    html.link({
      href: poll.href(poll.status === Poll.CLOSED ? 'result' : '')
    }, poll.question);
    break;
    default:
    poll.renderSkin('$Poll#embed');
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

  var skin, collection;
  var max = Math.min(limit || 25, 100);

  if (id === 'sites') {
    collection = root.sites.list(0, max);
    skin = 'Site#preview';
  } else if (id === 'updates') {
    collection = root.updates.list(0, max).map(function (site) {
      return site.stories.union.get(0);
    });
    skin = 'Story#preview';
  } else {
    var site, type;
    var parts = id.split('/');
    if (parts.length > 1) {
      type = parts[1];
      site = root.sites.get(parts[0]);
    } else {
      type = parts[0];
    }

    site || (site = res.handlers.site);
    var filter = function(item, index) {
      return index < max && item.getPermission('main');
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
      case 'comments':
      if (site.commentMode !== Site.DISABLED) {
        var comments = site.stories.comments;
        collection = comments.list().filter(filter);
        skin = 'Story#preview';
      }
      break;

      case 'featured':
      collection = site.stories.featured.list(0, max);
      skin = 'Story#preview';
      break;

      case 'images':
      collection = site.images.list(0, max);
      skin = 'Image#preview';
      break;

      case 'macros':
      res.handlers.site.stories.renderSkin('$Stories#macros');
      return;

      case 'postings':
      var content = site.stories.union;
      collection = content.list().filter(filter).filter(function(item) {
        if (item.constructor === Comment) {
          return commentFilter(item);
        }
        return true;
      });
      skin = 'Story#preview';
      break;

      case 'stories':
      var stories = site.stories.recent;
      var counter = 0;
      collection = stories.list().filter(function(item, index) {
        return item.constructor === Story && filter(item, counter++);
      });
      skin = 'Story#preview';
      break;

      case 'tags':
      return site.tags.list_macro(param, param.skin || '$Tag#preview');
      break;

      default:
      break;
    }
  }
  for each (var item in collection) {
    item && item.renderSkin(param.skin || skin);
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
  if (!name) return;
  if (!res.meta.values) res.meta.values = {};
  name = name.toLowerCase();
  if (!value) return res.meta.values[name];
  res.meta.values[name] = value;
  return;
}

function href_macro(param) {
  var href = path.href(req.action === 'main' ? String.EMPTY : req.action);
  if (!href.startsWith('http')) {
    href = req.servletRequest.rootURL + href;
  }
  return res.write(href);
}

/**
 * Renders either a skin or the URL of a random site, story or image.
 * The corresponding story and image collections will be retrieved either from res.handlers.site or
 * from the prefixed “type” argument (e.g. “mySite/story”).
 * Furthermore, both collections can be reduced to a specific tag or gallery, resp.
 * @param {Object} param The default Helma macro parameter object.
 * @param {String} [param.skin = 'preview'] The name of the skin to render in default output mode.
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

  if (type === 'site') {
    site = root.sites.get(getRandom(root.sites.size()));
    mode === 'url' ? res.write(site.href()) :
        site.renderSkin(param.skin || 'Site#preview');
    return;
  }

  var parts = type.split('/');
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
    case 'story':
    case 'stories':
    var stories = param.tag ? site.stories.tags.get(param.tag) :
        site.stories.featured;
    var story = stories && stories.get(getRandom(stories.size()));
    if (story) {
      param.tag && (story = story.tagged);
      mode === 'url' ? res.write(story.href()) :
          story.renderSkin(param.skin || 'Story#preview');
    }
    break;

    case 'image':
    case 'images':
    var images = param.gallery ? site.images.galleries.get(param.gallery) :
        site.images;
    var image = images && images.get(getRandom(images.size()));
    if (image) {
      param.gallery && (image = image.tagged);
      mode === 'url' ? res.write(image.href()) :
          image.renderSkin(param.skin || 'Image#preview');
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
  var result = version[type || 'default'];
  return result || version;
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
  return value.getAge();
}

/**
 * Helma macro filter wrapping the {@link Date#getExpiry} method.
 * @see Date#getExpiry
 * @param {Date} value The original date.
 * @param {Object} param The default Helma macro parameter object.
 * @returns {String} The resulting expiry string of the original date.
 */
function expiry_filter(value, param) {
  if (!value || value.constructor !== Date) {
    return value;
  }
  return value.getExpiry();
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
 * @param {String} pattern A formatting pattern suitable for the formatting fmethod.
 * @param {String} [type] Deprecated.
 * @returns {String} The formatted string.
 */
function format_filter(value, param, pattern, type) {
  if (!value && value !== 0) {
    return;
  }
  if (type) {
    var Ctor = global[type.titleize()];
    if (Ctor) value = new Ctor(value);
  } else {
    type = value.constructor.name;
  }
  var format = global['format' + type.titleize()];
  if (format && format.constructor === Function) {
    return format(value, pattern || param.pattern);
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
  if (!input && param['default'] === null) {
    return ngettext('({0} character)', '({0} characters)', len);
  }
  limit || (limit = 20);
  clipping || (clipping = String.ELLIPSIS);
  delimiter || (delimiter = '\\s');
  return String(input || '').head(limit, clipping, delimiter);
}

function json_filter(value, param) {
  return JSON.stringify(value);
}

function script_filter(value, param) {
  // Remove <script> element and comments (order in brackets is crucial)
  return value.replace(/\s*(?:<!--|-->|<\/?script[^>]*>)\s*/g, String.EMPTY);
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
  if (url === '.' || url === 'main') {
    url = String.EMPTY;
  }
  delete param.url;
  delete param.text;
  param.title || (param.title = String.EMPTY);
  if (!handler || url.contains(':')) {
    param.href = url;
  } else if (url.contains('/') || url.contains('?') || url.contains('#')) {
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
      return 'mailto:' + str;
    } else {
      return null;
    }
  }
  return null;
}

/**
 * Surrounds a string by programmer quotes (like 'foo').
 * @param {String} str The original string.
 * @param {String|RegExp} pattern A pattern for conditional quotes; e.g. '\\s' will make the function only add quotes when the original string contains whitespace.
 * @returns {String} The processed string.
 */
function quote(str, pattern) {
  str = String(str);
  if (!pattern || RegExp(pattern).test(str) || /['"]/.test(str)) {
    str = "'" + str.replace(/("|')/g, '\\$1') + "'";
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
 * @param {String} [format = 'full'] The formatting string. Either a {@link http://docs.oracle.com/javase/6/docs/api/java/text/SimpleDateFormat.html Java SimpleDateFormat pattern} or of “short”, “medium”, “long”, “full”, “date”, “time”, “iso” or “text”.
 * @returns {String} The formatted date string.
 */
function formatDate(date, format) {
  if (!date) return null;

  var pattern;
  var site = res.handlers.site;
  var locale = site ? site.getLocale() : null;
  var timezone = site ? site.getTimeZone() : null;

  const getExpiry = diff => {
    let text;
    if (diff < Date.ONEMINUTE) {
      text = gettext('soon');
    } else if (diff < Date.ONEHOUR) {
      text = ngettext('in {0} minute', 'in {0} minutes', Math.round(diff / Date.ONEMINUTE));
    } else if (diff < Date.ONEDAY) {
      text = ngettext('in {0} hour', 'in {0} hours', Math.round(diff / Date.ONEHOUR));
    } else if (diff < 2 * Date.ONEDAY) {
      text = gettext('tomorrow');
    } else if (diff < 7 * Date.ONEDAY) {
      text = ngettext('in {0} day', 'in {0} days', Math.round(diff / Date.ONEDAY));
    } else if (diff < 30 * Date.ONEDAY) {
      text = ngettext('in {0} week', 'in {0} weeks', Math.round(diff / 7 / Date.ONEDAY));
    } else if (diff < 365 * Date.ONEDAY) {
      text = ngettext('in {0} month', 'in {0} months', Math.round(diff / 30 / Date.ONEDAY));
    } else {
      text = ngettext('in {0} year', 'in {0} years', Math.round(diff / 365 / Date.ONEDAY));
    }
    return text;
  };

  switch (format) {
    case null:
    case undefined:
    format = 'full'; // Caution! Passing through to next case block!
    case 'short':
    case 'medium':
    case 'long':
    case 'full':
    var type = java.text.DateFormat[format.toUpperCase()];
    pattern = java.text.DateFormat.getDateTimeInstance(type, type, locale).toPattern();
    break;

    case 'date':
    var type = java.text.DateFormat.FULL
    pattern = java.text.DateFormat.getDateInstance(type, locale).toPattern();
    break;

    case 'time':
    var type = java.text.DateFormat.SHORT;
    pattern = java.text.DateFormat.getTimeInstance(type, locale).toPattern();
    break;

    case 'iso':
    pattern = Date.ISOFORMAT;
    break;

    case 'text':
    var text;
    var now = new Date;
    var diff = now - date;

    if (diff < 0) {
      text = getExpiry(-diff);
    } else if (diff < Date.ONEMINUTE) {
      text = gettext('right now');
    } else if (diff < Date.ONEHOUR) {
      text = ngettext('{0} minute ago', '{0} minutes ago', Math.round(diff / Date.ONEMINUTE));
    } else if (diff < Date.ONEDAY) {
      text = ngettext('{0} hour ago', '{0} hours ago', Math.round(diff / Date.ONEHOUR));
    } else if (diff < 2 * Date.ONEDAY) {
      text = gettext('yesterday');
    } else if (diff < 7 * Date.ONEDAY) {
      text = ngettext('{0} day ago', '{0} days ago', Math.round(diff / Date.ONEDAY));
    } else if (diff < 30 * Date.ONEDAY) {
      text = ngettext('{0} week ago', '{0} weeks ago', Math.round(diff / 7 / Date.ONEDAY));
    } else if (diff < 365 * Date.ONEDAY) {
      text = ngettext('{0} month ago', '{0} months ago', Math.round(diff / 30 / Date.ONEDAY));
    } else {
      text = ngettext('{0} year ago', '{0} years ago', Math.round(diff / 365 / Date.ONEDAY));
    }
    return text.replace(/(\d+)\s+/, '$1\xa0'); // Add a no-break space after first digits

    case 'expiry':
    return getExpiry(date - new Date());

    default:
    pattern = format;
  }

  try {
    return date.format(pattern, locale, timezone);
  } catch (ex) {
    return '[Invalid date format]';
  }

  return String.EMPTY;
}

/**
 * Injects the XSLT stylesheet declaration into an XML string until Mozilla developers will have mercy.
 * FIXME: Obsolete?
 * @param {String} xml An XML string
 * @returns {String} An XML string containing the XSLT stylesheet declaration
 */
function injectXslDeclaration(xml) {
  res.push();
  renderSkin('Global#xslDeclaration');
  return xml.replace(/(\?>\r?\n?)/, '$1' + res.pop());
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
    throw Error('Insufficient arguments in method sendMail()');
  }
  var mail = new helma.Mail(getProperty('smtp', 'localhost'),
      getProperty('smtp.port', '25'));
  mail.setFrom(root.replyTo || 'root@localhost');
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
    mail.addText(renderSkinAsString('$Global#mailFooter'));
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
  return new java.util.Locale(language || 'english');
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
    if (localeString && !localeString.contains('_')) {
      var isTranslated = jala.i18n.getCatalog(jala.i18n.getLocale(localeString));
      result.push({
        value: localeString,
        display: (isTranslated ? String.EMPTY : '⚠︎ ') + locale.getDisplayName(locale),
        'class': isTranslated ? String.EMPTY : 'av-locale-needs-translation'
      });
    }
  }
  // TODO: Automatically integrate gendered german language
  /*
  var builder = java.util.Locale.Builder();
  var locale1 = new java.util.Locale('de__#x-male');
  var locale2 = builder.setLanguage('de')
    .setExtension('x', 'male')
    .build();
  var locale3 = java.util.Locale.forLanguageTag(this.locale);
  var locale = locale3;
  console.log(java.lang.System.getProperty('java.version'));
  console.log(locale, locale.language, locale.toLanguageTag());
  */
  result.push({
    value: 'de-x-male',
    display: 'Deutsch ♂'
  });
  result.sort(new String.Sorter('display'));
  return result;
};

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
    if (id.length < 4 || !id.contains('/') ||
        id.startsWith('Etc') || id.startsWith('System')) {
      continue;
    }
    let timeZone = java.util.TimeZone.getTimeZone(id);
    // Exclude more confusing time zones
    if (timeZone.getDisplayName().startsWith('GMT')) {
      continue;
    }
    result.push({
      value: timeZone.getID(),
      display: timeZone.getID().replace(/_/g, String.SPACE)
    })
    timeZones.push(timeZone);
  }

  return result.sort(new String.Sorter('display'));
}

// FIXME:
/**
 * Replaces <img> elements in a string with <a> elements to fix RSS output which is not capable of displaying images.
 * @param {String} rss The original RSS output.
 * @returns {String} The transformed RSS output.
 */
function fixRssText(rss) {
  var re = new RegExp('<img src\\s*=\\s*\'?([^\\s\']+)?\'?[^>]*?(alt\\s*=\\s*\'?([^\']+)?\'?[^>]*?)?>', 'gi');
  rss = rss.replace(re, '[<a href=\'$1\' title=\'$3\'>Image</a>]');
  return rss;
}

// FIXME:
/**
 * @ignore
 * @param {Object} src
 */
function doWikiStuff (src) {
  // robert, disabled: didn't get the reason for this:
  // var src= ' '+src;
  if (src == null || !src.contains('<*'))
    return src;

  // do the Wiki link thing, <*asterisk style*>
  var regex = new RegExp ('<[*]([^*]+)[*]>');
  regex.ignoreCase=true;

  var text = '';
  var start = 0;
  while (true) {
    var found = regex.exec (src.substring(start));
    var to = found == null ? src.length : start + found.index;
    text += src.substring(start, to);
    if (found == null)
      break;
    var name = ''+(new java.lang.String (found[1])).trim();
    var item = res.handlers.site.topics.get (name);
    if (item == null && name.lastIndexOf('s') == name.length-1)
      item = res.handlers.site.topics.get (name.substring(0, name.length-1));
    if (item == null || !item.size())
      text += format(name)+' <small>[<a href=\''+res.handlers.site.stories.href('create')+'?topic='+escape(name)+'\'>define '+format(name)+'</a>]</small>';
    else
      text += '<a href=\''+item.href()+'\'>'+name+'</a>';
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
    var param = {'class': cssClass};
    param.text = text;
    if (url) {
      url += url.contains('?') ? '&' : '?';
      param.href = url + 'page=' + page;
    }
    renderSkin('$Global#pagerItem', param);
    return;
  }

  var maxItems = 5;
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
  param.display = ((pageIdx * itemsPerPage) + 1) + '-' +
      (Math.min((pageIdx * itemsPerPage) + itemsPerPage, size));
  param.total = size;

  // Render the navigation-bar
  res.push();
  if (pageIdx < 1) {
    param.prevClass = 'uk-disabled';
  } else {
    param.prevHref = '?page=' + (pageIdx - 1);
  }
  var offset = Math.floor(pageIdx / maxItems) * maxItems;
  (offset > 0) && renderItem(String.ELLIPSIS, 'pageNavItem', url, offset-1);
  var currPage = offset;
  var stop = Math.min(currPage + maxItems, lastPageIdx+1);
  while (currPage < stop) {
    if (currPage === pageIdx) {
      renderItem(currPage + 1, 'uk-active');
    } else {
      renderItem(currPage + 1, 'pageNavItem', url, currPage);
    }
    currPage += 1;
  }
  if (currPage < lastPageIdx) {
    renderItem(String.ELLIPSIS, 'pageNavItem', url, offset + maxItems);
  }
  if (pageIdx >= lastPageIdx) {
    param.nextClass = 'uk-disabled';
  } else {
    param.nextHref = '?page=' + (pageIdx + 1);
  }
  param.pager = res.pop();
  return renderSkinAsString('$Global#pager', param);
}

/**
 * Transforms an english plural form of a noun into its singular form.
 * @param {String} plural The noun in plural form.
 * @returns {String} The english singular form of the original input.
 */
function singularize(plural) {
  if (plural.endsWith('ies')) {
    return plural.substring(0, plural.length-3) + 'y';
  }
  return plural.substring(0, plural.length-1);
}

/**
 * Transforms an english singular form of a noun into its plural form.
 * @param {String} singular The noun in singular form.
 * @returns {String} The english plural form of the original input.
 */
function pluralize(singular) {
  if (singular.endsWith('y')) {
    return singular.substring(0, singular.length-1) + 'ies';
  }
  return singular + 's';
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

function getLinkCount(item) {
  var content;
  switch (item.constructor) {
    case Comment:
    case Story:
    content = item.title || '' + item.text || '';
    break;

    default:
    content = String(item);
  }
  return (content.match(/https?:\/\//g) || []).length;
}

function getHrefScheme() {
  return getProperty('hrefScheme', 'http') + '://';
}
