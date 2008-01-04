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

relocateProperty(Membership, "username", "name");
relocateProperty(Membership, "createtime", "created");
relocateProperty(Membership, "modifytime", "modified");
relocateProperty(Membership, "user", "creator");

delete Membership.prototype.createtime_macro;
delete Membership.prototype.modifytime_macro;

Membership.prototype.username_macro = function(param) {
   if (param.linkto && (param.linkto != "edit" || this.user != session.user))
      Html.link({href: this.href(param.linkto)}, this.username);
   else
      res.write(this.username);
   return;
};

Membership.prototype.url_macro = function(param) {
   var url;
   if (url = this.user.url) {
      if (param.as === "link") {
         delete param.as;
         link_filter(url, param, url);
      } else {
         res.write(url);
      }
   }
   return;
};

Membership.prototype.level_macro = function(param) {
   if (param.as === "editor") {
      this.select_macro(param, "level");
   } else {
      res.write(this.role);
   }
   return;
};

Membership.prototype.editlink_macro = function(param) {
   if (this.creator !== session.user) {
      this.link_filter(param.text || getMessage("generic.edit"), 
            param, this.href("edit")); 
   }
   return;
};

Membership.prototype.deletelink_macro = function(param) {
   if (this.role !== Membership.OWNER)
      Html.link({href: this.href("delete")},
                param.text ? param.text : getMessage("generic.remove"));
   return;
};

Membership.prototype.unsubscribelink_macro = function(param) {
   if (this.role === Membership.SUBSCRIBER) {
      this.link_filter(param.text || getMessage("Membership.unsubscribe"), 
            param, this.site.href("unsubscribe"));
   }
   return;
};

Membership.prototype.checkAccess = function(action, usr, level) {
   try {
      this._parent.checkEditMembers(usr, level);
   } catch (deny) {
      res.message = deny.toString();
      res.redirect(this.site.href());
   }
   return;
};
