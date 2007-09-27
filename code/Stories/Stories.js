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
// $Revision:3341 $
// $LastChangedBy:piefke3000 $
// $LastChangedDate:2007-09-27 00:22:37 +0200 (Thu, 27 Sep 2007) $
// $URL$
//

Stories.prototype.getPermission = function(action) {
   switch (action) {
      case ".":
      case "main":
      return true;
      case "create":
      case "member":
      case "private":
      return User.getPermission(User.PRIVILEGED) || 
            Membership.getPermission(Membership.OWNER) || 
            ((Site.getPermission(Site.OPEN) || story.mode === "open") && 
            Membership.getPermission(Membership.CONTRIBUTOR));
   }
   return false;
};

Stories.prototype.main_action = function() {
   res.data.list = renderList(this, "mgrlistitem", 10, req.queryParams.page);
   res.data.pager = renderPageNavigation(this, 
         this.href(), 10, req.queryParams.page);
   res.data.title = gettext("Public stories of {0}", this._parent.title);
   res.data.body = this.renderSkinAsString("main");
   this._parent.renderSkin("page");
   return;
};

Stories.prototype.create_action = function() {
   if (session.data.rescuedText) {
      restoreRescuedText();
   }
   
   var story = new Story();
   if (req.postParams.save) {
      //try {
         story.update(req.postParams);
         this.add(story);
         res.message = gettext("The story was successfully created.");
         res.redirect(story.href());
      //} catch (ex) {
      //   res.message = ex;
      //   app.log(ex);
      //}
   }
   
   res.data.title = gettext("Add story to {0}", this._parent.title);
   res.data.action = this.href("create");
   res.data.body = story.renderSkinAsString("edit");
   this._parent.renderSkin("page");
   return;
};

Stories.prototype.private_action = function() {
   res.data.list = renderList(this["private"], 
         "mgrlistitem", 10, req.queryParams.page);
   res.data.pager = renderPageNavigation(this.offline, 
         this.href(req.action), 10, req.queryParams.page);
   res.data.title = gettext("Private stories of {0}", this._parent.title);
   res.data.body = this.renderSkinAsString("main");
   this._parent.renderSkin("page");
   return;
};

Stories.prototype.member_action = function() {
   var membership = this._parent.members.get(session.user.name);
   res.data.list = renderList(membership.stories, 
         "mgrlistitem", 10, req.queryParams.page);
   res.data.pager = renderPageNavigation(membership.stories, 
         this.href(req.action), 10, req.queryParams.page);
   res.data.title = gettext("Member stories of {0}", this._parent.title);
   res.data.body = this.renderSkinAsString("main");
   this._parent.renderSkin("page");
   return;
};

Stories.prototype.checkAccess = function(action, usr, level) {
   try {
      switch (action) {
         case "main" :
            checkIfLoggedIn(this.href(req.action));
            this.checkAdd(usr, level);
            break;
         case "offline" :
            checkIfLoggedIn(this.href(req.action));
            this.checkAdd(usr, level);
            break;
         case "mystories" :
            checkIfLoggedIn(this.href(req.action));
            this.checkAdd(usr, level);
            break;
         case "create" :
            if (!usr)
               rescueText(req.data);
            checkIfLoggedIn(this.href(req.action));
            this.checkAdd(usr, level);
            break;
      }
   } catch (deny) {
      res.message = deny.toString();
      res.redirect(this._parent.href());
   }
   return;
};

Stories.prototype.checkAdd = function(usr, level) {
   if (!this._parent.properties.get("usercontrib") && (level & MAY_ADD_STORY) == 0)
      throw new DenyException("storyAdd");
   return;
};

Stories.prototype.getTags = function(group) {
   return this._parent.getTags("tags", group);
};

Stories.prototype.getAdminHeader = function(name) {
   return ["#", "Tag", "Items"];
};
