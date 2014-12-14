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
 * @fileOverview Defines the Admin prototype.
 */

Admin.SITEREMOVALGRACEPERIOD = 14; // days

/**
 *
 * @param {HopObject} target
 * @param {String} method
 * @param {User} user
 * @constructor
 */
Admin.Job = function(target, method, user) {
  var file;
  user || (user = session.user);

  this.__defineGetter__('target', function() {
    return target;
  });

  this.__defineGetter__('method', function() {
    return method;
  });

  this.__defineGetter__('user', function() {
    return user;
  });

  this.__defineGetter__('name', function() {
    return file.getName();
  });

  this.remove = function() {
    return file['delete']();
  }

  if (target && method && user) {
    file = new java.io.File.createTempFile('job-', String.EMPTY, Admin.queue.dir);
    serialize({type: target._prototype, id: target._id, method: method, user: user._id}, file);
  } else if (target) {
    file = new java.io.File(Admin.queue.dir, target);
    if (file.exists()) {
      var data = deserialize(file);
      target = global[data.type].getById(data.id);
      method = data.method;
      user = User.getById(data.user);
    }
  } else {
    throw Error('Insufficient arguments');
  }

  this.toString = function() {
    return ['[Job: ', method, ' ', target, ' by ', user, ']'].join(String.EMPTY);
  }

  return this;
}

/**
 * @function
 * @returns {String[]}
 * @see defineConstants
 */
Admin.getNotificationScopes = defineConstants(Admin, markgettext('None'),
    markgettext('Trusted'), markgettext('Regular'));

/**
 * @function
 * @return {String[]}
 * @see defineConstants
 */
Admin.getPhaseOutModes = defineConstants(Admin, markgettext('Disabled'),
    markgettext('Restricted'), markgettext('Abandoned'),
    markgettext('Both'));

/**
 * @function
 * @returns {String[]}
 * @see defineConstants
 */
Admin.getCreationScopes = defineConstants(Admin, markgettext('Privileged'),
    markgettext('Trusted'), markgettext('Regular'));

/**
 * Convenience method for easily queueing jobs.
 * @param {HopObject} target
 * @param {String} method
 * @param {User} user
 * @returns {String}
 * @see Admin.Job
 */
Admin.queue = function(target, method, user) {
  var job = new Admin.Job(target, method, user || session.user);
  return job.name;
}

/**
 *
 */
Admin.queue.dir = (new java.io.File(app.dir, '../jobs')).getCanonicalFile();
Admin.queue.dir.exists() || Admin.queue.dir.mkdirs();

/**
 *
 */
Admin.dequeue = function() {
  var jobs = Admin.queue.dir.list();
  var max = Math.min(jobs.length, 10);
  for (let i=0; i<max; i+=1) {
    let job = new Admin.Job(jobs[i]);
    if (job.target) {
      try {
        app.log('PROCESSING QUEUED JOB ' + (i+1) + ' OF ' + max);
        switch (job.method) {
          case 'remove':
          Site.remove.call(job.target);
          break;
          case 'import':
          Importer.run(job.target, job.user);
          break;
          case 'export':
          Exporter.run(job.target, job.user);
          break;
        }
      } catch (ex) {
        app.log('Failed to process job ' + job + ' due to ' + ex);
        app.debug(ex.rhinoException);
      }
    }
    job.remove();
  }
  return;
}

/**
 *
 */
Admin.purgeSites = function() {
  var now = new Date;

  root.admin.deletedSites.forEach(function() {
    if (now - this.deleted > Date.ONEDAY * Admin.SITEREMOVALGRACEPERIOD) {
      if (this.job) {
        return; // Site is already scheduled for deletion
      }
      let job = new Admin.Job(this, 'remove', User.getById(1));
      this.job = job.name;
    }
  });

  var notificationPeriod = root.phaseOutNotificationPeriod * Date.ONEDAY;
  var gracePeriod = root.phaseOutGracePeriod * Date.ONEDAY;

  var phaseOutAbandonedSites = function() {
    root.forEach(function() {
      if (this.status === Site.TRUSTED) {
        return;
      }
      var age = now - (this.stories.size() > 0 ?
          this.stories.get(0).modified : this.created);
      if (age - notificationPeriod > 0) {
        if (!this.notified) {
          var site = res.handlers.site = this;
          this.members.owners.forEach(function() {
            res.handlers.membership = this;
            sendMail(this.creator.email,
                gettext('[{0}] Warning: Site will be deleted'),
                site.renderSkinAsString('$Site#notify_delete'));
          });
          this.notified = now;
        } else if (now - this.notified > gracePeriod) {
          this.mode = Site.DELETED;
          this.deleted = now;
          this.notified = null;
        }
      }
    });
    return;
  }

  var phaseOutRestrictedSites = function() {
    root.admin.restrictedSites.forEach(function() {
      if (this.status === Site.TRUSTED) {
        return;
      }
      var age = now - this.created;
      if (age - notificationPeriod > 0) {
        if (!this.notified) {
          var site = res.handlers.site = this;
          this.members.owners.forEach(function() {
            res.handlers.membership = this;
            sendMail(this.creator.email,
                gettext('[{0}] Warning: Site will be blocked'),
                site.renderSkinAsString('$Site#notify_block'));
          });
          this.notified = now;
        } else if (now - this.notified > gracePeriod) {
          this.status = Site.BLOCKED;
          this.notified = null;
        }
      }
    });
    return;
  }

  switch (root.phaseOutMode) {
    case Admin.ABANDONED:
    return phaseOutAbandonedSites();
    case Admin.RESTRICTED:
    return phaseOutRestrictedSites();
    case Admin.BOTH:
    phaseOutAbandonedSites();
    return phaseOutRestrictedSites();
  }
  return;
}

/**
 *
 */
Admin.purgeReferrers = function() {
  var sql = new Sql;
  var result = sql.execute(Sql.PURGEREFERRERS);
  return result;
}

/**
 *
 */
Admin.commitRequests = function() {
  var requests = app.data.requests;
  app.data.requests = {};
  for each (var item in requests) {
    switch (item.type) {
      case Story:
      var story = Story.getById(item.id);
      story && (story.requests = item.requests);
      break;
    }
  }
  res.commit();
  return;
}

/**
 *
 */
Admin.commitEntries = function() {
  var entries = app.data.entries;
  app.data.entries = [];
  var history = [];

  for each (var item in entries) {
    var referrer = helma.Http.evalUrl(item.referrer);
    if (!referrer) {
      continue;
    }

    // Only log unique combinations of context, ip and referrer
    referrer = String(referrer);
    var key = item.context._prototype + '-' + item.context._id + ':' +
        item.ip + ':' + referrer;
    if (history.indexOf(key) > -1) {
      continue;
    }
    history.push(key);

    // Exclude requests coming from the same site
    if (item.site) {
      var href = item.site.href().toLowerCase();
      if (href.startsWith('http') &&
          referrer.toLowerCase().contains(href.substr(0, href.length-1))) {
        continue;
      }
    }
    item.persist();
  }

  res.commit();
  return;
}

/**
 *
 */
Admin.invokeCallbacks = function() {
  var http = helma.Http();
  http.setTimeout(200);
  http.setReadTimeout(300);
  http.setMethod('POST');

  var ref, site, item;
  while (ref = app.data.callbacks.pop()) {
    site = Site.getById(ref.site);
    item = ref.handler && ref.handler.getById(ref.id);
    if (!site || !item) {
      continue;
    }
    app.log('Invoking callback URL ' + site.callbackUrl + ' for ' + item);
    try {
      http.setContent({
        type: item.constructor.name,
        id: item.name || item._id,
        url: item.href(),
        date: item.modified.valueOf(),
        user: item.modifier.name,
        site: site.title || site.name,
        origin: site.href()
      });
      http.getUrl(site.callbackUrl);
    } catch (ex) {
      app.debug('Invoking callback URL ' + site.callbackUrl + ' failed: ' + ex);
    }
  }
  return;
}

/**
 *
 */
Admin.updateHealth = function() {
  var health = Admin.health || {};
  if (!health.modified || new Date - health.modified > 5 * Date.ONEMINUTE) {
    health.modified = new Date;
    health.requestsPerUnit = app.requestCount -
        (health.currentRequestCount || 0);
    health.currentRequestCount = app.requestCount;
    health.errorsPerUnit = app.errorCount - (health.currentErrorCount || 0);
    health.currentErrorCount = app.errorCount;
    Admin.health = health;
  }
  return;
}

/**
 *
 */
Admin.updateDomains = function() {
  res.push();
  for (var key in app.properties) {
    if (key.startsWith('domain.') && !key.endsWith('*')) {
      res.writeln(getProperty(key) + '\t\t' + key.substr(7));
    }
  }
  var map = res.pop();
  var file = new java.io.File(app.dir, 'domains.map');
  var out = new java.io.BufferedWriter(new java.io.OutputStreamWriter(
      new java.io.FileOutputStream(file), 'UTF-8'));
  out.write(map);
  out.close();
  return;
}

/**
 * The Admin prototype is mounted at root and provides actions needed
 * for system administration. A user needs the User.PRIVILEGED permission
 * to gain access or modify settings.
 * @name Admin
 * @constructor
 * @property {Sites[]} deletedSites Contains sites scheduled for deletion
 * @property {LogEntry[]} entries Contains administrative log entries only
 * @property {Sites[]} restrictedSites Contains sites which are restricted but not blocked
 * @property {Sites[]} sites Contains all available sites
 * @property {Users[]} users Contains all available users
 * @extends HopObject
 */
Admin.prototype.constructor = function() {
  this.filterSites();
  this.filterUsers();
  this.filterLog();
  return this;
}

/**
 *
 * @param {Object} action
 * @returns {Boolean}
 */
Admin.prototype.getPermission = function(action) {
  if (!session.user) {
    return false;
  }
  switch (action) {
    case 'users':
    if (req.queryParams.id === session.user._id) {
      return false;
    }
    break;
  }
  return User.require(User.PRIVILEGED);
}

/**
 *
 */
Admin.prototype.onRequest = function() {
  HopObject.prototype.onRequest.apply(this);
  if (!session.data.admin) {
    session.data.admin = new Admin();
  }
  return;
}

/**
 *
 * @param {String} name
 */
Admin.prototype.onUnhandledMacro = function(name) {
  res.debug('Add ' + name + '_macro to Admin!');
  return null;
}

Admin.prototype.main_action = function() {
  if (req.postParams.search || req.postParams.filter) {
    session.data.admin.filterLog(req.postParams);
  }

  res.data.list = renderList(session.data.admin.entries,
      this.renderItem, 25, req.queryParams.page);
  res.data.pager = renderPager(session.data.admin.entries,
      this.href(req.action), 25, req.queryParams.page);

  res.data.title = gettext('Activity');
  res.data.action = this.href(req.action);
  res.data.body = this.renderSkinAsString('$Admin#log');
  root.renderSkin('Site#page');
  return;
}

Admin.prototype.setup_action = function() {
  if (req.postParams.save) {
    try {
      this.update(req.postParams);
      this.log(root, 'setup');
      res.message = gettext('Successfully updated the setup.');
      res.redirect(this.href(req.action));
    } catch (ex) {
      res.message = ex;
      app.log(ex);
    }
  }

  res.data.title = gettext('Setup');
  res.data.action = this.href(req.action);
  res.data.body = this.renderSkinAsString('$Admin#setup');
  root.renderSkin('Site#page');
  return;
}

/**
 *
 * @param {Object} data
 */
Admin.prototype.update = function(data) {
  root.map({
    creationScope: data.creationScope,
    creationDelay: data.creationDelay,
    replyTo: data.replyTo,
    notificationScope: data.notificationScope,
    phaseOutGracePeriod: data.phaseOutGracePeriod,
    phaseOutMode: data.phaseOutMode,
    phaseOutNotificationPeriod: data.phaseOutNotificationPeriod,
    probationPeriod: data.probationPeriod,
    quota: data.quota
  });
  return;
}

Admin.prototype.jobs_action = function() {
  var files = Admin.queue.dir.listFiles();
  res.data.list = renderList(files, this.renderItem, 25, req.queryParams.page);
  res.data.pager = renderPager(files, this.href(req.action),  25, req.data.page);
  res.data.title = gettext('Jobs');
  res.data.action = this.href(req.action);
  res.data.body = this.renderSkinAsString('$Admin#jobs');
  root.renderSkin('Site#page');
  return;
}

Admin.prototype.sites_action = function() {
  if (req.postParams.search || req.postParams.filter) {
    session.data.admin.filterSites(req.postParams);
  }

  res.data.list = renderList(session.data.admin.sites,
      this.renderItem, 25, req.queryParams.page);
  res.data.pager = renderPager(session.data.admin.sites,
      this.href(req.action), 25, req.data.page);

  res.data.title = gettext('Sites');
  res.data.action = this.href(req.action);
  res.data.body = this.renderSkinAsString('$Admin#sites');
  root.renderSkin('Site#page');
  return;
}

Admin.prototype.users_action = function() {
  if (req.postParams.search || req.postParams.filter) {
    session.data.admin.filterUsers(req.postParams);
  }

  res.data.list = renderList(session.data.admin.users,
      this.renderItem, 25, req.data.page);
  res.data.pager = renderPager(session.data.admin.users,
      this.href(req.action), 25, req.data.page);

  res.data.title = gettext('Users');
  res.data.action = this.href(req.action);
  res.data.body = this.renderSkinAsString('$Admin#users');
  root.renderSkin('Site#page');
  return;
}

/**
 *
 * @param {Object} data
 */
Admin.prototype.filterLog = function(data) {
  data || (data = {});
  var sql = '';
  if (data.filter > 0) {
    sql += "where context_type = '";
    switch (data.filter) {
      case '1':
      sql += 'Root'; break;
      case '2':
      sql += 'Site'; break;
      case '3':
      sql += 'User'; break;
    }
    sql += "' and ";
  } else {
    sql += 'where '
  }
  sql += "action <> 'main' ";
  if (data.query) {
    var parts = stripTags(data.query).split(' ');
    var keyword, like;
    for (var i in parts) {
      sql += i < 1 ? 'and ' : 'or ';
      keyword = parts[i].replace(/\*/g, '%');
      like = keyword.contains('%') ? 'like' : '=';
      sql += 'action ' + like + " '' + keyword + '' ";
    }
  }
  sql += 'order by created ';
  (data.dir == 1) || (sql += 'desc');
  this.entries.subnodeRelation = sql;
  return;
}

/**
 *
 * @param {Object} data
 */
Admin.prototype.filterSites = function(data) {
  data || (data = {});
  var sql;
  switch (data.filter) {
    case '1':
    sql = "where status = 'blocked' "; break;
    case '2':
    sql = "where status = 'trusted' "; break;
    case '3':
    sql = "where mode = 'open' "; break;
    case '4':
    sql = "where mode = 'restricted' "; break;
    case '5':
    sql = "where mode = 'public' "; break;
    case '6':
    sql = "where mode = 'closed' "; break;
    case '7':
    sql = "where mode = 'deleted' "; break;
    case '0':
    default:
    sql = 'where true ';
  }
  if (data.query) {
    var parts = stripTags(data.query).split(' ');
    var keyword, like;
    for (var i in parts) {
      sql += i < 1 ? 'and ' : 'or ';
      keyword = parts[i].replace(/\*/g, '%');
      like = keyword.contains('%') ? 'like' : '=';
      sql += '(name ' + like + " '' + keyword + '') ";
    }
  }
  switch (data.order) {
    case '1':
    sql += 'group by created, id order by created '; break;
    case '2':
    sql += 'group by name, id order by name '; break;
    default:
    sql += 'group by modified, id order by modified '; break;
  }
  (data.dir == 1) || (sql += 'desc');
  this.sites.subnodeRelation = sql;
  return;
}

/**
 *
 * @param {Object} data
 */
Admin.prototype.filterUsers = function(data) {
  data || (data = {});
  var sql;
  switch (data.filter) {
    case '1':
    sql = "where status = 'blocked' "; break;
    case '2':
    sql = "where status = 'trusted' "; break;
    case '3':
    sql = "where status = 'privileged' "; break;
    default:
    sql = 'where true '; break;
  }
  if (data.query) {
    var parts = stripTags(data.query).split(' ');
    var keyword, like;
    for (var i in parts) {
      sql += i < 1 ? 'and ' : 'or ';
      keyword = parts[i].replace(/\*/g, '%');
      like = keyword.contains('%') ? 'like' : '=';
      if (keyword.contains('@')) {
        sql += 'email ' + like + " '' + keyword.replace(/@/g, '') + '' ";
      } else {
        sql += 'name ' + like + " '' + keyword + '' ";
      }
    }
  }
  switch (data.order) {
    case '0':
    default:
    sql += 'group by created, id order by created '; break;
    case '1':
    sql += 'group by modified, id order by modified '; break;
    case '2':
    sql += 'group by name, id order by name '; break;
  }
  (data.dir == 1) || (sql += 'desc');
  this.users.subnodeRelation = sql;
  return;
}

/**
 *
 * @param {HopObject} item
 */
Admin.prototype.renderItem = function(item) {
  res.handlers.item = item;
  var name = item._prototype;
  if (item.getClass && item.getClass() === java.io.File) {
      name = 'Job';
      res.handlers.item = deserialize(item);
  } else if (name === 'Root') name = 'Site';
  Admin.prototype.renderSkin('$Admin#' + name.toLowerCase());
  return;
}

/**
 *
 * @param {HopObject} context
 * @param {String} action
 */
Admin.prototype.log = function(context, action) {
  var entry = new LogEntry(context, action);
  this.entries.add(entry);
  return;
}

/**
 *
 * @param {Object} param
 * @param {String} action
 * @param {Number} id
 * @param {String} text
 */

Admin.prototype.href_macro = function (param, action, id) {
  res.write(this.href.apply(this, arguments));
  return;
};

Admin.prototype.href = function (action, id) {
  switch (action) {
    case 'main':
    action = '.';
    case 'delete':
    case 'edit':
    if (id) {
      if (req.action === 'users' && (id === session.user._id)) {
        return;
      }
      if (req.action === 'sites' && (id === root._id)) {
        return;
      }
      action = req.action + '?action=' + action + '&id=' + id;
      if (req.queryParams.page) {
        action += '&page=' + req.queryParams.page;
      }
      action += '#' + id;
    }
    break;
  }
  return root.href('admin') + '/' + action;
};

/**
 *
 * @param {Object} param
 * @param {String} name
 */
Admin.prototype.skin_macro = function(param, name) {
  if (this.getPermission('main')) {
    return HopObject.prototype.skin_macro.apply(this, arguments);
  }
  return;
}

/**
 *
 * @param {Object} param
 * @param {HopObject} object
 * @param {String} name
 */
Admin.prototype.items_macro = function(param, object, name) {
  if (!object || !object.size) {
    return;
  }
  var max = Math.min(object.size(), parseInt(param.limit) || 10);
  for (var i=0; i<max; i+=1) {
    html.link({href: object.get(i).href()}, '#' + (object.size()-i) + ' ');
  }
  return;
}

/**
 *
 * @param {Object} param
 */
Admin.prototype.dropdown_macro = function(param /*, value1, value2, ... */) {
  if (!param.name || arguments.length < 2) {
    return;
  }
  var values = Array.prototype.slice.call(arguments, 1);
  var options = values.map(function(item, index) {
    return {
      value: index,
      display: gettext(item)
    }
  });
  var selectedIndex = req.postParams[param.name];
  html.dropDown({name: param.name}, options, selectedIndex);
  return;
}
