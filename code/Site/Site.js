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
 * @fileOverview Defines the Site prototype.
 */

markgettext('Site');
markgettext('site');
markgettext('a site // accusative');

this.handleMetadata('archiveMode');
this.handleMetadata('callbackMode');
this.handleMetadata('callbackUrl');
this.handleMetadata('closed');
this.handleMetadata('commentMode');
this.handleMetadata('configured');
this.handleMetadata('export');
this.handleMetadata('imageDimensionLimits');
this.handleMetadata('import_id');
this.handleMetadata('job');
this.handleMetadata('locale');
this.handleMetadata('notes');
this.handleMetadata('notificationMode');
this.handleMetadata('notified');
this.handleMetadata('pageSize');
this.handleMetadata('pageMode');
this.handleMetadata('robotsTxtMode');
this.handleMetadata('spamfilter');
this.handleMetadata('tagline');
this.handleMetadata('timeZone');
this.handleMetadata('title');
this.handleMetadata('trollFilter');

/**
 * @function
 * @returns {String[]}
 * @see defineConstants
 */
Site.getStatus = defineConstants(Site, markgettext('Deleted'), markgettext('Blocked'),
    markgettext('Regular'), markgettext('Trusted'));
/**
 * @function
 * @returns {String[]}
 * @see defineConstants
 */
Site.getModes = defineConstants(Site, markgettext('Closed'), markgettext('Restricted'),
    markgettext('Public'), markgettext('Open'));
/**
 * @function
 * @returns {String[]}
 * @see defineConstants
 */
Site.getPageModes = defineConstants(Site, markgettext('days')/*, markgettext('stories') */ );
/**
 * @function
 * @returns {String[]}
 * @see defineConstants
 */
Site.getCommentModes = defineConstants(Site, markgettext('disabled'),
    markgettext('enabled'));
/**
 * @function
 * @returns {String[]}
 * @see defineConstants
 */
Site.getArchiveModes = defineConstants(Site, markgettext('closed'),
    markgettext('public'));
/**
 * @function
 * @returns {String[]}
 * @see defineConstants
 */
Site.getNotificationModes = defineConstants(Site, markgettext('Nobody'),
    markgettext('Owner'), markgettext('Manager'), markgettext('Contributor'),
    markgettext('Subscriber'));
/**
 * @function
 * @returns {String[]}
 * @see defineConstants
 */
Site.getCallbackModes = defineConstants(Site, markgettext('disabled'),
    markgettext('enabled'));

Site.getRobotsTxtModes = defineConstants(Site, markgettext('relaxed'),
    markgettext('enforced'));

/**
 * @param {String} name A unique identifier also used in the URL of a site
 * @param {String} title An arbitrary string branding a site
 * @param {User} user
 */
Site.add = function(data, user) {
  HopObject.confirmConstructor(Site);

  var now = new Date;
  var user = user || session.user || {};
  var site = new Site;

  if (!data.name) {
    throw Error(gettext('Please enter a name for your new site.'));
  }

  if (data.name.length > 30) {
    throw Error(gettext('The chosen name is too long. Please enter a shorter one.'));
  }

  var name = stripTags(decodeURIComponent(data.name));
  if (name !== data.name || /[^\u00a0-\uffff\w\-]/.test(data.name)) {
    // We check if name can be used in vhost environment by allowing all Unicode characters
    // but only ASCII letters A—z, digits 0—9, the underscore “_” and the hyphen “-”.
    throw Error(gettext('Please avoid special characters or HTML code in the name field.'));
  } else if (name !== root.getAccessName(name)) {
    throw Error(gettext('There already is a site with this name.'));
  }

  site.name = java.net.IDN.toASCII.constructor === Function ?
      java.net.IDN.toASCII(name, java.net.IDN.ALLOW_UNASSIGNED) : name;
  site.title = data.title || name;

  site.map({
    configured: now,
    created: now,
    creator: user,
    robotsTxtMode: Site.RELAXED,
    modified: now,
    modifier: user,
    status: user.status === User.PRIVILEGED ? Site.TRUSTED : user.status,
    mode: Site.CLOSED,
    commentMode: Site.ENABLED,
    archiveMode: Site.PUBLIC,
    spamFilter: String.EMPTY,
    trollFilter: String.EMPTY
  });

  site.update(site);
  Layout.add(site);
  root.add(site);
  return site;
}

/**
 *
 * @param {Site} site
 */
Site.remove = function() {
  if (this.constructor !== Site || this === root) return;

  const sql = new Sql();
  const id = this._id;
  const dir = this.getStaticFile();

  app.log('Removing site #' + id);
  this.remove();
  root.cache.sites = null;

  sql.execute('delete from site where id = $0', id);

  sql.execute('delete from content where site_id = $0', id);
  sql.execute('delete from file where site_id = $0', id);
  sql.execute('delete from membership where site_id = $0', id);

  sql.execute("delete from image where parent_type = 'Site' and parent_id = $0", id);
  sql.execute("delete from metadata where parent_type = 'Site' and parent_id = $0", id);

  sql.execute('delete from skin where layout_id in (select id from layout where site_id = $0)', id);
  sql.execute('delete from layout where site_id = $0', id);

  sql.execute('delete from tag_hub where tag_id in (select id from tag where site_id = $0)', id);
  sql.execute('delete from tag where site_id = $0', id);

  let subQuery = 'select id from poll where site_id';
  sql.execute('delete from vote where choice_id in (select id from choice where poll_id in ($0 = $1))', subQuery, id);
  sql.execute('delete from choice where poll_id in ($0 = $1)', subQuery, id);
  sql.execute('delete from poll where site_id = $0', id);

  dir.removeDirectory();
};

/**
 *
 * @param {String} name
 * @returns {Site}
 */
Site.getByName = function(name) {
  return root.get(name);
}

/**
 *
 * @param {String} mode
 * @returns {Boolean}
 */
Site.require = function(mode) {
  var modes = [Site.CLOSED, Site.RESTRICTED, Site.PUBLIC, Site.OPEN];
  return modes.indexOf(res.handlers.site.mode) >= modes.indexOf(mode);
}

/**
 * A Site object is the basic container of Antville.
 * @name Site
 * @constructor
 * @property {Tag[]} $tags
 * @property {Archive} archive
 * @property {String} archiveMode The way the archive of a site is displayed
 * @property {String} commentMode The way comments of a site are displayed
 * @property {Date} created The date and time of site creation
 * @property {User} creator A reference to a user who created a site
 * @property {String} export
 * @property {Files} files
 * @property {Tags} galleries
 * @property {Images} images
 * @property {String} import_id
 * @property {String} job
 * @property {Layout} layout
 * @property {String} locale The place and language settings of a site
 * @property {Members} members
 * @property {Metadata} metadata
 * @property {String} mode The access level of a site
 * @property {Date} modified The date and time when a site was last modified
 * @property {User} modifier A reference to a user who modified a site
 * @property {String} notificationMode The way notifications are sent from a site
 * @property {Date} notified The date and time of the last notification sent to
 * the owners of a site
 * @property {String} pageMode The way stories of a site are displayed
 * @property {Number} pageSize The amount of stories to be displayed simultaneously
 * @property {Polls} polls
 * @property {String} status The trust level of a site
 * @property {Stories} stories
 * @property {String} tagline An arbitrary text describing a site
 * @property {Tags} tags
 * @property {String} timeZone The time and date settings of a site
 * @extends HopObject
 */
Site.prototype.constructor = function() {
  HopObject.confirmConstructor(this);
  return this;
}

/**
 *
 * @param {String} action
 * @returns {Boolean}
 */
Site.prototype.getPermission = function(action) {
  switch (action) {
    case 'backup.js':
    case 'contact':
    case 'main.js':
    case 'main.css':
    case 'error':
    case 'notfound':
    case 'robots.txt':
    case 'search.xml':
    case 'user.js':
    return true;
  }

  switch (action) {
    case '.':
    case 'main':
    case 'comments.xml':
    case 'rss.xml':
    case 'rss.xsl':
    case 'search':
    case 'stories.xml':
    return Site.require(Site.PUBLIC) ||
        (Site.require(Site.RESTRICTED) &&
        Membership.require(Membership.CONTRIBUTOR)) ||
        ((Site.require(Site.DELETED) || Site.require(Site.CLOSED)) &&
        Membership.require(Membership.OWNER)) ||
        User.require(User.PRIVILEGED);

    case 'delete':
    return this !== root && this.status !== Site.DELETED && this.getPermission('edit');

    case 'edit':
    case 'export':
    case 'referrers':
    return Membership.require(Membership.OWNER) ||
        User.require(User.PRIVILEGED);

    case 'subscribe':
    return Site.require(Site.PUBLIC) &&
        User.require(User.REGULAR) &&
        !Membership.require(Membership.SUBSCRIBER);

    case 'unsubscribe':
    var membership = Membership.getByName(session.user.name, this);
    return membership ? membership.getPermission('delete') : false;

    case 'import':
    case '$Site#admin':
    return User.require(User.PRIVILEGED);
  }
}

Site.prototype.main_action = function() {
  res.dependsOn(this.modified);
  res.digest();

  this.renderPage({
    type: 'website',
    schema: 'http://schema.org/WebSite',
    title: this.getTitle(),
    description: this.tagline || String.EMPTY,
    body: this.renderSkinAsString('Site#main'),
    images: [(this.layout.images.get('favicon') || Images.Default['favicon.png']).getUrl()],
    links: this.renderSkinAsString('$Site#links')
  });

  this.log();
  return;
};

Site.prototype.edit_action = function() {
  if (req.postParams.save) {
    try {
      this.update(req.postParams);
      res.message = gettext('The changes were saved successfully.');
      res.redirect(this.href(req.action));
    } catch (ex) {
      res.message = ex;
      app.log(ex);
    }
  }

  res.data.action = this.href(req.action);
  res.data.title = gettext('Settings');
  res.data.body = this.renderSkinAsString('$Site#edit');
  this.renderSkin('Site#page');
  return;
}

Site.prototype.delete_action = function () {
  if (req.postParams.proceed) {
    if (this.stories.size() + this.images.size() + this.files.size() + this.polls.size() < 1) {
      // If a site contains no content, delete it immediately
      HopObject.prototype.delete_action.call(this);
    } else {
      // Otherwise, queue for deletion
      this.status = Site.DELETED;
      res.message = gettext('The site {0} is being deleted.', this.name);
    }
    this.log(root, 'Deleted site ' + this.name);
    res.redirect(root.href());
  } else {
    HopObject.prototype.delete_action.call(this);
  }
};

/**
 *
 * @param {String} name
 * @returns {Object}
 */
Site.prototype.getFormOptions = function(name) {
  switch (name) {
    case 'archiveMode':
    return Site.getArchiveModes();
    case 'callbackMode':
    return Site.getCallbackModes();
    case 'commentMode':
    return Site.getCommentModes();
    case 'locale':
    return getLocales(this.getLocale());
    case 'layout':
    return this.getLayouts();
    case 'mode':
    return Site.getModes();
    case 'notificationMode':
    return Site.getNotificationModes();
    case 'pageMode':
    return Site.getPageModes();
    case 'robotsTxtMode':
    return Site.getRobotsTxtModes();
    case 'status':
    return Site.getStatus();
    case 'timeZone':
    return getTimeZones(this.getLocale());
    default:
    return HopObject.prototype.getFormOptions.apply(this, arguments);
  }
};

Site.prototype.getFormValue = function (name) {
  switch (name) {
    case 'maxImageWidth':
    return this.imageDimensionLimits[0];
    case 'maxImageHeight':
    return this.imageDimensionLimits[1];
    case 'trollFilter':
    var trolls = this.getMetadata('trollFilter');
    return trolls ? trolls.join('\n') : String.EMPTY;
  }
  return HopObject.prototype.getFormValue.apply(this, arguments);
};

/**
 * @returns {String}
 */
Site.prototype.getConfirmText = function() {
  return gettext('You are about to delete the site {0}.',
      this.getTitle());
};

Site.prototype.getConfirmExtra = function () {
  return this.renderSkinAsString('$Site#delete');
};

/**
 *
 * @param {Object} data
 */
Site.prototype.update = function(data) {
  // Remove the corresponding job if site deletion is cancelled
  if (this.job && this.status === Site.DELETED && this.status !== data.status) {
    let job = new Admin.Job(this.job);
    if (job.method === 'remove') job.remove();
  }

  data.maxImageWidth = Math.abs(data.maxImageWidth) || Infinity;
  data.maxImageHeight = Math.abs(data.maxImageHeight) || Infinity;

  let trollFilter = data.trollFilter || [];

  if (typeof trollFilter === 'string') {
    trollFilter = trollFilter.split(/\r\n|\r|\n/).filter(function (item) {
      return item.length > 0;
    });
  }

  this.map({
    archiveMode: data.archiveMode || Site.CLOSED,
    callbackMode: data.callbackMode || Site.DISABLED,
    callbackUrl: data.callbackUrl || this.callbackUrl || String.EMPTY,
    commentMode: data.commentMode || Site.DISABLED,
    robotsTxtMode: data.robotsTxtMode || Site.RELAXED,
    imageDimensionLimits: [data.maxImageWidth, data.maxImageHeight],
    locale: data.locale || root.getLocale().toString(),
    mode: data.mode || Site.CLOSED,
    notificationMode: data.notificationMode || Site.NOBODY,
    pageMode: data.pageMode || Site.DAYS,
    pageSize: parseInt(data.pageSize, 10) || 3,
    spamfilter: data.spamfilter || String.EMPTY,
    tagline: data.tagline || String.EMPTY,
    title: stripTags(data.title) || this.name,
    timeZone: data.timeZone || root.getTimeZone().getID(),
    trollFilter: trollFilter
  });

  if (User.require(User.PRIVILEGED)) {
    this.status = data.status;
    this.notes = data.notes;
  }

  this.configured = new Date;
  this.modifier = session.user;
  this.clearCache();
  return;
}

Site.prototype.main_css_action = function() {
  res.contentType = 'text/css';
  res.dependsOn(String(Root.VERSION));
  res.dependsOn(this.layout.modified);
  HopObject.confirmConstructor(Skin);
  res.dependsOn((new Skin('Site', 'stylesheet')).getStaticFile().lastModified());
  res.digest();

  res.push();
  this.renderSkin('$Site#stylesheet');
  this.renderSkin('Site#stylesheet');
  var css = res.pop();

  try {
    lessParser.parse(css, function(error, less) {
      if (error) throw error;
      res.write(less.toCSS());
    });
  } catch (ex) {
    var message = [ex.type, 'error in line', ex.line, 'column', ex.column, 'of', ex.filename + ':', ex.message/*, '/', ex.extract[1]*/].join(String.SPACE);
    res.writeln('/**');
    res.writeln('LESS parser got exception when rendering custom CSS.');
    res.writeln(message)
    res.writeln('**/');
    console.error(message);
    res.write(css);
  }

  return;
}

Site.prototype.main_js_action = function() {
  res.contentType = 'text/javascript';
  res.dependsOn(String(Root.VERSION));
  HopObject.confirmConstructor(Skin);
  res.dependsOn((new Skin('Site', 'javascript')).getStaticFile().lastModified());
  res.digest();
  var file = new java.io.File(root.getStaticFile('../../scripts/main.min.js'));
  res.writeln(Packages.org.apache.commons.io.FileUtils.readFileToString(file, 'utf-8'));
  this.renderSkin('$Site#javascript');
  Claustra.invoke(req.path);
  return;
}

// FIXME: compatibility
Site.prototype.user_js_action = function() {
  res.contentType = 'text/javascript';
  HopObject.confirmConstructor(Skin);
  res.dependsOn((new Skin('Site', 'javascript')).getStaticFile().lastModified());
  res.digest();
  this.renderSkin('Site#javascript');
  return;
}

Site.prototype.backup_js_action = function() {
  if (req.isPost()) {
    var data = session.data.backup = {};
    for (var key in req.postParams) {
      data[key] = req.postParams[key];
    }
  } else {
    res.contentType = 'text/javascript';
    res.write(JSON.stringify(session.data.backup || {}));
    session.data.backup = null;
  }
  return;
}

Site.prototype.rss_xml_action = function() {
  res.contentType = 'application/rss+xml';
  res.dependsOn(this.modified);
  res.digest();
  this.renderXml(this.stories.union);
  return;
}

Site.prototype.stories_xml_action = function() {
  res.contentType = 'application/rss+xml';
  res.dependsOn(this.modified);
  res.digest();
  this.renderXml(this.stories.recent);
  return;
}

Site.prototype.comments_xml_action = function() {
  res.contentType = 'application/rss+xml';
  res.dependsOn(this.modified);
  res.digest();
  this.renderXml(this.stories.comments);
  return;
}

Site.prototype.search_xml_action = function() {
  res.contentType = 'application/opensearchdescription+xml';
  this.renderSkin('$Site#opensearchdescription');
  return;
}

Site.prototype.renderPage = function (parts) {
  for (var key in parts) {
    res.data[key] = parts[key];
  }
  if (parts.images) {
    res.data.images = parts.images.map(function (url) {
      return html.tagAsString('meta', {
        property: 'og:image',
        name: 'twitter:image',
        itemprop: 'image',
        content: url
      });
    }).join('\n');
  }
  if (parts.videos) {
    res.data.videos = parts.videos.map(function (url) {
      return html.tagAsString('meta', {
        property: 'og:video',
        content: url
      });
    }).join('\n');
  }
  res.data.meta = this.renderSkinAsString('$Site#meta');
  this.renderSkin('Site#page');
};

/**
 *
 * @param {Story[]} collection
 */
Site.prototype.renderXml = function(collection) {
  if (!collection) collection = this.stories.recent;

  var now = new Date;
  var feed = new rome.SyndFeedImpl();

  feed.setFeedType('rss_2.0');
  feed.setLink(this.href());
  feed.setTitle(this.title);
  feed.setDescription(this.tagline || String.EMPTY);
  feed.setLanguage(this.locale.replace('_', '-'));
  feed.setPublishedDate(now);

  var entry, entryInfo, entryModules;
  var enclosure, enclosures, keywords;
  var entries = new java.util.ArrayList();
  var description;
  var list = collection.constructor === Array ? collection : collection.list(0, 25);

  for (let item of list) {
    entry = new rome.SyndEntryImpl();
    entry.setTitle(item.title || formatDate(item.created, 'date'));
    entry.setLink(item.href());
    entry.setAuthor(item.creator.name);
    entry.setPublishedDate(item.created);

    if (item.text) {
      description = new rome.SyndContentImpl();
      description.setType('text/html');
      // FIXME: Work-around for org.jdom.IllegalDataException caused by some ASCII control characters
      description.setValue(item.format_filter(item.text, {}, 'markdown').replace(/[\x00-\x1f^\x0a^\x0d]/g, String.EMPTY));
      entry.setDescription(description);
    }

    entries.add(entry);
  }

  feed.setEntries(entries);

  var output = new rome.SyndFeedOutput();
  var xml = output.outputString(feed);

  return res.write(xml);
}

Site.prototype.rss_xsl_action = function() {
  res.charset = 'UTF-8';
  res.contentType = 'text/xml';
  renderSkin('Global#xslStylesheet');
  return;
}

Site.prototype.referrers_action = function() {
  if (req.data.permanent && this.getPermission('edit'))  {
    var urls = req.data.permanent_array;
    res.push();
    res.write(this.getMetadata('spamfilter'));
    res.write(
      urls.map(function(url) {
        return url.replace(/\?/g, '\\\\?');
      }).join('\n')
    );
    this.setMetadata('spamfilter', res.pop());
    res.redirect(req.data.http_referer);
    return;
  }

  res.push();
  var self = this;
  var sql = new Sql;
  sql.retrieve(Sql.REFERRERS, 'Site', this._id);
  sql.traverse(function() {
    if (this.requests && this.referrer) {
      this.text = encode(this.referrer.head(50));
      this.referrer = encode(this.referrer);
      self.renderSkin('$Site#referrer', this);
    }
  });

  res.data.action = this.href(req.action);
  res.data.list = res.pop();
  res.data.title = gettext('Referrers');
  res.data.body = this.renderSkinAsString('$Site#referrers');
  this.renderSkin('Site#page');
  return;
}

Site.prototype.search_action = function () {
  if (req.data.q) {
    var limit = 50;
    var search = this.search(Story, req.data.q, limit);
    var commentSearch = this.search(Comment, req.data.q, limit);
    if (search.result.length < 1) {
      res.message = search.message;
    } else if (search.exceeded && commentSearch.exceeded) {
      res.message = gettext('Found more than {0} results. Please try a more specific query.', 2 * limit);
    }
    search.result = search.result.concat(commentSearch.result);
    search.result.sort(new Number.Sorter('created', Number.Sorter.DESC));
    res.push();
    search.result.forEach(function (story) {
      story.renderSkin('$Story#search');
    });
    res.data.result = res.pop();
    res.data.count = search.result.length;
    req.data.q = search.term;
  }
  res.data.title = gettext('Search');
  res.data.body = this.renderSkinAsString('$Site#search');
  this.renderSkin('Site#page');
  return;
};

Site.prototype.subscribe_action = function() {
  try {
    Membership.add(session.user, Membership.SUBSCRIBER, this);
    res.message = gettext('Successfully subscribed to site {0}.', this.title);
    res.redirect(this.members.href('subscriptions'));
  } catch (ex) {
    app.log(ex);
    res.message = ex.toString();
  }
  res.redirect(this.href());
  return;
}

Site.prototype.unsubscribe_action = function() {
  if (req.postParams.proceed) {
    try {
      Membership.remove.call(Membership.getByName(session.user.name));
      res.message = gettext('Successfully unsubscribed from site {0}.', this.title);
      res.redirect(this.href());
    } catch (ex) {
      app.log(ex)
      res.message = ex.toString();
    }
  }

  User.setLocation();
  res.data.title = gettext('Confirm Unsubscribe');
  res.data.body = this.renderSkinAsString('$HopObject#confirm', {
    text: gettext('You are about to unsubscribe from the site {0}.', this.title)
  });
  this.renderSkin('Site#page');
  return;
}

Site.prototype.export_action = function() {
  const data = req.postParams;
  const param = {};
  const href = this.href(req.action);
  let job = new Admin.Job(this.job || {});

  if (data.submit === 'export') {
    try {
      if (job.method && job.method !== 'export') {
        throw Error(gettext('There is already another job queued for this site: {0}', job.method));
      }
      this.job = Admin.queue(this, 'export');
      res.message = gettext('The site is queued for export.');
    } catch (ex) {
      res.message = ex.toString();
      app.log(res.message);
    }
    res.redirect(href);
  } else if (data.submit === 'cancel') {
    this.job = job.remove();
    res.redirect(href);
  }

  if (job.method === 'export') {
    param.status = gettext('The site data will be available for download from here, soon.');
  }

  res.data.title = 'Export Site ' + this.name;
  res.handlers.file = File.getById(this.export) || {};
  res.data.body = this.renderSkinAsString('$Site#export', param);
  res.handlers.site.renderSkin('Site#page');
  return;
}

Site.prototype.import_action = function() {
  var job = this.job && new Admin.Job(this.job);
  var file = this.import_id && File.getById(this.import_id);

  var data = req.postParams;
  if (data.submit === 'start') {
    try {
      if (job) {
        if (job.method === 'import') {
          job.remove();
          this.job = null;
        } else if (job.method) {
          throw Error(gettext('There is already another job queued for this site: {0}',
              job.method));
        }
      }
      file && File.remove.call(file);
      data.file_origin = data.file.name;
      file = new File;
      file.site = this;
      file.update(data);
      this.files.add(file);
      file.creator = session.user;
      this.job = Admin.queue(this, 'import');
      this.import_id = file._id;
      res.message = gettext('Site is scheduled for import.');
      res.redirect(this.href(req.action));
    } catch (ex) {
      res.message = ex.toString();
      app.log(res.message);
    }
  } else if (data.submit === 'stop') {
    file && File.remove.call(file);
    job && job.remove();
    this.job = null;
    this.import_id = null;
    res.redirect(this.href(req.action));
  }

  res.handlers.file = File.getById(this.import_id) || {};
  res.data.body = this.renderSkinAsString('$Site#import');
  this.renderSkin('Site#page');
  return;
}

Site.prototype.robots_txt_action = function() {
  res.contentType = 'text/plain';
  this.renderSkin('Site#robots');
  return;
};

Site.prototype.contact_action = function () {
  var username = req.data.name;
  var membership;
  if (username) membership = Membership.getByName(username);
  if (!membership) membership = this.members.owners.get(0);
  try {
    if (!membership) throw Error(gettext('Something went wrong.'));
    res.redirect(membership.href('contact'));
  } catch (ex) {
    res.message = ex.toString();
    res.redirect(req.data.http_referer);
  }
};

/**
 *
 * @param {String} name
 * @returns {HopObject}
 */
Site.prototype.getMacroHandler = function(name) {
  switch (name) {
    case 'archive':
    case 'comments':
    case 'files':
    case 'galleries':
    case 'images':
    case 'layout':
    case 'members':
    case 'polls':
    case 'stories':
    case 'tags':
    return this[name];
    default:
    return null;
  }
}

/**
 *
 */
Site.prototype.stories_macro = function() {
  if (this.stories.featured.size() < 1) {
    this.renderSkin('Site#welcome');
    if (session.user) {
      if (session.user === this.creator) {
        session.user.renderSkin('$User#welcome');
      }
      if (this === root && User.require(User.PRIVILEGED)) {
        this.admin.renderSkin('$Admin#welcome');
      }
    }
  } else {
    this.archive.renderSkin('Archive#main');
  }
  return;
}

/**
 *
 * @param {Object} param
 */
Site.prototype.calendar_macro = function(param) {
  if (this.archiveMode !== Site.PUBLIC) {
    return;
  }
  var calendar = new jala.Date.Calendar(this.archive);
  //calendar.setAccessNameFormat('yyyy/MM/dd');
  calendar.setHrefFormat('/yyyy/MM/dd/');
  calendar.setLocale(this.getLocale());
  calendar.setTimeZone(this.getTimeZone());
  calendar.render(this.archive.getDate());
  return;
}

/**
 *
 * @param {Object} param
 */
Site.prototype.age_macro = function(param) {
  res.write(Math.floor((new Date() - this.created) / Date.ONEDAY));
  return;
}

/**
 *
 * @param {Object} param
 * @param {String} name
 */
Site.prototype.static_macro = function(param, name, mode) {
  return this.getStaticUrl(name);
}


/**
 *
 */
Site.prototype.spamfilter_macro = function() {
  const str = this.getMetadata('spamfilter');
  if (!str) return;
  const urls = str.replace(/\r/g, '').split('\n');
  res.write(JSON.stringify(urls));
  return;
};

/**
 *
 */
Site.prototype.diskspace_macro = function() {
  var quota = this.getQuota();
  var usage = this.getDiskSpace(quota);
  res.write(usage > 0 ? formatNumber(usage, '#,###.#') : 0);
  res.write(' MB ' + (quota ? gettext('free') : gettext('used')));
  return;
}

Site.prototype.search = function (type, term, limit) {
  var search = {
    message: '',
    result: [],
    exceeded: false
  };
  var query = Sql[type.name.toUpperCase() + '_SEARCH'];
  if (!query) {
    return search;
  }
  term = String(term || String.EMPTY).trim();
  // FIXME: Is this still necessary?
  // Remove single and double ticks (aka false quotes)
  //term = term.replace(/(?:\x22|\x27)/g, String.EMPTY);
  if (term === '') {
    search.message = gettext('Please enter a query in the search form.');
  } else if (term) {
    var counter = 0;
    var sql = new Sql({prepared: true});
    sql.retrieve(query, parseInt(this._id, 10), '%' + term + '%', limit + 1);
    sql.traverse(function () {
      if (counter < limit) {
        search.result.push(Story.getById(this.id));
      }
      counter += 1;
    });
    if (counter > limit) {
      search.exceeded = true;
      search.message = gettext('Found more than {0} results. Please try a more specific query.', limit);
    }
  }
  search.term = term;
  return search;
};

/**
 * @returns {java.util.Locale}
 */
Site.prototype.getLocale = function() {
  var locale = this.cache.locale;

  if (locale) return locale;

  if (this.locale) {
    locale = java.util.Locale.forLanguageTag(this.locale);
  } else {
    locale = java.util.Locale.getDefault();
  }

  return this.cache.locale = locale;
};

/**
 * @returns {java.util.TimeZone}
 */
Site.prototype.getTimeZone = function() {
  var timeZone;
  if (timeZone = this.cache.timeZone) {
    return timeZone;
  }
  if (this.timeZone) {
     timeZone = java.util.TimeZone.getTimeZone(this.timeZone);
  } else {
     timeZone = java.util.TimeZone.getDefault();
  }
  this.cache.timezone = timeZone;
  return timeZone;
}

/**
 * @returns {Number}
 */
Site.prototype.getQuota = function() {
  return this.status !== Site.TRUSTED ? root.quota : null;
}

/**
 * @param {Number} quota
 * @returns {float}
 */
Site.prototype.getDiskSpace = function(quota) {
  quota || (quota = this.getQuota());
  var dir = new java.io.File(this.getStaticFile());
  var size = Packages.org.apache.commons.io.FileUtils.sizeOfDirectory(dir);
  var factor = 1024 * 1024; // MB
  return (quota ? quota * factor - size : size) / factor;
}

/**
 *
 * @param {String} href
 */
Site.prototype.processHref = function(href) {
  var parts;
  var scheme = getHrefScheme();
  var domain = getProperty('domain.' + this.name);
  if (domain) {
    parts = [scheme, domain, href];
  } else {
    domain = getProperty('domain.*');
    if (domain) {
      parts = [scheme, this.name, '.', domain, href];
    } else {
      var mountpoint = app.appsProperties.mountpoint;
      if (mountpoint === '/') mountpoint = ''; // Prevents double slashes
      parts = [scheme, req.data.http_host, mountpoint, href];
    }
  }
  return parts.join('');
}

/**
 *
 * @param {String} type
 * @param {String} group
 * @returns {Tag[]}
 */
Site.prototype.getTags = function(type, group) {
  var handler;
  type = type.toLowerCase();
  switch (type) {
    case 'story':
    case 'tags':
    handler = this.stories;
    type = 'tags';
    break;
    case 'image':
    case 'galleries':
    handler = this.images;
    type = 'galleries';
    break;
  }
  switch (group) {
    case Tags.ALL:
    return handler[type];
    case Tags.OTHER:
    case Tags.ALPHABETICAL:
    return handler[group + type.titleize()];
    default:
    return handler['alphabetical' + type.titleize()].get(group);
  }
  return null;
}

/**
 *
 * @param {String} tail
 * @returns {helma.File}
 */
Site.prototype.getStaticFile = function(tail) {
  var fpath = 'sites/' + this.name;
  tail && (fpath += '/' + tail);
  return new helma.File(app.appsProperties['static'], fpath);
}

/**
 *
 * @param {String} tail
 * @returns {String}
 */
Site.prototype.getStaticUrl = function(href) {
  if (!href) href = '';
  var scheme = getHrefScheme();
  var host = getProperty('domain.' + this.name);
  if (!host) host = getProperty('domain.*');
  if (!host) host = req.data.http_host;
  return [scheme, host, app.appsProperties.staticMountpoint, '/sites/', this.name, '/', href].join('');
}

/**
 *
 * @param {Object} ref
 */
Site.prototype.callback = function(ref) {
   if (this.callbackMode === Site.ENABLED && this.callbackUrl) {
    app.data.callbacks.push({
      site: this._id,
      handler: ref.constructor,
      id: ref._id
    });
  }
  return;
}

Site.prototype.enforceRobotsTxt = function() {
  if (this.robotsTxtMode !== Site.ENFORCED) {
    return false;
  }

  // Override some patterns to prevent a site from becoming inaccessible even for the owner
  const overrides = [
    'User-agent: mozilla',
    'Allow: */edit$',
    'Allow: */layout',
    'Allow: */main.*$',
    'Allow: */members'
  ];

  const robotsTxt = root.renderSkinAsString('Site#robots');
  const robots = new Robots(this.href('robots.txt'), robotsTxt + overrides.join('\n'));
  return !robots.isAllowed(path.href() + req.action, req.getHeader('user-agent'));
}
