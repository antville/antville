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

defineConstants(Poll, "getStatus", "closed", "private", "public");

Poll.prototype.constructor = function(question) {
   this.question = question;
   this.status = 'closed';
   this.creator = this.modifier = session.user;
   this.created = this.modified = new Date;
   return this;
};

Poll.prototype.getPermission = function(action) {
   switch (action) {
      case ".":
      case "main":
      return !!session.user;
      case "results":
      return true;
      case "edit":
      return this.status === Poll.CLOSED;
      case "delete":
      case "rotate":
      return User.require(User.PRIVILEGED) || 
            Membership.require(Membership.MANAGER);
   }
   return false;
};

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
         text = gettext("close");
      } else {
         text = this.closed ? gettext("re-open") : gettext("open");  
      }
      break;
   }
   return HopObject.prototype.link_macro.apply(this, arguments);
};

Poll.prototype.main_action = function() {
   if (this.status === "closed") {
      res.message = gettext("Sorry, this poll is closed. Voting is not possible.");
      res.redirect(this.href("results"));
      return;
   }
   if (req.postParams.vote) {
      try {
         this.vote(req.postParams);
         res.message = gettext("Thanks, your vote was registered. You can change your vote until the poll is closed.");
         res.redirect(this.href("results"));
      } catch (ex) {
         res.message = ex;
         app.log(ex);
      }
   }
   res.data.action = this.href();
   res.data.title = gettext("Poll {0}", this.question);
   res.data.body = this.renderSkinAsString("main");
   this.site.renderSkin("page");
   return;
};

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
		this.votes.add(new Vote(choice));
	}
	return;
};

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
   res.data.title = gettext("Edit poll {0}", this.question);
   res.data.body = this.renderSkinAsString("edit");
   this.site.renderSkin("page");
   return;
};

Poll.prototype.input_macro = function(param, name) {
   switch (name) {
      case "choices":
      var index = 1;
      var add = function(choice) {
         return choice.renderSkin("edit", {index: index++});
      };
      var choices;
      if (choices = req.postParams.title_array) {
         while (choices.length < 2) {
            choices.push(null);
         }
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
};

Poll.prototype.update = function(data) {
   var choices = [];
   for each (var title in data.title_array) {
      if (title = title.trim()) {
         choices.push(title);
      }
   }
   data.title_array = choices;
   if (choices.length < 2 || !data.question) {
      throw Error(gettext("Please fill out the whole form to create a valid poll."));
   }
   while (this.size() > 0) {
      Choice.remove.call(this.get(0));
   }
   for (var i=0; i<choices.length; i+=1) {
      this.add(new Choice(choices[i]));
   }
   this.question = data.question;
   this.touch();
   return;
};

Poll.remove = function() {
   if (this.constructor !== Poll) {
      return;
   }
   while (this.size() > 0) {
      Choice.remove.call(this.get(0));
   }
   this.remove();
   return;
};

Poll.prototype.results_action = function() {
   res.data.title = gettext('Results of poll "{0}"', this.question);
   res.data.body = this.renderSkinAsString("results");
   this.site.renderSkin("page");
   return;
};

Poll.prototype.rotate_action = function() {
   if (this.status === Poll.CLOSED) {
      this.status = Poll.OPEN;
   } else if (this.status === Poll.OPEN) {
      this.status = Poll.CLOSED;
      this.closed = new Date;
   }
   this.touch();
   return res.redirect(this._parent.href() + "#" + this._id);
};

Poll.prototype.votes_macro = function(param) {
   return this.votes.size();
};

Poll.prototype.closed_macro = function(param, format) {
   if (this.status === Poll.CLOSED) {
      res.write(formatDate(this.closed, param.format || format));
   }
   return;
};
