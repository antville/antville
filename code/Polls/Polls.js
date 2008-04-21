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

Polls.prototype.getPermission = function(action) {
   if (!this._parent.getPermission("main")) {
      return false;
   }
   switch (action) {
      case ".":
      case "main":
      case "create":
      case "open":
      return Site.require(Site.OPEN) || 
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
   res.data.list = renderList(polls, "Poll#listItem", 10, req.queryParams.page);
   res.data.pager = renderPager(polls, this.href(req.action), 
         10, req.queryParams.page);
   res.data.title = gettext("Member polls of {0}", this._parent.title);
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
   res.data.title = gettext("Add poll to site {0}", this._parent.title);
   res.data.body = poll.renderSkinAsString("Poll#edit");
   this._parent.renderSkin("Site#page");
   return;
}

Polls.prototype.open_action = function() {
   res.data.list = renderList(this.open, 
         "Poll#listItem", 10, req.queryParams.page);
   res.data.pager = renderPager(this.open, 
         this.href(req.action), 10, req.queryParams.page);
   res.data.title = gettext("Open polls of {0}", this._parent.title);
   res.data.body = this.renderSkinAsString("$Polls#main");
   this._parent.renderSkin("Site#page");
   return;
}

Polls.prototype.all_action = function() {
   res.data.list = renderList(this, "Poll#listItem", 10, req.queryParams.page);
   res.data.pager = renderPager(this, 
         this.href(), 10, req.queryParams.page);
   res.data.title = gettext("Polls of {0}", this._parent.title);
   res.data.body = this.renderSkinAsString("$Polls#main");
   this._parent.renderSkin("Site#page");
   return;
}
