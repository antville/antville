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
 * @fileOverview Defines the Tags prototype.
 */

markgettext('Tags');
markgettext('tags');

/** @constant */
Tags.ALL = 'all';
/** @constant */
Tags.OTHER = 'other';
/** @constant */
Tags.ALPHABETICAL = 'alphabetical';

/**
 * @name Tags
 * @constructor
 * @extends HopObject
 */

/**
 *
 * @param {String} action
 * @returns {Boolean}
 */
Tags.prototype.getPermission = function(action) {
  return res.handlers.site.getPermission('main');
}

Tags.prototype.main_action = function() {
  /*
  var action = this.getAction();
  if (req.data.group) {
    this.setGroup(req.data.group)
    res.redirect(this.href(action));
  }
  if (req.data.page) {
    this.setPage(req.data.page);
    res.redirect(this.href(action));
  }
  */
  var tags = this.get(Tags.ALL);
  res.data.list = renderList(tags, '$Tag#listItem', 50, req.queryParams.page);
  res.data.pager = renderPager(tags, this.href(req.action), 50, req.queryParams.page);
  res.data.title = this.getTitle();
  res.data.body = this.renderSkinAsString('$Tags#main');
  res.handlers.site.renderSkin('Site#page');
  return;
}

/**
 *
 * @param {Number} id
 * @returns {HopObject}
 */
Tags.prototype.getChildElement = function(id) {
  var child = this[id] || this.get(Tags.ALL).get(id);
  return child;
}

/**
 *
 */
Tags.prototype.alphabet_macro = function() {
  if (this.get(Tags.ALL).size() < 50) {
    return;
  }

  var self = this;
  var collection = this.get(Tags.ALPHABETICAL);
  var prefix = '?group=';
  var group = this.getGroup();

  var add = function(text, id) {
    if (group === id) {
      res.write(text);
    } else {
      html.link({href: self.href(self.getAction()) + prefix + id}, text);
    }
    res.write(' ');
    return;
  };

  add('*', Tags.ALL);
  collection.forEach(function() {
    add(this._id, this._id);
  });
  if (this.get(Tags.OTHER).size() > 0) {
    add('?', Tags.OTHER);
  }
  return;
}

/**
 *
 */
Tags.prototype.pager_macro = function() {
  var page = this.getPage();
  var max = this.get(this.getGroup()).size();
  var size = this.getPageSize();
  var total = Math.ceil(max / size);
  if (total < 2) {
    return;
  }
  var prefix = '?page=';
  for (var i=1; i<=total; i+=1) {
    if (i == page) {
      res.write(i);
    } else {
      html.link({href: this.href(this.getAction()) + prefix + i}, i);
    }
    res.write(' ');
  }
  return;
}

/**
 *
 * @param {Object} param
 */
Tags.prototype.header_macro = function(param) {
  var header = this.getHeader();
  for each (var title in header) {
    this.renderSkin('Tags#header', {title: title});
  }
  return;
}

/**
 *
 */
Tags.prototype.list_macro = function(param, skin) {
  var page = this.getPage();
  var size = param.limit ? Math.min(param.limit, 100) : this.getPageSize();
  var start = (page - 1) * size;
  var collection = this.get(this.getGroup()).list(start, size);
  // FIXME: ListRenderer should do this
  //var list = new jala.ListRenderer(collection);
  //list.render(skin || mgrlistitem);
  var index = start + 1;
  for each (var item in collection) {
    // FIXME: Is there a more elegant solution?
    if (item.constructor !== Tag) {
      item = item.get(0);
    }
    item.renderSkin(skin || '$Tag#listItem', {index: index});
    index += 1;
  }
  return;
}

/**
 *
 * @param {String} group
 * @returns {TagHub[]}
 */
Tags.prototype.get = function(group) {
  return this._parent.getTags(this._id, group || this.getGroup());
}

/**
 * @returns {String}
 */
Tags.prototype.getGroup = function() {
  return Tags.ALL;
  //return decodeURIComponent(session.data[this.href('group')] || Tags.ALL);
}

/**
 *
 * @param {String} group
 */
Tags.prototype.setGroup = function(group) {
  session.data[this.href('group')] = encodeURIComponent(group);
  this.setPage(1);
  return;
}

/**
 * @returns {Number}
 */
Tags.prototype.getPage = function() {
  return session.data[this.href('page')] || 1;
}

/**
 *
 * @param {Number} page
 */
Tags.prototype.setPage = function(page) {
  session.data[this.href('page')] = page;
  return;
}

/**
 * @returns {Number}
 */
Tags.prototype.getPageSize = function() {
  return 5;
}

/**
 * @returns {String}
 */
Tags.prototype.getAction = function() {
  return (req.action === 'main' ? String.EMPTY : req.action);
}

/**
 * @returns {String[]}
 * @see Stories#getAdminHeader
 * @see Images#getAdminHeader
 */
Tags.prototype.getHeader = function() {
  if (this._parent.getAdminHeader) {
    return this._parent.getAdminHeader(this._id) || [];
  }
  return [];
}
