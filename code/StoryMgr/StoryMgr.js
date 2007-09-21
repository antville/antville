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

/**
 * main action
 */
StoryMgr.prototype.main_action = function() {
   res.data.storylist = renderList(this, "mgrlistitem", 10, req.data.page);
   res.data.pagenavigation = renderPageNavigation(this, this.href(), 10, req.data.page);
   res.data.title = getMessage("Story.onlineStoriesTitle", {siteTitle: this._parent.title});
   res.data.body = this.renderSkinAsString("main");
   this._parent.renderSkin("page");
   return;
};

StoryMgr.prototype.offline_action = function() {
   res.data.storylist = renderList(this.offline, "mgrlistitem", 10, req.data.page);
   res.data.pagenavigation = renderPageNavigation(this.offline, this.href(req.action), 10, req.data.page);
   res.data.title = getMessage("Story.offlineStoriesTitle", {siteTitle: this._parent.title});
   res.data.body = this.renderSkinAsString("main");
   this._parent.renderSkin("page");
   return;
};

/**
 * list all stories of a user inside the site the
 * membership belongs to
 */
StoryMgr.prototype.mystories_action = function() {
   var ms = this._parent.members.get(session.user.name);
   res.data.storylist = renderList(ms.stories, "mgrlistitem", 10, req.data.page);
   res.data.pagenavigation = renderPageNavigation(ms.stories, this.href(req.action), 10, req.data.page);
   res.data.title = getMessage("Story.myStoriesTitle", {siteTitle: this._parent.title});
   res.data.body = this.renderSkinAsString("main");
   this._parent.renderSkin("page");
   return;
};

/**
 * action for creating a new Story
 */
StoryMgr.prototype.create_action = function() {
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
/**
 * function checks if story fits to the minimal needs (must have at least a text ;-)
 * @param Obj story-object to work on
 * @param Obj Object containing the properties needed for creating a new Story
 * @param Obj User-Object creating this story
 * @return Obj Object containing three properties:
 *             - error (boolean): true if error happened, false if everything went fine
 *             - message (String): containing a message to user
 *             - story (Obj): story-object containing assigned form-values
 *             - id (Int): id of created story
 */

StoryMgr.prototype.evalNewStory = function(param, creator) {
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

/**
 * permission check (called by hopobject.onRequest())
 * @param String name of action
 * @param Obj User object
 * @param Int Membership level
 * @return Obj Exception object or null
 */
StoryMgr.prototype.checkAccess = function(action, usr, level) {
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

/**
 * function checks if user is allowed to access the storymanager
 * of this site
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */
StoryMgr.prototype.checkAdd = function(usr, level) {
   if (!this._parent.properties.get("usercontrib") && (level & MAY_ADD_STORY) == 0)
      throw new DenyException("storyAdd");
   return;
};

StoryMgr.prototype.getTags = function(group) {
   return this._parent.getTags("tags", group);
};

StoryMgr.prototype.getAdminHeader = function(name) {
   return ["#", "Tag", "Items"];
};
