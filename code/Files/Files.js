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

Files.prototype.getPermission = function(action) {
   switch (action) {
      case ".":
      case "main":
      case "create":
      case "member":
      return User.getPermission(User.PRIVILEGED) ||
            Membership.getPermission(Membership.MANAGER) ||
            Site.getPermission(Site.OPEN);
   }
   return false;
};

Files.prototype.create_action = function() {
   var file = new File;
   if (req.postParams.save) {
      try {
         file.update(req.postParams);
         this.add(file);
         res.message = gettext('The file was added successfully. Its name is "{0}"', this.name);
         res.redirect(this.href());
      } catch (ex) {
         res.message = ex;
         app.log(ex);
      }
   }
   
   res.data.action = this.href(req.action);
   res.data.title = gettext("Add a file to {0}", this._parent.title);
   res.data.body = file.renderSkinAsString("File#form");
   this._parent.renderSkin("page");
   return;
};

Files.prototype.main_action = function() {
   res.data.list = renderList(this, "mgrlistitem", 10, req.queryParams.page);
   res.data.pager = renderPageNavigation(this, 
         this.href(), 10, req.queryParams.page);
   res.data.title = gettext("Files of {0}", this._parent.title);
   res.data.body = this.renderSkinAsString("main");
   this._parent.renderSkin("page");
   return;
};

Files.prototype.member_action = function() {
   var membership = this._parent.members.get(session.user.name);
   res.data.list = renderList(membership.files, 
         "mgrlistitem", 10, req.queryParams.page);
   res.data.pager = renderPageNavigation(membership.files, 
         this.href(), 10, req.queryParams.page);
   res.data.title = gettext("Member files of {0}", this._parent.title);
   res.data.body = this.renderSkinAsString("main");
   this._parent.renderSkin("page");
   return;
};
