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
// $Revision$
// $LastChangedBy$
// $LastChangedDate$
// $URL$
//

Polls.prototype.getPermission = function(action) {
   switch (action) {
      case ".":
      case "main":
      case "public":
      return !!session.user;
      case "create":
      return User.require(User.PRIVLEGED) ||
            Membership.require(Membership.MANAGER);
   }
   return true;
};

Polls.prototype.main_action = function() {
   res.data.list = renderList(this, "mgrlistitem", 10, req.queryParams.page);
   res.data.pager = renderPageNavigation(this, 
         this.href(), 10, req.queryParams.page);
   res.data.title = gettext("Polls of {0}", this._parent.title);
   res.data.body = this.renderSkinAsString("main");
   this._parent.renderSkin("page");
   return;
};

Polls.prototype.public_action = function() {
   res.data.list = renderList(this.open, 
         "mgrlistitem", 10, req.queryParams.page);
   res.data.pager = renderPageNavigation(this.open, 
         this.href(req.action), 10, req.queryParams.page);
   res.data.title = gettext("Open polls of {0}", this._parent.title);
   res.data.body = this.renderSkinAsString("main");
   this._parent.renderSkin("page");
   return;
};

Polls.prototype.member_action = function() {
   var membership = this._parent.getMembership();
   res.data.list = renderList(membership.polls, 
         "mgrlistitem", 10, req.queryParams.page);
   res.data.pager = renderPageNavigation(membership.polls, 
         this.href(req.action), 10, req.queryParams.page);
   res.data.title = gettext("Member polls of {0}", this._parent.title);
   res.data.body = this.renderSkinAsString("main");
   this._parent.renderSkin("page");
   return;
};

Polls.prototype.create_action = function() {
   var poll = new Poll;
   if (req.postParams.save) {
      try {
         poll.update(req.postParams);
         this.add(poll);
         res.message = "The poll was created successfully.";
         res.redirect(poll.href());
      } catch (err) {
         res.message = err.toString();
      }
   } else {
      req.postParams.title_array = [,,];
   }
   res.data.action = this.href(req.action);
   res.data.title = gettext("Add poll to {0}", this._parent.title);
   res.data.body = poll.renderSkinAsString("edit");
   this._parent.renderSkin("page");
   return;
};
