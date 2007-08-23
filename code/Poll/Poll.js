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
Poll.prototype.main_action = function() {
   if (req.data.cancel)
      res.redirect(this.href());
   else if (req.data.vote) {
      if (!session.user)
         checkIfLoggedIn(this.href());
      try {
         res.message = this.evalVote(req.data, session.user);
         res.redirect(this.href("results"));
      } catch (err) {
         res.message = err.toString();
      }
   }
   res.data.action = this.href();
   res.data.title = getMessage("Poll.viewTitle", {question: this.question});
   res.data.body = this.renderSkinAsString("main");
   this.site.renderSkin("page");
   return;
};

/**
 * edit action
 */
Poll.prototype.edit_action = function() {
   // pre-process submitted choices
   var arr = new Array();
   if (req.data.title_array) {
      for (var i=0;i<req.data.title_array.length;i++) {
         var title = req.data.title_array[i].trim();
         if (title)
            arr[arr.length] = new Choice(title);
      }
   } else if (req.data.title) {
      var title = req.data.title.trim();
      if (title)
         arr[0] = new Choice(title);
   } else
      arr = this.list();

   if (req.data.cancel) {
      res.redirect(this.href());
   } else if (req.data.save) {
      try {
         res.message = this.evalPoll(req.data.question, arr, session.user);
         res.redirect(this.site.polls.href());
      } catch (err) {
         res.message = err.toString();
      }
   } else if (req.data.addchoice)
   	arr.push(new Choice(""));
   
   res.push();
   var max = Math.max(2, arr.length);
   for (var i=0;i<max;i++) {
      var c = arr[i] != null ? arr[i] : new Choice("");
    	c.renderSkin("edit", {count: (i+1).toString()});
   }
   res.data.choices = res.pop();
   res.data.action = this.href(req.action);
   res.data.title = getMessage("Poll.editTitle", {question: this.question});
   res.data.body = this.renderSkinAsString("edit");
   this.site.renderSkin("page");
   return;
};

/**
 * delete action
 */
Poll.prototype.delete_action = function() {
   var url = this._parent.href();
   if (req.data.cancel)
      res.redirect(url);
   else if (req.data.remove) {
      try {
         res.message = this.site.polls.deletePoll(this);
         res.redirect(url);
      } catch (err) {
         res.message = err.toString();
      }
   }
   
   res.data.action = this.href(req.action);
   res.data.title = getMessage("Poll.deleteTitle", {question: this.question});
   var skinParam = {
      description: getMessage("Poll.deleteDescription"),
      detail: this.question
   };
   res.data.body = this.renderSkinAsString("delete", skinParam);
   this.site.renderSkin("page");
   return;
};

/**
 * action renders the current result of a poll
 */
Poll.prototype.results_action = function() {
   res.data.title = getMessage("Poll.viewTitle", {question: this.question});
   res.data.body = this.renderSkinAsString("results");
   this.site.renderSkin("page");
   return;
};

/**
 * action toggles poll between closed and open
 */
Poll.prototype.toggle_action = function() {
   var closed = !this.closed;
   this.closed = closed ? 1 : 0;
   this.modifytime = new Date();
   res.redirect(this._parent.href());
   return;
};
/**
 * macro renders a poll's question
 * (either as text or editor)
 */
Poll.prototype.question_macro = function(param) {
   if (param.as == "editor")
      Html.textArea(this.createInputParam("question", param));
   else
      res.write(this.question);
   return;
};


/**
 * macro renders one choice of a poll
 * (either as text or as editor)
 */
Poll.prototype.choices_macro = function(param) {
   var vote;
   if (session.user && this.votes.get(session.user.name))
      vote = this.votes.get(session.user.name).choice;
   for (var i=0; i<this.size(); i++) {
      var choice = this.get(i);
      param.name = "choice";
      param.title = renderSkinAsString(createSkin(choice.title));
      param.value = choice._id;
      param.checked = "";
      if (choice == vote)
         param.checked = " checked=\"checked\"";
      res.write(choice.renderSkinAsString("main", param));
   }
   return;
};


/**
 * macro renders results of a poll as bar chart
 */
Poll.prototype.results_macro = function(param2) {
   for (var i=0; i<this.size(); i++) {
      var c = this.get(i);
      var param = new Object();
      param.title = c.title;
      param.count = c.size();
      param.percent = 0;
      if (param.count > 0) {
         param.percent = param.count.toPercent(this.votes.size());
         param.width = Math.round(param.percent * 2.5);
         param.graph = c.renderSkinAsString("graph", param);
         if (param.count == 1)
            param.text = " " + (param2.one ? param2.one : getMessage("Poll.votes.one"));
         else
            param.text = " " + (param2.more ? param2.more : getMessage("Poll.votes.more"));
      } else
         param.text = " " + (param2.no ? param2.no : getMessage("Poll.votes.no"));
      c.renderSkin("result", param);
   }
   return;
};


/**
 * macro renders totals of a poll
 */
Poll.prototype.total_macro = function(param) {
   var n = this.votes.size();
   if (n == 0)
      n += " " + (param.no ? param.no : getMessage("Poll.votes.no"));
   else if (n == 1)
      n += " " + (param.one ? param.one : getMessage("Poll.votes.one"));
   else
      n += " " + (param.more ? param.more : getMessage("Poll.votes.more"));
   return n;
};


/**
 * macro renders a link to the poll editor
 */
Poll.prototype.editlink_macro = function(param) {
   if (session.user) {
      try {
         this.checkEdit(session.user, res.data.memberlevel);
      } catch (deny) {
         return;
      }
      Html.link({href: this.href("edit")},
                param.text ? param.text : getMessage("generic.edit"));
   }
   return;
};


/**
 * macro rendering a link to delete a poll
 * (only if the user also is the creator)
 */
Poll.prototype.deletelink_macro = function(param) {
   if (session.user) {
      try {
         this.checkDelete(session.user, res.data.memberlevel);
      } catch (deny) {
         return;
      }
      Html.link({href: this.href("delete")},
                param.text ? param.text : getMessage("generic.delete"));
   }
   return;
};


/**
 * macro renders a link to the poll
 */
Poll.prototype.viewlink_macro = function(param) {
   try {
      if (!this.closed) {
         this.checkVote(session.user, res.data.memberlevel);
         Html.link({href: this.href()},
                   param.text ? param.text : getMessage("Poll.vote"));
      }
   } catch (deny) {
      return;
   }
   return;
};


/**
 * macro renders a link as switch to close/re-open a poll
 */
Poll.prototype.closelink_macro = function(param) {
   if (session.user) {
      try {
         this.checkDelete(session.user, res.data.memberlevel);
      } catch (deny) {
         return;
      }
      var str = this.closed ? getMessage("Poll.reopen") : getMessage("Poll.close");
      Html.link({href: this.href("toggle")},
                param.text ? param.text : str);
   }
   return;
};


/**
 * macro renders the time a poll was closed
 */
Poll.prototype.closetime_macro = function(param) {
   if (this.closed) {
      if (!param.format)
         param.format = "short";
      res.write(formatTimestamp(this.modifytime, param.format));
   }
   return;
};
/**
 * constructor function for poll objects
 */
Poll.prototype.constructor = function(question, creator) {
   this.question = question;
   this.creator = creator;
   this.closed = 0;
   this.createtime = this.modifytime = new Date();
   return this;
};


/**
 * check if poll is ok. if true, save modified poll
 * @param Object the req.data object coming in from the action
 * @param Object the user as creator of the poll modifications
 * @return Object containing the properties
 *                - error (boolean): true if error occured, false otherwise
 *                - message (String): an error or a confirmation message
 *                - url (String): the URL string of the poll
 *                - id (Number): the internal Hop ID of the poll
 */
Poll.prototype.evalPoll = function(question, choices, creator) {
   if (!question || !choices || choices.length < 2)
      throw new Exception("pollMissingValues");
   this.question = question;
   this.modifytime = new Date();
   for (var i=this.size(); i>0; i--)
      this.get(i-1).remove();
   for (var i=0;i<choices.length;i++)
      this.add(choices[i]);
   return new Message("pollCreate");
};


/**
 * check if a vote is ok. if true, save modified vote
 * @param Object the req.data object coming in from the action
 * @param Object the voting user object
 * @return Object containing the properties
 *                - error (boolean): true if error occured, false otherwise
 *                - message (String): an error or a confirmation message
 *                - url (String): the URL string of the poll
 */
Poll.prototype.evalVote = function(param, usr) {
   this.checkVote(usr, res.data.memberlevel);
	if (!param.choice)
	   throw new Exception("noVote");
	var c = this.get(param.choice);
	var v = usr ? this.votes.get(usr.name) : null;
	if (v) {
		v.choice = c;
		v.modifytime = new Date();
	} else
		this.votes.add(new Vote(c, usr));
	return new Message("Vote");
};

/**
 * function loops over the choices of a poll
 * and removes them
 */
Poll.prototype.deleteAll = function() {
   for (var i=this.size();i>0;i--) {
      var c = this.get(i-1);
      c.deleteAll();
      c.remove();
   }
   return true;
};
/**
 * permission check (called by hopobject.onRequest())
 * @param String name of action
 * @param Obj User object
 * @param Int Membership level
 * @return Obj Exception object or null
 */
Poll.prototype.checkAccess = function(action, usr, level) {
   try {
      switch (action) {
         case "edit" :
            checkIfLoggedIn();
            this.checkEdit(usr, level);
            break;
         case "delete" :
            checkIfLoggedIn();
            this.checkDelete(usr, level);
            break;
         case "results" :
            this.site.checkView(usr, level);
            break;
         case "toggle" :
            checkIfLoggedIn();
            this.checkDelete(usr, level);
            break;
      }
   } catch (deny) {
      res.message = deny.toString();
      res.redirect(this.site.polls.href());
   }
   return;
};

/**
 * check if user is allowed to vote in a poll
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */
Poll.prototype.checkVote = function(usr, level) {
   this.site.checkView(usr, level);
   if (this.closed)
      throw new DenyException("pollClosed");
   return;
};


/**
 * check if user is allowed to edit a poll
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */
Poll.prototype.checkEdit = function(usr, level) {
   if (this.votes.size() > 0)
      throw new DenyException("pollEdit");
   if (this.creator != usr && (level & MAY_EDIT_ANYSTORY) == 0)
      throw new DenyException("pollEdit");
   return;
};


/**
 * check if user is allowed to delete a poll
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */
Poll.prototype.checkDelete = function(usr, level) {
   if (this.creator != usr && (level & MAY_DELETE_ANYSTORY) == 0)
      throw new DenyException("pollDelete");
   return;
};
