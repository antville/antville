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
   if (!this._parent.getPermission("main")) {
      return false;
   }
   switch (action) {
      case ".":
      case "main":
      case "create":
      return Site.require(Site.OPEN) && 
            Membership.require(Membership.SUBSCRIBER) ||
            Membership.require(Membership.CONTRIBUTOR) || 
            User.require(User.PRIVILEGED); 

      case "all":
      case "top":
      case "closed":
      return Membership.require(Membership.MANAGER) ||
            User.require(User.PRIVILEGED);
   }
   return false;
}

Stories.prototype.main_action = function() {
   var stories = User.getMembership().stories;
   res.data.list = renderList(stories, "$Story#listItem", 
         10, req.queryParams.page);
   res.data.pager = renderPager(stories, 
         this.href(req.action), 10, req.queryParams.page);
   res.data.title = gettext("Member stories of {0}", this._parent.title);
   res.data.body = this.renderSkinAsString("$Stories#main");
   this._parent.renderSkin("Site#page");
   return;
}

Stories.prototype.create_action = function() {
   var story = new Story;
   if (req.postParams.save) {
      try {
         story.update(req.postParams);
         this.add(story);
         // FIXME: To be removed if work-around for Helma bug #607 passes
         //story.setTags(req.postParams.tags || req.postParams.tag_array);
         story.notify(req.action);
         delete session.data.backup;
         res.message = gettext("The story was successfully created.");
         res.redirect(story.href());
      } catch (ex) {
         res.message = ex;
         app.log(ex);
      }
   }
   
   res.data.title = gettext("Add story to {0}", this._parent.title);
   res.data.action = this.href(req.action);
   res.data.body = story.renderSkinAsString("$Story#restore");
   res.data.body += story.renderSkinAsString("Story#edit");
   this._parent.renderSkin("Site#page");
   return;
}

Stories.prototype.closed_action = function() {
   res.data.list = renderList(this.closed, 
         "$Story#listItem", 10, req.queryParams.page);
   res.data.pager = renderPager(this.closed, 
         this.href(req.action), 10, req.queryParams.page);
   res.data.title = gettext("Private stories of {0}", this._parent.title);
   res.data.body = this.renderSkinAsString("$Stories#main");
   this._parent.renderSkin("Site#page");
   return;
}

Stories.prototype.all_action = function() {
   res.data.list = renderList(this, "$Story#listItem", 10, req.queryParams.page);
   res.data.pager = renderPager(this, 
         this.href(), 10, req.queryParams.page);
   res.data.title = gettext("Stories of {0}", this._parent.title);
   res.data.body = this.renderSkinAsString("$Stories#main");
   this._parent.renderSkin("Site#page");
   return;
}

Stories.prototype.top_action = function() {
   res.data.title = gettext("Top 25 most read stories of {0}", 
         this._parent.title);
   res.data.body = this.renderSkinAsString("$Stories#top");
   this._parent.renderSkin("Site#page");
   return;
}

Stories.prototype.list_macro = function(param, type) {
   switch (type) {
      case "top":
      var counter = 1;
      this.top.forEach(function() {
         this.renderSkin("$Story#top", {
            position: counter
         });
         counter += 1;
      }); 
      break;
   }
   return;
}

Stories.prototype.filter = function(prototype /*, switch1..n, limit */) {
   if (!prototype) {
      return new HopObject;
   }
   var args = Array.prototype.splice.call(arguments, 0, arguments.length);
   res.push();
   res.write('where site_id = ');
   res.write(this._parent._id);
   if (typeof args[args.length-1] !== "number") {
      args[args.length] = Infinity;
   }
   if (args.length > 2) {
      switch (args[1]) {
         case "stories":
         res.write(" and prototype = 'Story'");
         break;
         case "comments":
         res.write(" and prototype = 'Comment'");
         break;
      }
      switch (args[2]) {
         case "public":
         res.write(" and status <> 'closed'");
         break;
      }
      for (var i=1; i<args.length-1; i+=1) {
         res.write(args[i]);
         (i < args.length-2) && res.write(" and ");
      }
   }
   if (args[args.length-1] !== Infinity) {
      res.write(" limit ");
      res.write(args[args.length-1]);
   }
   this.all.subnodeRelation = res.pop();
   return this.all;
}

Stories.prototype.getTags = function(group) {
   return this._parent.getTags("tags", group);
}

Stories.prototype.getAdminHeader = function(name) {
   return ["#", "Tag", "Items"];
}

Stories.flushRequests = function() {
   for each (var entry in app.data.stories) {
      entry.story.requests += entry.requests;
      delete app.data.stories[entry.story._id];
      return;
   };
   return;
}
