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
TopicMgr.prototype.main_action = function() {
   res.data.title = getMessage("TopicMgr.mainTitle", {title: this._parent.title});
   res.data.body = this.renderSkinAsString ("main");
   this._parent.renderSkin("page");
   return;
};
/**
 * function renders the list of topics as links
 */
TopicMgr.prototype.topiclist_macro = function(param) {
   if (!this.size())
      return;
   for (var i=0;i<this.size();i++) {
      var topic = this.get(i);
      res.write(param.itemprefix);
      Html.link({href: topic.href()}, topic.groupname);
      res.write(param.itemsuffix);
   }
   return;
};
/**
 * permission check (called by hopobject.onRequest())
 * @param String name of action
 * @param Obj User object
 * @param Int Membership level
 * @return Obj Exception object or null
 */
TopicMgr.prototype.checkAccess = function(action, usr, level) {
   if (!this._parent.online)
      checkIfLoggedIn();
   try {
      this._parent.checkView(usr, level);
   } catch (deny) {
      res.message = deny.toString();
      res.redirect(root.href());
   }
   return;
};
