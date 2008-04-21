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

// FIXME: Won't be called because Members.getPermissions() disallows it
Members.prototype.sendpwd_action = function() {
   res.data.title = gettext("Recover your password");
   res.data.body = gettext("Due to security reasons user passwords are not stored in the Antville database any longer. Thus, your password cannot be sent to you, either. Please use the password reset option.");
   this._parent.renderSkin("Site#page");
   return;
}

Members.prototype.subscribelink_macro = function(param) {
   return res.handlers.site.link_macro(param, "subscribe");
}

Members.prototype.subscriptionslink_macro = function(param) {
   return this.link_macro(param, "subscriptions");
}

Members.prototype.membership_macro = function(param) {
   return res.handlers.membership.role;
}
