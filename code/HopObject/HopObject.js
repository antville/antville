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
 * @fileOverview Defines the extensions of Helma’s built-in
 * HopObject prototype.
 */

app.addRepository('modules/helma/Aspects');

/**
 *
 * @param {HopObject} collection
 * @param {Object} options Optional flags, e.g. to force or prevent any
 * conditional checks of individual prototype’s remove() methods
 */
HopObject.remove = function(options) {
  var item;
  while (this.size() > 0) {
    item = this.get(0);
    if (item.constructor.remove) {
      item.constructor.remove.call(item, options);
    } else if (!options) {
      item.remove();
    } else {
      throw Error('Missing static ' + item.constructor.name + '.remove() method');
    }
  }
  return;
}

/**
 *
 * @param {String} name
 * @param {HopObject} collection
 */
HopObject.getFromPath = function(name, collection) {
  if (name) {
    var site;
    if (name.contains('/')) {
      var parts = name.split('/');
      site = root.get(parts[0]);
      name = parts[1];
    } else {
      site = res.handlers.site;
    }
    if (site && site.getPermission('main')) {
      return site[collection].get(name);
    }
  }
  return null;
}

/**
 * Debugging method to detect direct constructor calls which
 * should be replaced with static add() method.
 */
HopObject.confirmConstructor = function(ref) {
  var KEY = '__confirmedConstructors__';
  if (!res.meta[KEY]) {
    res.meta[KEY] = {};
  }
  var confirmed = res.meta[KEY];
  if (typeof ref === 'function') {
    confirmed[ref.name] = true;
  } else {
    ref = (ref || this).constructor.name;
    if (!confirmed[ref]) {
      app.logger.warn('Calling unconfirmed constructor for ' + ref + ' prototype – please check!');
    }
  }
  return;
}

/**
 * Helma’s built-in HopObject with Antville’s extensions.
 * @name HopObject
 * @constructor
 */

/**
 *
 */
HopObject.prototype.onRequest = function() {
  // Checking if we are on the correct host to prevent at least some XSS issues
  if (req.action !== 'notfound' && req.action !== 'error' &&
      this.href().contains('://') &&
      !this.href().toLowerCase().startsWith(req.servletRequest.scheme +
      '://' + req.servletRequest.serverName.toLowerCase())) {
    res.redirect(this.href(req.action === 'main' ? String.EMPTY : req.action));
  }

  User.autoLogin();
  res.handlers.membership = User.getMembership();

  if (User.getCurrentStatus() === User.BLOCKED) {
    session.data.status = 403;
    session.data.error = gettext('Your account has been blocked.') + String.SPACE +
        gettext('Please contact an administrator for further information.');
    User.logout();
    res.redirect(root.href('error'));
  }

  if (res.handlers.site.status === Site.BLOCKED &&
      !User.require(User.PRIVILEGED)) {
    session.data.status = 403;
    session.data.error = gettext('The site you requested has been blocked.') +
        String.SPACE + gettext('Please contact an administrator for further information.');
    res.redirect(root.href('error'));
  }

  HopObject.confirmConstructor(Layout);
  res.handlers.layout = res.handlers.site.layout || new Layout;
  res.skinpath = res.handlers.layout.getSkinPath();

  if (!this.getPermission(req.action)) {
    if (!session.user) {
      User.setLocation(root.href() + req.path);
      res.message = gettext('Please login first.');
      res.redirect(res.handlers.site.members.href('login'));
    }
    User.getLocation();
    res.status = 401;
    res.data.title = gettext('{0} 401 Error', root.title);
    res.data.body = root.renderSkinAsString('$Root#error', {error:
        gettext('You are not allowed to access this part of the site.')});
    res.handlers.site.renderSkin('Site#page');
    session.data.error = null;
    res.stop();
  }

  res.meta.values = {};
  res.handlers.site.renderSkinAsString('Site#values');
  return;
}

/**
 * @returns Boolean
 */
HopObject.prototype.getPermission = function() {
  return true;
}

// Marking some prototype names used in res.message of HopObject.delete_action()
markgettext('Comment');
markgettext('File');
markgettext('Image');
markgettext('Membership');
markgettext('Poll');
markgettext('Story');

HopObject.prototype.delete_action = function() {
  if (req.postParams.proceed) {
    try {
      var parent = this._parent;
      var url = this.constructor.remove.call(this, req.postParams) || parent.href();
      res.message = gettext('{0} was successfully deleted.', gettext(this._prototype));
      res.redirect(User.getLocation() || url);
    } catch(ex) {
      res.message = ex;
      app.log(ex);
    }
  }

  res.data.action = this.href(req.action);
  res.data.title = gettext('Confirm Deletion');
  res.data.body = this.renderSkinAsString('$HopObject#confirm', {
    text: this.getConfirmText(req.action),
    extra: this.getConfirmExtra(req.action) || String.EMPTY
  });

  if (req.data.http_get_remainder === 'safemode') {
    res.skinpath = root.layout.getSkinPath();
    res.handlers.site.renderSkin('$Site#page');
  } else {
    res.handlers.site.renderSkin('Site#page');
  }
  return;
};

HopObject.prototype.getConfirmText = function () { };
HopObject.prototype.getConfirmExtra = HopObject.prototype.getConfirmText;

/**
 * @returns {Object}
 */
HopObject.prototype.touch = function() {
  return this.map({
    modified: new Date,
    modifier: session.user
  });
}

/**
 *
 */
HopObject.prototype.log = function() {
  var entry = new LogEntry(this, 'main');
  app.data.entries.push(entry);
  return;
}

/**
 *
 * @param {String} action
 */
HopObject.prototype.notify = function(action) {
  var self = this;
  var site = res.handlers.site;

  var getPermission = function(scope, mode, status) {
    if (scope === Admin.NONE || mode === Site.NOBODY ||
        status === Site.BLOCKED) {
      return false;
    }
    var scopes = [Admin.REGULAR, Admin.TRUSTED];
    if (scopes.indexOf(status) < scopes.indexOf(scope)) {
      return false;
    }
    if (!Membership.require(mode)) {
      return false;
    }
    return true;
  }

  switch (action) {
    case 'comment':
    action = 'create'; break;
  }

  var currentMembership = res.handlers.membership;
  site.members.forEach(function() {
    var membership = res.handlers.membership = this;
    if (getPermission(root.notificationScope, site.notificationMode, site.status)) {
      sendMail(membership.creator.email, gettext('[{0}] Notification of site changes',
          root.title), self.renderSkinAsString('$HopObject#notify_' + action));
    }
  });
  res.handlers.membership = currentMembership;
  return;
}

/**
 * @returns {Tag[]}
 */
HopObject.prototype.getTags = function() {
  var tags = [];
  if (typeof this.tags === 'object') {
    this.tags.list().forEach(function(item) {
      item.tag && tags.push(item.tag.name);
    });
  }
  return tags;
}

/**
 *
 * @param {Tag[]|String} tags
 */
HopObject.prototype.setTags = function(tags) {
  if (typeof this.tags !== 'object') {
    return String.EMPTY;
  }

  if (!tags) {
    tags = [];
  } else if (tags.constructor === String) {
    tags = tags.split(/\s*,\s*/);
  }

  var diff = {};
  var tag;
  for (var i in tags) {
    // Trim and remove troublesome characters  (like ../.. etc.)
    // We call getAccessName with a virgin HopObject to allow most names
    tag = tags[i] = this.getAccessName.call(new HopObject, File.getName(tags[i]));
    if (tag && diff[tag] == null) {
      diff[tag] = 1;
    }
  }
  this.tags.forEach(function() {
    if (!this.tag) {
      return;
    }
    diff[this.tag.name] = (tags.indexOf(this.tag.name) < 0) ? this : 0;
  });

  for (var tag in diff) {
    switch (diff[tag]) {
      case 0:
      // Do nothing (tag already exists)
      break;
      case 1:
      // Add tag
      this.addTag(tag);
      break;
      default:
      // Remove tag
      this.removeTag(diff[tag]);
    }
  }
  return;
}

/**
 *
 * @param {String} name
 */
HopObject.prototype.addTag = function(name) {
  TagHub.add(name, this);
  return;
}

/**
 *
 * @param {String} tag
 */
HopObject.prototype.removeTag = function(tag) {
  var parent = tag._parent;
  if (parent.size() === 1) {
    parent.remove();
  }
  tag.remove();
  return;
}

/**
 *
 * @param {Object} values
 */
HopObject.prototype.map = function(values) {
  for (var i in values) {
    this[i] = values[i];
  }
  return;
}

/**
 *
 * @param {Object} param
 * @param {String} name
 */
HopObject.prototype.skin_macro = function(param, name) {
  if (!name) {
    return;
  }
  if (param.restricted && !this.getPermission(name)) {
    return;
  }
  delete param.restricted;
  if (name.contains('#')) {
    this.renderSkin(name, param);
  } else {
    var prototype = this._prototype || 'Global';
    this.renderSkin(prototype + '#' + name, param);
  }
  return;
}

/**
 *
 * @param {Object} param
 * @param {String} name
 */
HopObject.prototype.input_macro = function(param, name) {
  param.name = name;
  param.id = name;
  param.value = this.getFormValue(name);
  return html.input(param);
}

/**
 *
 * @param {Object} param
 * @param {String} name
 */
HopObject.prototype.textarea_macro = function(param, name, type) {
  param.name = name;
  param.id = name;
  param.value = this.getFormValue(name);
  return html.textArea(param);
}

/**
 *
 * @param {Object} param
 * @param {String} name
 */
HopObject.prototype.select_macro = function(param, name) {
  param.name = name;
  param.id = name;
  var options = this.getFormOptions(name);
  if (options.length < 2) {
    param.disabled = 'disabled';
  }
  return html.dropDown(param, options, this.getFormValue(name));
}

/**
 *
 * @param {Object} param
 * @param {String} name
 */
HopObject.prototype.checkbox_macro = function(param, name) {
  param.name = name;
  param.id = name;
  var options = this.getFormOptions(name);
  if (options.length < 2) {
    param.disabled = 'disabled';
  }
  param.value = String((options[1] || options[0]).value);
  param.selectedValue = String(this.getFormValue(name));
  var label = param.label;
  delete param.label;
  html.checkBox(param);
  if (label) {
    html.element('label', label, {'for': name});
  }
  return;
}

/**
 *
 * @param {Object} param
 * @param {String} name
 */
HopObject.prototype.radiobutton_macro = function(param, name) {
  param.name = name;
  param.id = name;
  var options = this.getFormOptions(name);
  if (options.length < 2) {
    param.disabled = 'disabled';
  }
  param.value = String(options[0].value);
  param.selectedValue = String(this.getFormValue(name));
  var label = param.label;
  delete param.label;
  html.radioButton(param);
  if (label) {
    html.element('label', label, {'for': name});
  }
  return;
}

/**
 *
 * @param {Object} param
 * @param {String} name
 */
HopObject.prototype.upload_macro = function(param, name) {
  param.name = name;
  param.id = name;
  param.value = this.getFormValue(name);
  renderSkin('$Global#upload', param);
  return;
}

/**
 *
 * @param {Object} param
 * @param {HopObject} [handler]
 */
HopObject.prototype.macro_macro = function(param, handler) {
  var constructor = this.constructor;
  if ([File, Image, Poll, Story].indexOf(constructor) > -1 && this.isPersistent()) {
    res.encode('<% ');
    res.write(handler || constructor.name.toLowerCase());
    res.write(String.SPACE);
    res.write(this.name ? quote(this.name, '\\s') : this._id);
    if (param.suffix) {
      res.write(param.suffix);
      param.suffix = null;
    }
    res.encode(' %>');
  }
  return;
}

/**
 *
 */
HopObject.prototype.kind_macro = function(param) {
  var type = this.constructor.name.toLowerCase();
  switch (type) {
    default:
    res.write(cgettext((param.prefix || String.EMPTY) + type, 'accusative'));
    param.prefix = null;
    break;
  }
  return;
}

/**
 *
 * @param {String} name
 * @returns {Number|String}
 */
HopObject.prototype.getFormValue = function(name) {
  if (req.isPost()) {
    return req.postParams[name];
  } else {
    var value = this[name] || req.queryParams[name] || String.EMPTY;
    return value instanceof HopObject ? value._id : value;
  }
}

/**
 * @returns {Object[]}
 */
HopObject.prototype.getFormOptions = function() {
  return [{value: true, display: 'enabled'}];
}

/**
 * @returns {HopObject}
 * @param {Object} param
 * @param {String} property
 */
HopObject.prototype.self_macro = function(param, property) {
  return property ? this[property] : this;
}

/**
 *
 */
HopObject.prototype.type_macro = function() {
  return res.write(this.constructor.name);
}

/**
 *
 * @param {Object} param
 * @param {String} url
 * @param {String} text
 */
HopObject.prototype.link_macro = function(param, url, text) {
  // FIXME: We need to check for claustra and skins because they are always/sometimes
  // transient, unfortunately. Active claustra probably should become database records…
  var isClaustra = !!Claustra.getByName(this._prototype);
  var isSkin = this.constructor === Skin;
  if (this.isTransient() && !isClaustra && !isSkin) {
    return;
  }
  if (url) {
    var action = url.split(/#|\?/)[0];
    if (this.getPermission(action)) {
      renderLink.call(global, param, url, text || '', this);
    }
  } else {
    res.write('[Insufficient link parameters]');
  }
  return;
}

/**
 *
 * @param {Object} param
 * @param {String} format
 */
HopObject.prototype.created_macro = function(param, format) {
  if (this.isPersistent()) {
    format || (format = param.format);
    res.write(formatDate(this.created, format));
  }
  return;
}

/**
 *
 * @param {Object} param
 * @param {String} format
 */
HopObject.prototype.modified_macro = function(param, format) {
  if (this.isPersistent()) {
    format || (format = param.format);
    res.write(formatDate(this.modified, format));
  }
  return;
}

/**
 *
 * @param {Object} param
 * @param {String} mode
 */
HopObject.prototype.creator_macro = function(param, mode) {
  if (!this.creator || this.isTransient()) {
    return;
  }
  mode || (mode = param.as);
  if (mode === 'link' && this.creator.url) {
    html.link({href: this.creator.url}, this.creator.name);
  } else if (mode === 'url') {
    res.write(this.creator.url);
  } else if (mode === 'gravatar') {
    this.creator.gravatar_macro(param);
  } else {
    res.write(this.creator.name);
  } return;
}

/**
 *
 * @param {Object} param
 * @param {String} mode
 */
HopObject.prototype.modifier_macro = function(param, mode) {
  if (!this.modifier || this.isTransient()) {
    return;
  }
  mode || (mode = param.as);
  if (mode === 'link' && this.modifier.url) {
    html.link({href: this.modifier.url}, this.modifier.name);
  } else if (mode === 'url') {
    res.write(this.modifier.url);
  } else {
    res.write(this.modifier.name);
  }
  return;
}

/**
 * @returns {String}
 */
HopObject.prototype.getTitle = function() {
  return this.title || gettext(this.__name__.capitalize());
}

/**
 * @returns {String}
 */
HopObject.prototype.toString = function() {
  return this.constructor.name + ' #' + this._id;
}

/**
 *
 * @param {String} text
 * @param {Object} param
 * @param {String} action
 * @returns {String}
 */
HopObject.prototype.link_filter = function(text, param, action) {
  action || (action = '.');
  res.push();
  renderLink(param, action, text, this);
  return res.pop();
}
