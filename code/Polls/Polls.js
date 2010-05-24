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
// $Revision:3346 $
// $LastChangedBy:piefke3000 $
// $LastChangedDate:2007-10-04 20:48:35 +0200 (Thu, 04 Oct 2007) $
// $URL$
//

/**
 * @fileOverview Defines the Polls prototype
 */

markgettext("Polls");
markgettext("polls");

/**
 * @name Polls
 * @constructor
 * @property {Poll[]} _children
 * @property {Poll[]} open
 * @extends HopObject
 */

/**
 * 
 * @param {String} action
 * @returns {Boolean}
 */
Polls.prototype.getPermission = function(action) {
   if (!this._parent.getPermission("main")) {
      return false;
   }
   switch (action) {
      case ".":
      case "main":
      case "create":
      case "running":
      return Site.require(Site.OPEN) && session.user ||
            Membership.require(Membership.CONTRIBUTOR) ||
            User.require(User.PRIVILEGED);
      case "all":
      return Membership.require(Membership.MANAGER) ||
            User.require(User.PRIVILEGED);
   }
   return false;
}

Polls.prototype.main_action = function() {
   var polls = User.getMembership().polls;
   res.data.list = renderList(polls, "$Poll#listItem", 10, req.queryParams.page);
   res.data.pager = renderPager(polls, this.href(req.action), 
         10, req.queryParams.page);
   res.data.title = gettext("Member Polls");
   res.data.body = this.renderSkinAsString("$Polls#main");
   this._parent.renderSkin("Site#page");
   return;
}

Polls.prototype.create_action = function() {
   var poll = new Poll;
   if (req.postParams.save) {
      try {
         poll.update(req.postParams);
         this.add(poll);
         poll.notify(req.action);
         res.message = gettext("The poll was created successfully.");
         res.redirect(poll.href());
      } catch (err) {
         res.message = err.toString();
      }
   } else {
      req.postParams.title_array = [,,];
   }
   res.data.action = this.href(req.action);
   res.data.title = gettext("Add Poll");
   res.data.body = poll.renderSkinAsString("$Poll#edit");
   this._parent.renderSkin("Site#page");
   return;
}

Polls.prototype.running_action = function() {
   res.data.list = renderList(this.running, 
         "$Poll#listItem", 10, req.queryParams.page);
   res.data.pager = renderPager(this.running, 
         this.href(req.action), 10, req.queryParams.page);
   res.data.title = gettext("Running Polls");
   res.data.body = this.renderSkinAsString("$Polls#main");
   this._parent.renderSkin("Site#page");
   return;
}

Polls.prototype.all_action = function() {
   res.data.list = renderList(this, "$Poll#listItem", 10, req.queryParams.page);
   res.data.pager = renderPager(this, 
         this.href(), 10, req.queryParams.page);
   res.data.title = gettext("All Polls");
   res.data.body = this.renderSkinAsString("$Polls#main");
   this._parent.renderSkin("Site#page");
   return;
}
