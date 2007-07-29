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
PollMgr.prototype.main_action = function() {
   res.data.pollList = renderList(this, "mgrlistitem", 10, req.data.page);
   res.data.pagenavigation = renderPageNavigation(this, this.href(), 10, req.data.page);
   res.data.title = getMessage("Poll.listTitle", {siteTitle: this._parent.title});
   res.data.body = this.renderSkinAsString("main");
   this._parent.renderSkin("page");
   return;
};

/**
 * main action
 */
PollMgr.prototype.open_action = function() {
   res.data.pollList = renderList(this.open, "mgrlistitem", 10, req.data.page);
   res.data.pagenavigation = renderPageNavigation(this.open, this.href(req.action), 10, req.data.page);
   res.data.title = getMessage("Poll.listOpenPollsTitle", {siteTitle: this._parent.title});
   res.data.body = this.renderSkinAsString("main");
   this._parent.renderSkin("page");
   return;
};

/**
 * main action
 */
PollMgr.prototype.mypolls_action = function() {
   var ms = this._parent.members.get(session.user.name);
   res.data.pollList = renderList(ms.polls, "mgrlistitem", 10, req.data.page);
   res.data.pagenavigation = renderPageNavigation(ms.polls, this.href(req.action), 10, req.data.page);
   res.data.title = getMessage("Poll.listMyPollsTitle", {siteTitle: this._parent.title});
   res.data.body = this.renderSkinAsString("main");
   this._parent.renderSkin("page");
   return;
};

/**
 * action for creating new Polls
 */
PollMgr.prototype.create_action = function() {
   // pre-process submitted choices
   var arr = new Array();
   if (req.data.title_array) {
      for (var i=0;i<req.data.title_array.length;i++) {
         var title = req.data.title_array[i].trim();
         if (title)
            arr[arr.length] = new Choice(title);
      }
   } else if (req.data.title && req.data.title.trim()) {
      arr[0] = new Choice(req.data.title.trim());
   }

   if (req.data.cancel) {
      res.redirect(this.href());
   } else if (req.data.save) {
      try {
         res.message = this.evalNewPoll(req.data.question, arr, session.user);
         res.redirect(this.href());
      } catch (err) {
         res.message = err.toString();
      }
   } else if (req.data.addchoice)
   	arr.push(new Choice(""));

   var newPoll = new Poll();

   res.push();
   var max = Math.max(2, arr.length);
   for (var i=0;i<max;i++) {
      var c = arr[i] ? arr[i] : new Choice("");
    	c.renderSkin("edit", {count: (i+1).toString()});
   }
   res.data.choices = res.pop();
   res.data.action = this.href(req.action);
   res.data.title = getMessage("Poll.addPoll", {siteTitle: this._parent.title});
   res.data.body = newPoll.renderSkinAsString("edit");
   this._parent.renderSkin("page");
   return;
};
/**
 * check if poll is ok. if true, save new Poll
 * @param Object the req.data object coming in from the action
 * @param Object the user as creator of the poll
 * @return Object containing the properties
 *                - error (boolean): true if error occured, false otherwise
 *                - message (String): an error or a confirmation message
 *                - url (String): the URL string of the poll
 *                - id (Number): the internal Hop ID of the poll
 */
PollMgr.prototype.evalNewPoll = function(question, choices, creator) {
   if (!question || !choices || choices.length < 2)
      throw new Exception("pollMissing");
   var newPoll = new Poll(question, creator);
   this.add(newPoll);
   for (var i=0; i<choices.length; i++)
      newPoll.add(choices[i]);
   return new Message("pollCreate");
};


/**
 * delete a poll and all its choices and votes
 * @param Object the poll to be removed
 * @return Object containing the properties
 *                - error (boolean): true if error occured, false otherwise
 *                - message (String): an error or a confirmation message
 */
PollMgr.prototype.deletePoll = function(pollObj) {
   pollObj.deleteAll();
   pollObj.remove();
   return new Message("pollDelete");
};


/**
 * set a poll to closed state
 * @param Object the poll to be closed
 * @return Object containing the properties
 *                - error (boolean): true if error occured, false otherwise
 *                - message (String): an error or a confirmation message
 */

PollMgr.prototype.closePoll = function(currPoll) {
   currPoll.closed = 1;
   return new Message("pollClose");
};
/**
 * permission check (called by hopobject.onRequest())
 * @param String name of action
 * @param Obj User object
 * @param Int Membership level
 * @return Obj Exception object or null
 */
PollMgr.prototype.checkAccess = function(action, usr, level) {
   try {
      switch (action) {
         case "main" :
            checkIfLoggedIn(this.href(req.action));
            var url = this._parent.href();
            this.checkAdd(usr, level);
            break;
         case "open" :
            checkIfLoggedIn(this.href(req.action));
            var url = this._parent.href();
            this.checkAdd(usr, level);
            break;
         case "mypolls" :
            checkIfLoggedIn(this.href(req.action));
            var url = this._parent.href();
            this.checkAdd(usr, level);
            break;
         case "create" :
            checkIfLoggedIn();
            var url = this.href();
            this.checkAdd(usr, level);
            break;
      }
   } catch (deny) {
      res.message = deny.toString();
      res.redirect(url);
   }
   return;
};

/**
 * function checks if user is allowed to view the storylist
 * of this site
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */
PollMgr.prototype.checkAdd = function(usr, level) {
   if (!this._parent.preferences.get("usercontrib") && (level & MAY_ADD_STORY) == 0)
      throw new DenyException("pollAdd");
   return;
};
