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

Stories.prototype.main_action = function() {
   this.years.forEach(function() {res.debug(this.size())});
   res.abort();
   res.data.list = renderList(this, "mgrlistitem", 10, req.queryParams.page);
   res.data.pager = renderPageNavigation(this, 
         this.href(), 10, req.queryParams.page);
   res.data.title = gettext("Public stories of {0}", this._parent.title);
   res.data.body = this.renderSkinAsString("main");
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

Stories.prototype.create_action = function() {
   // restore any rescued text
   if (session.data.rescuedText)
      restoreRescuedText();
   
   var s = new Story();
   s.discussions = this._parent.properties.get("discussions");
   // storing referrer in session-cache in case user clicks cancel later
   if (!session.data.referrer && req.data.http_referer)
      session.data.referrer = req.data.http_referer;
   
   if (req.data.cancel) {
      var url = session.data.referrer ? session.data.referrer : this.href();
      session.data.referrer = null;
      res.redirect(url);
   } else if (req.data.save || req.data.publish) {
      //try {
         var result = this.evalNewStory(req.data, session.user);
         res.message = result.toString();
         session.data.referrer = null;
         res.redirect(result.url);
      //} catch (err) {
         res.message = err.toString();
      //}
   }
   
   res.data.title =  getMessage("Story.addStoryTo", {siteTitle: this._parent.title});
   res.data.action = this.href("create");
   res.data.body = s.renderSkinAsString("edit");
   this._parent.renderSkin("page");
   return;
};

Stories.prototype.evalNewStory = function(param, creator) {
   var s = new Story(creator, param.http_remotehost);
   s.evalStory(param, creator);
   
   if (!this.add(s)) {
      throw new Exception("storyCreate");
   }
   
   // FIXME: Why must this come after the add() when calling s.evalStory()?
   var content = extractContent(param, s.content.get());
   s.content.set(content.value);

   // Update tags of the story
   s.setTags(param.tags || param.tags_array);
    
   // send e-mail notification
   if (s.site.isNotificationEnabled()) {
      s.site.sendNotification("create", s);
   }

   var result = new Message("storyCreate", null, s);
   result.id = s._id;
   if (s.online) {
      s.site.lastupdate = s.modifytime;
      result.url = s.href();
   } else {
      result.url = this.href();
   }
   return result;
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
