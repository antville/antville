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
 * @fileOverview Defines the Story prototype.
 */

markgettext('Story');
markgettext('story');

this.handleMetadata('title');
this.handleMetadata('text');

Story.ALLOWED_MACROS = [
  'file',
  'image',
  'link',
  'poll',
  'story.link'
];

/**
 * @function
 * @param {Object} data
 * @param {Site} site
 * @param {User} user
 * @returns {Story}
 */
Story.add = function(data, site, user) {
  HopObject.confirmConstructor(Story);
  site || (site = res.handlers.site);
  user || (user = session.user);
  var story = new Story;
  story.name = String.EMPTY;
  story.requests = 0;
  story.created = story.modified = new Date;
  story.site = site;
  story.creator = story.modifier = user;
  story.update(data);
  site.stories.add(story);
  return story;
}

/**
 * @function
 */
Story.remove = function() {
  if (this.constructor === Story) {
    HopObject.remove.call(this.comments);
    this.setTags(null);
    this.deleteMetadata();
    this.remove();
  }
  return;
}

/**
 * @function
 * @returns {String[]}
 * @see defineConstants
 */
Story.getStatus = defineConstants(Story, markgettext('closed'),
    markgettext('public'), markgettext('shared'), markgettext('open'));
/**
 * @function
 * @returns {String[]}
 * @see defineConstants
 */
Story.getModes = defineConstants(Story, markgettext('hidden'),
    markgettext('featured'));
/**
 * @function
 * @returns {String[]}
 * @see defineConstants
 */
Story.getCommentModes = defineConstants(Story, markgettext('closed'),
    /* markgettext('readonly'), markgettext('moderated'), */
    markgettext('open'));

/**
 * @name Story
 * @constructor
 * @property {Comment[]} _children
 * @property {String} commentMode
 * @property {Comment[]} comments
 * @property {Date} created
 * @property {User} creator
 * @property {Metadata} metadata
 * @property {String} mode
 * @property {Date} modified
 * @property {User} modifier
 * @property {String} name
 * @property {Number} parent_id
 * @property {String} parent_type
 * @property {String} prototype
 * @property {Number} requests
 * @property {Site} site
 * @property {String} status
 * @property {TagHub[]} tags
 * @property {String} text
 * @property {String} title
 * @extends HopObject
 */
Story.prototype.constructor = function() {
  HopObject.confirmConstructor(this);
  return this;
}

/**
 *
 * @param {String} action
 * @returns {Boolean}
 */
Story.prototype.getPermission = function(action) {
  if (!this.site.getPermission('main')) {
    return false;
  }
  switch (action) {
    case '.':
    case 'main':
    return this.status !== Story.CLOSED ||
        this.creator === session.user ||
        Membership.require(Membership.MANAGER) ||
        User.require(User.PRIVILEGED);

    case 'comment':
    return this.site.commentMode === Site.ENABLED &&
        (this.commentMode === Story.OPEN ||
        this.commentMode === Story.MODERATED);

    case 'delete':
    return this.creator === session.user ||
        Membership.require(Membership.MANAGER) ||
        User.require(User.PRIVILEGED);

    case 'edit':
    case 'mode':
    case 'rotate': // FIXME: Action moved to compat layer
    case 'status':
    return this.creator === session.user ||
        Membership.require(Membership.MANAGER) ||
        (this.status === Story.SHARED && Membership.require(Membership.CONTRIBUTOR)) ||
        (this.status === Story.OPEN && Membership.require(Membership.SUBSCRIBER)) ||
        User.require(User.PRIVILEGED);
  }
  return false;
}

Story.prototype.main_action = function() {
  this.site.renderPage({
    type: 'article',
    schema: 'http://schema.org/Article',
    title: this.getTitle(10),
    description: this.format_filter(this.getAbstract().replace(/\s+/g, String.SPACE), null, 'quotes'),
    body: this.renderSkinAsString('Story#main'),
    images: this.getMetadata('og:image'),
    videos: this.getMetadata('og:video')
  });
  this.site.log();
  this.count();
  this.log();
  return;
}

/**
 *
 * @param {Number} limit
 * @returns {String}
 */
Story.prototype.getTitle = function(limit) {
  var key = this + ':title:' + limit;
  if (!res.meta[key]) {
    if (this.title) {
      res.meta[key] = stripTags(this.title).clip(limit, String.ELLIPSIS, '\\s');
    } else if (this.text) {
      var parts = stripTags(this.text).embody(limit, String.ELLIPSIS, '\\s');
      res.meta[key] = parts.head;
      res.meta[this + ':text:' + limit] = parts.tail;
    }
  }
  return String(res.meta[key]) || String.ELLIPSIS;
};

Story.prototype.edit_action = function() {
  if (req.postParams.save) {
    try {
      this.update(req.postParams);
      console.log(req.postParams['og:image_array']);
      (function (images, videos) {
        this.setMetadata('og:image', images ? Array.prototype.slice.call(images) : null);
        this.setMetadata('og:video', videos ? Array.prototype.slice.call(videos) : null);
      }).call(this, req.postParams['og:image_array'], req.postParams['og:video_array']);
      delete session.data.backup;
      res.message = gettext('The story was successfully updated.');
      res.redirect(this.href(req.action));
    } catch (ex) {
      res.message = ex;
      app.log(ex);
    }
  }

  res.data.action = this.href(req.action);
  res.data.title = gettext('Edit Story');
  res.data.body = this.renderSkinAsString('Story#edit');
  this.site.renderSkin('Site#page');
  return;
}

/**
 *
 * @param {Object} data
 */
Story.prototype.update = function(data) {
  var site = this.site || res.handlers.site;

  if (!data.title && !data.text) {
    throw Error(gettext('Please enter at least something into the “title” or “text” field.'));
  }
  if (data.created) {
    try {
      this.created = data.created.toDate('yyyy-MM-dd HH:mm', site.getTimeZone());
    } catch (ex) {
      throw Error(gettext('Cannot parse timestamp {0} as a date.', data.created));
      app.log(ex);
    }
  }

  // Get difference to current content before applying changes
  var delta = this.getDelta(data);
  this.title = data.title ? stripTags(data.title.trim()) : String.EMPTY;
  this.text = data.text ? data.text.trim() : String.EMPTY;
  this.status = data.status || Story.PUBLIC;
  this.mode = data.mode || Story.FEATURED;
  this.commentMode = data.commentMode || Story.OPEN;
  this.setCustomContent(data);

  // FIXME: To be removed resp. moved to Stories.create_action and
  // Story.edit_action if work-around for Helma bug #607 fails
  // We need persistence for setting the tags
  this.isTransient() && this.persist();
  this.setTags(data.tags || data.tag_array);

  if (delta > 50) {
    this.modified = new Date;
    if (this.status !== Story.CLOSED) {
      site.modified = this.modified;
    }
    site.callback(this);
    // Notification is sent in Stories.create_action()
  }

  this.clearCache();
  this.modifier = session.user;
  return;
}

Story.prototype.status_action = function () {
  this.status = (this.status === Story.CLOSED ? Story.PUBLIC : Story.CLOSED);
  return res.redirect(req.data.http_referer || this._parent.href());
};

Story.prototype.mode_action = function () {
  this.mode = (this.mode === Story.HIDDEN ? Story.FEATURED : Story.HIDDEN);
  return res.redirect(req.data.http_referer || this._parent.href());
};

Story.prototype.comment_action = function() {
  // Check if user is logged in since we allow linking here for any user
  if (!User.require(User.REGULAR)) {
    User.setLocation(this.href(req.action) + '#form');
    res.message = gettext('Please login first.');
    res.redirect(this.site.members.href('login'));
  }
  if (req.postParams.save) {
    try {
      var comment = Comment.add(req.postParams, this);
      comment.notify(req.action);
      delete session.data.backup;
      res.message = gettext('The comment was successfully created.');
      res.redirect(comment.href());
    } catch (ex) {
      res.message = ex;
      app.log(ex);
    }
  }
  res.handlers.parent = this;
  res.data.action = this.href(req.action);
  res.data.title = gettext('Add Comment');
  HopObject.confirmConstructor(Comment);
  res.data.body = (new Comment).renderSkinAsString('Comment#edit');
  this.site.renderSkin('Site#page');
  return;
}

/**
 *
 * @param {String} name
 * @returns {Object}
 */
Story.prototype.getFormValue = function(name) {
  if (req.isPost()) {
    return req.postParams[name];
  }
  switch (name) {
    case 'commentMode':
    return this.commentMode || Story.OPEN;
    case 'mode':
    return this.mode || Story.FEATURED;
    case 'status':
    return this.status || Story.PUBLIC;
    case 'tags':
    return this.getTags().join(Tag.DELIMITER);
  }
  return this[name] || this.getMetadata(name) || req.queryParams[name];
}

/**
 *
 * @param {String} name
 * @returns {String[]}
 */
Story.prototype.getFormOptions = function(name) {
  switch (name) {
    case 'commentMode':
    return Story.getCommentModes();
    case 'mode':
    return Story.getModes();
    case 'status':
    return Story.getStatus();
    case 'tags':
    // FIXME: This could become a huge select element...
    return [];
  }
  return;
}

/**
 *
 * @param {Object} data
 */
Story.prototype.setCustomContent = function(data) {
  var metadata = {};
  for (var key in data) {
    if (this.isCustomContent(key)) {
      metadata[key] = data[key];
    }
  }
  return HopObject.prototype.setMetadata.call(this, metadata);
}

/**
 *
 * @param {String} name
 */
Story.prototype.isCustomContent = function(key) {
  return this[key] === undefined && key !== 'save';
}

/**
 * Increment the request counter
 */
Story.prototype.count = function() {
  if (session.user === this.creator) {
    return;
  }
  var story;
  var key = 'Story#' + this._id;
  if (story = app.data.requests[key]) {
    story.requests += 1;
  } else {
    app.data.requests[key] = {
      type: this.constructor,
      id: this._id,
      requests: this.requests + 1
    };
  }
  return;
}

/**
 * Calculate the difference of a story’s current and its updated content
 * @param {Object} data
 * @returns {Number}
 */
Story.prototype.getDelta = function(data) {
  if (this.isTransient()) {
    return Infinity;
  }

  var deltify = function(s1, s2) {
    var len1 = s1 ? String(s1).length : 0;
    var len2 = s2 ? String(s2).length : 0;
    return Math.abs(len1 - len2);
  };

  var delta = 0;
  delta += deltify(data.title, this.title);
  delta += deltify(data.text, this.text);
  for (var key in data) {
    if (this.isCustomContent(key)) {
      delta += deltify(data[key], this.getMetadata(key))
    }
  }
  // In-between updates (1 hour) get zero delta
  var timex = (new Date - this.modified) > Date.ONEHOUR ? 1 : 0;
  return delta * timex;
}

/**
 *
 * @param {String} name
 * @returns {HopObject}
 */
Story.prototype.getMacroHandler = function(name) {
  if (name === 'metadata') {
    return this.getMetadata();
  } else if (name === 'site') {
    return this.site;
  }
  return null;
}

Story.prototype.getAbstract = function (param) {
  param || (param = {});
  var limit = param.limit || 10;
  var ratio = 0.5; // Use title and text equivalently
  var result = [], raw = [];
  raw.push(this.title, this.text);
  var titleLimit = Math[ratio >= 0.5 ? 'ceil' : 'floor'](limit * ratio);
  var title = this.title && stripTags(this.title).clip(titleLimit, null, '\\s');
  var titleLength = title ? title.split(/\s/).length : 0;
  if (titleLength < titleLimit) {
    ratio = titleLength / limit;
  }
  var textLimit = Math[ratio < 0.5 ? 'ceil' : 'floor'](limit * (1 - ratio));
  var text = this.text && stripTags(this.text).clip(textLimit, null, '\\s');
  title && result.push('<b>' + title + '</b> ');
  text && result.push(text);
  if (result.length < 1) {
    // FIXME: Custom content should move to compatibility layer
    var contentArgs = Array.prototype.slice.call(arguments, 1); // Remove first argument (param)
    if (!contentArgs.length) {
      for (var key in this.getMetadata()) {
        contentArgs.push(key);
      }
    }
    ratio = 1 / contentArgs.length;
    for (var i = 0, buffer, key = contentArgs[i]; i < contentArgs.length; i += 1) {
      if (key && (buffer = this.getMetadata(key))) {
        raw.push(buffer);
        buffer = stripTags(buffer).clip(limit * ratio, null, '\\s');
        buffer && result.push(buffer);
      }
    }
  }
  if (result.length < 1 && typeof param['default'] !== 'string') {
    return '<i>' + ngettext('{0} character', '{0} characters', raw.join(String.EMPTY).length) + '</i>';
  }
  return result.join(String.SPACE);
};

/**
 *
 * @param {Object} param
 */
Story.prototype.abstract_macro = function(param) {
  return res.write(this.getAbstract.call(this, param));
}

/**
 *
 * @param {Object} param
 * @param {String} mode
 */
Story.prototype.comments_macro = function(param, mode) {
  var story = this.story || this;
  var comments = this.story ? this : this.comments;
  if (story.isTransient() || story.site.commentMode === Site.DISABLED ||  story.commentMode === Site.CLOSED) {
    return;
  } else if (mode) {
    var n = comments.size() || 0;
    if (mode === 'count' || mode === 'size') {
      res.write(n);
    } else if (mode === 'link' || mode === 'summary') {
      var text = ngettext('{0} comment', '{0} comments', n);
      if (n < 1 || mode === 'summary') {
        res.write(text);
      } else {
        html.link({href: this.href() + '#comments'}, text);
      }
    }
  } else {
    this.prefetchChildren();
    this.forEach(function() {
      // FIXME: This interferes with (UIKit comment) lists because the <a> element is
      // between <ul> and <li> elements. Must be added to the skin from now on…?
      //html.openTag('a', {name: this._id});
      //html.closeTag('a');
      this.renderSkin(this.parent.constructor === Story ? 'Comment#main' : 'Comment#reply');
    });
  }
  return;
}

/**
 *
 * @param {Object} param
 * @param {String} mode
 */
Story.prototype.tags_macro = function(param, mode) {
  if (mode === 'link') {
    var tags = [];
    this.tags.list().forEach(function(item) {
      res.push();
      if (item.tag) {
        renderLink(param, item.tag.href(), item.tag.name);
        tags.push(res.pop());
      }
    });
    return res.write(tags.join(Tag.DELIMITER));
  } else if (mode === 'count') {
    return this.tags.count();
  }
  return res.write(this.getFormValue('tags'));
}

/**
 *
 * @param {Object} param
 * @param {Number} limit
 */
Story.prototype.referrers_macro = function(param, limit) {
  if (!User.require(User.PRIVILEGED) &&
      !Membership.require(Membership.OWNER)) {
    return;
  }

  limit = Math.min(limit || param.limit || 100, 100);
  if (limit < 1) {
    return;
  }

  var self = this;
  var sql = new Sql;
  sql.retrieve(Sql.REFERRERS, 'Story', this._id);

  res.push();
  var n = 0;
  sql.traverse(function() {
    if (n < limit && this.requests && this.referrer) {
      this.text = encode(this.referrer.head(50));
      this.referrer = encode(this.referrer);
      self.site.renderSkin('$Site#referrer', this);
    }
    n += 1;
  });
  res.data.list = res.pop();
  if (res.data.list) {
    this.site.renderSkin('$Site#referrerTable', param);
  }
  return;
}

/**
 *
 * @param {Object} value
 * @param {Object} param
 * @param {String} mode
 * @returns {String}
 */
Story.prototype.format_filter = function(value, param, mode) {
  if (value) {
    switch (mode) {
      case 'plain':
      return this.url_filter(stripTags(value), param, mode);

      case 'quotes':
      return stripTags(value).replace(/(?:\x22|\x27)/g, function(quote) {
        return '&#' + quote.charCodeAt(0) + ';';
      });

      case 'image':
      var image = HopObject.getFromPath(value, 'images');
      if (image) {
        res.push();
        image.render_macro(param);
        return res.pop();
      }
      break;

      default:
      value = this.macro_filter(format(value), param);
      value = this.url_filter(value, param);
      var parts = value.split(/(?:\n\n|\r\r|\r\n\r\n)/);
      value = '<p>' + parts.join('</p><p>') + '</p>';
      return value;
    }
  }
  return String.EMTPY;
}

/**
 * Enables certain macros for being used in a story or comment – thus, any content object.
 * @param {String|Skin} value A skin object or a string that is going to be turned into a skin object.
 * @returns {String}
 */
Story.prototype.macro_filter = function(value) {
  var skin = value.constructor === String ? createSkin(value) : value;

  Story.ALLOWED_MACROS.forEach(function(value, index) {
    skin.allowMacro(value);
  });

  var site;
  if (this.site !== res.handlers.site) {
    site = res.handlers.site;
    res.handlers.site = this.site;
  }
  value = this.renderSkinAsString(skin);
  site && (res.handlers.site = site);
  return value;
}

/**
 *
 * @param {String} value
 * @param {Object} param
 * @param {String} mode
 * @returns {String}
 */
Story.prototype.url_filter = function(value, param, mode) {
  param.limit || (param.limit = 50);
  var re = /(^|\/>|[(\[\s])(!?(?:https?|ftp):\/\/\S+?)([.,;:)\]"'!?]?)(?=[\s<]|$)/gim;
  return value.replace(re, function(str, head, url, tail) {
    if (url.startsWith('!')) {
      return head + url.substring(1) + tail;
    }
    res.push();
    res.write(head);
    if (mode === 'plain') {
      res.write(url.clip(param.limit));
    } else {
      var text, location = /:\/\/([^\/]*)/.exec(url)[1];
      text = location;
      if (mode === 'extended') {
        text = url.replace(/^.+\/([^\/]*)$/, '$1');
      }
      html.link({href: url, title: url}, text.clip(param.limit));
      if (mode === 'extended' && text !== location) {
        res.write(' <span class="uk-text-muted">(' + location + ')</span>');
      }
    }
    res.write(tail);
    return res.pop();
  });
}

/**
 * @returns {String}
 */
Story.prototype.getConfirmText = function() {
   return gettext("You are about to delete a story by user {0}.",
         this.creator ? this.creator.name : 'null');
}
