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
 * @fileOverview Defines the Stories prototype
 */

markgettext('Stories');
markgettext('stories');

/**
 * @name Stories
 * @constructor
 * @property {Story[]} _children
 * @property {Tag[]} alphabeticalTags
 * @property {Story[]} closed
 * @property {Comment[]} comments
 * @property {Story[]} featured
 * @property {Tag[]} otherTags
 * @property {Story[]} recent
 * @property {Tag[]} tags
 * @property {Story[]} top
 * @property {Story[]} union
 * @extends HopObject
 */

/**
 *
 * @param {String} action
 * @returns {Boolean}
 */
Stories.prototype.getPermission = function(action) {
  if (!this._parent.getPermission('main')) {
    return false;
  }
  switch (action) {
    case '.':
    case 'main':
    case 'top':
    case 'closed':
    case 'create':
    case 'render':
    case 'user':
    return Site.require(Site.OPEN) && session.user ||
        Membership.require(Membership.CONTRIBUTOR) ||
        User.require(User.PRIVILEGED);
  }
  return false;
}

Stories.prototype.main_action = function() {
  res.data.list = renderList(this, '$Story#listItem', 25, req.queryParams.page);
  res.data.pager = renderPager(this, this.href(req.action), 25, req.queryParams.page);
  res.data.title = gettext('Stories');
  res.data.body = this.renderSkinAsString('$Stories#main');
  this._parent.renderSkin('Site#page');
  return;
}

Stories.prototype.create_action = function() {
  if (req.data.save) {
    try {
      story = Story.add(req.params);
      story.notify(req.action);
      JSON.sendPaddedResponse(story._id);
      delete session.data.backup;
      res.message = gettext('The story was successfully created.');
      res.redirect(story.href());
    } catch (ex) {
      JSON.sendPaddedResponse(null);
      res.status = 400;
      res.message = ex;
      app.log(ex);
    }
  }
  res.data.title = gettext('Add Story');
  res.data.action = this.href(req.action);
  HopObject.confirmConstructor(Story);
  var story = new Story();
  res.data.body = story.renderSkinAsString('Story#edit');
  res.data.body += story.renderSkinAsString('$Story#wysiwyg');
  res.data.body += story.renderSkinAsString('$Story#extract');
  this._parent.renderSkin('Site#page');
  return;
}

Stories.prototype.closed_action = function() {
  res.data.list = renderList(this.closed, '$Story#listItem', 25, req.queryParams.page);
  res.data.pager = renderPager(this.closed, this.href(req.action), 25, req.queryParams.page);
  res.data.title = gettext('Closed Stories');
  res.data.body = this.renderSkinAsString('$Stories#main');
  this._parent.renderSkin('Site#page');
  return;
}

Stories.prototype.user_action = function() {
  var stories = User.getMembership().stories;
  res.data.list = renderList(stories, '$Story#listItem', 25, req.queryParams.page);
  res.data.pager = renderPager(stories, this.href(), 25, req.queryParams.page);
  res.data.title = gettext('Stories by {0}', session.user.name);
  res.data.body = this.renderSkinAsString('$Stories#main');
  this._parent.renderSkin('Site#page');
  return;
}

Stories.prototype.top_action = function() {
  res.data.list = renderList(this.top, '$Story#listItem', 25);
  res.data.title = gettext('Top Stories');
  res.data.body = this.renderSkinAsString('$Stories#main');
  this._parent.renderSkin('Site#page');
  return;
}

Stories.prototype.render_action = function () {
  var content = String(req.postParams.http_post_remainder);
  var story = new Story;
  story.site = res.handlers.site;
  var result = Story.prototype.macro_filter.call(story, content);
  res.write(result);
};

/**
 *
 * @param {Object} param
 * @param {String} type
 */
Stories.prototype.list_macro = function(param, type) {
  switch (type) {
    case 'top':
    var counter = 1;
    this.top.forEach(function() {
      this.renderSkin('$Story#top', {
        position: counter
      });
      counter += 1;
    });
    break;
  }
  return;
}

/**
 *
 * @param {String} group
 * @returns {Tag[]}
 * @see Site#getTags
 */
Stories.prototype.getTags = function(group) {
  return this._parent.getTags('tags', group);
}
