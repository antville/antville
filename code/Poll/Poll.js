// The Antville Project
// http://code.google.com/p/antville
//
// Copyright 2007-2011 by Tobi Schäfer.
//
// Copyright 2001–2007 Robert Gaggl, Hannes Wallnöfer, Tobi Schäfer,
// Matthias & Michael Platzer, Christoph Lincke.
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

/**
 * @fileOverview Defines the Poll prototype
 */

markgettext("Poll");
markgettext("poll");

/**
 * @function
 * @param {String} ctor
 * @returns {String[]}
 * @see defineConstants
 */
Poll.getStatus = defineConstants(Poll, markgettext("closed"), markgettext("open"));

/**
 * @param {String} question
 */
Poll.add = function(data, site) {
   HopObject.confirmConstructor('Poll');
   var poll = new Poll;
   poll.creator = session.user;
   poll.created = new Date;
   poll.update(data);
   site.polls.add(poll);
   return poll;
}

/**
 * 
 */
Poll.remove = function() {
   if (this.constructor === Poll) {
      HopObject.remove.call(this);
      this.remove();
   }
   return;
}

/**
 * @name Poll
 * @constructor
 * @param {String} question
 * @property {Choice[]} _children
 * @property {String} closed
 * @property {Date} created
 * @property {User} creator
 * @property {Date} modified
 * @property {User} modifier
 * @property {String} question
 * @property {Site} site
 * @property {String} status
 * @property {Vote[]} votes
 * @extends HopObject
 */
Poll.prototype.constructor = function() {
   HopObject.confirmConstructor(this);
   return this;
}

/**
 * 
 * @param {String} action
 * @returns {Boolean}
 */
Poll.prototype.getPermission = function(action) {
   if (!this.site.getPermission("main")) {
      return false;
   }
   switch (action) {
      case ".":
      case "main":
      return !!session.user;
      case "result":
      return true;
      case "edit":
      return Membership.require(Membership.OWNER) ||
            User.require(User.PRIVILEGED);
      case "rotate":
      case "delete":
      return this.creator === session.user || 
            Membership.require(Membership.MANAGER) ||
            User.require(User.PRIVILEGED);            
   }
   return false;
}

/**
 * 
 * @param {String} name
 * @returns {Object}
 */
Poll.prototype.getFormOptions = function(name) {
   switch (name) {
      case "status":
      return Poll.getStatus();
   }
   return;
}

Poll.prototype.main_action = function() {
   if (this.status !== Poll.OPEN) {
      res.redirect(this.href("result"));
      return;
   }
   if (req.postParams.vote) {
      try {
         this.vote(req.postParams);
         res.message = gettext("Thanks, your vote was registered. You can change your mind until the poll is closed.");
         res.redirect(this.href("result"));
      } catch (ex) {
         res.message = ex;
         app.log(ex);
      }
   }
   res.data.action = this.href();
   res.data.title = gettext("Poll: {0}", this.question);
   res.data.body = this.renderSkinAsString("$Poll#main", {header: true});
   this.site.renderSkin("Site#page");
   return;
}

/**
 * 
 * @param {Object} data
 */
Poll.prototype.vote = function(data) {
	if (!data.choice) {
	   throw Error(gettext("You did not vote, yet. You can vote until the poll is closed."));
	}
	var choice = this.get(data.choice);
	var vote = session.user && this.votes.get(session.user.name);
	if (vote) {
		vote.choice = choice;
		vote.modified = new Date;
	} else {
	   vote = Vote.add(choice, this);
	}
	return vote;
}

Poll.prototype.edit_action = function() {
   if (req.postParams.save) {
      try {
         this.update(req.postParams);
         res.message = gettext("The poll was updated successfully.");
         res.redirect(this.href());
      } catch (ex) {
         res.message = ex;
         app.log(ex);
      }
   }
   res.data.action = this.href(req.action);
   res.data.title = gettext("Edit Poll: {0}", this.question);
   res.data.body = this.renderSkinAsString("$Poll#edit");
   this.site.renderSkin("Site#page");
   return;
}

/**
 * 
 * @param {Object} data
 */
Poll.prototype.update = function(data) {
   var choices = [];
   for each (var title in data.title_array) {
      if (title = title.trim()) {
         choices.push(title);
      }
   }
   if (choices.length < 2 || !data.question) {
      throw Error(gettext("Please fill out the whole form to create a valid poll."));
   }
   var size = this.size();
   // Update or remove choices
   for (var i=size-1; i>-1; i-=1) {
      var choice = this.get(i);
      var title = choices[i];
      if (title) {
         choice.title = title;
         choice.touch();
      } else {
         Choice.remove.call(choice);
      }
   }
   // Add new choices
   for (var i=size; i<choices.length; i+=1) {
      Choice.add(choices[i], this);
   }
   if (data.save !== Poll.CLOSED) {
      delete this.closed;
   } else if (this.status === Poll.OPEN) {
      this.closed = new Date;
   }
   this.status = data.save;
   this.question = data.question;
   this.touch();
   return;
}

Poll.prototype.result_action = function() {
   res.data.title = gettext('Poll Results: {0}', this.question);
   res.data.body = this.renderSkinAsString("$Poll#results", {header: true});
   this.site.renderSkin("Site#page");
   return;
}

Poll.prototype.rotate_action = function() {
   if (this.status === Poll.CLOSED) {
      this.status = Poll.OPEN;
   } else if (this.status === Poll.OPEN) {
      this.status = Poll.CLOSED;
      this.closed = new Date;
   }
   this.touch();
   return res.redirect(this.href());
}

/**
 * @returns {String}
 */
Poll.prototype.getConfirmText = function() {
   return gettext("You are about to delete a poll by user {0}.", 
         this.creator.name);
}

/**
 * 
 * @param {Object} param
 * @param {String} action
 * @param {String} text
 * @see HopObject#link_macro
 */
Poll.prototype.link_macro = function(param, action, text) {
   switch (action) {
      case ".":
      case "main":
      if (this.status === Poll.CLOSED) {
         return;
      }
      break;
      case "rotate":
      if (this.status === Poll.OPEN) {
         text = gettext("Stop");
      } else {
         text = this.closed ? gettext("Re-run") : gettext("Run");  
      }
      break;
  }
   return HopObject.prototype.link_macro.call(this, param, action, text);
}

/**
 * 
 * @param {Object} param
 * @param {String} name
 * @see HopObject#link_macro
 */
Poll.prototype.input_macro = function(param, name) {
   switch (name) {
      case "choices":
      var index = 0;
      var add = function(choice) {
         index += 1;
         return choice.renderSkin("$Choice#edit", {index: index});
      };
      var choices;
      if (choices = req.postParams.title_array) {
         choices.forEach(function(title) {
            return add(new Choice(title));
         });
      } else {
         this.forEach(function() {
            return add(this);
         });
      }
      return;
   }
   return HopObject.prototype.input_macro.apply(this, arguments);
}

/**
 * 
 */
Poll.prototype.votes_macro = function() {
   return this.votes.size();
}

/**
 * 
 * @param {Object} param
 * @param {String} format
 */
Poll.prototype.closed_macro = function(param, format) {
   if (this.status === Poll.CLOSED) {
      res.write(formatDate(this.closed, param.format || format));
   }
   return;
}
