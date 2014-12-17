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
 * @fileOverview Defines the Comments prototype.
 */

Comments.prototype.main_action = function () {
  var Comments = User.getMembership().comments;
  res.data.list = renderList(Comments, '$Comment#listItem', 25, req.queryParams.page);
  res.data.pager = renderPager(Comments, this.href(), 25, req.queryParams.page);
  res.data.title = gettext('Comments by {0}', session.user.name);
  res.data.body = this.renderSkinAsString('$Comments#main');
  this._parent.renderSkin('Site#page');
}

Comments.prototype.all_action = function () {
  res.data.title = gettext('Comments');
  res.data.list = renderList(this, '$Comment#listItem', 25, req.queryParams.page);
  res.data.pager = renderPager(this, this.href(req.action), 25, req.queryParams.page);
  res.data.body = this.renderSkinAsString('$Comments#main');
  res.handlers.site.renderSkin('Site#page');
  return;
};
