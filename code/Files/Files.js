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
// $Revision:3339 $
// $LastChangedBy:piefke3000 $
// $LastChangedDate:2007-09-25 00:00:46 +0200 (Tue, 25 Sep 2007) $
// $URL$
//

Files.prototype.getPermission = function(action) {
   if (!this._parent.getPermission("main")) {
      return false;
   }
   switch (action) {
      case ".":
      case "main":
      case "create":
      return Site.require(Site.OPEN) && session.user ||
            Membership.require(Membership.CONTRIBUTOR) ||
            User.require(User.PRIVILEGED);
      case "all":
      return Membership.require(Membership.MANAGER) ||
            User.require(User.PRIVILEGED);
   }
   return false;
}

Files.prototype.create_action = function() {
   var file = new File;
   file.site = res.handlers.site;
   if (req.postParams.save) {
      try {
         file.update(req.postParams);
         this.add(file);
         file.notify(req.action);
         res.message = gettext('The file was added successfully. Its name is "{0}"', file.name);
         res.redirect(this.href());
      } catch (ex) {
         res.message = ex;
         app.log(ex);
      }
   }
   
   res.data.action = this.href(req.action);
   res.data.title = gettext("Add file to site {0}", this._parent.title);
   res.data.body = file.renderSkinAsString("$File#edit");
   this._parent.renderSkin("Site#page");
   return;
}

Files.prototype.main_action = function() {
   var files = User.getMembership().files;
   res.data.list = renderList(files, "$File#listItem", 10, req.queryParams.page);
   res.data.pager = renderPager(files, this.href(), 
         10, req.queryParams.page);
   res.data.title = gettext("Member files of {0}", this._parent.title);
   res.data.body = this.renderSkinAsString("$Files#main");
   this._parent.renderSkin("Site#page");
   return;
}

Files.prototype.all_action = function() {
   res.data.list = renderList(this, "$File#listItem", 10, req.queryParams.page);
   res.data.pager = renderPager(this, 
         this.href(), 10, req.queryParams.page);
   res.data.title = gettext("Files of {0}", this._parent.title);
   res.data.body = this.renderSkinAsString("$Files#main");
   this._parent.renderSkin("Site#page");
   return;
}
