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

Poll.getStatus = defineConstants(Poll, "closed", "open");

Poll.prototype.constructor = function(question) {
   this.question = question;
   this.creator = this.modifier = session.user;
   this.created = this.modified = new Date;
   return this;
};

Poll.prototype.getPermission = function(action) {
   if (!this._parent.getPermission("main")) {
      return false;
   }
   switch (action) {
      case ".":
      case "main":
      case "result":
      return true;
      case "edit":
      return this.status === Poll.CLOSED ||
            Membership.require(Membership.OWNER) ||
            User.require(User.PRIVILEGED);
      case "rotate":
      case "delete":
      return this.creator === session.user || 
            Membership.require(Membership.MANAGER) ||
            User.require(User.PRIVILEGED);            
   }
   return false;
};

Poll.prototype.getFormOptions = function(name) {
   switch (name) {
      case "status":
      return Poll.getStatus();
   }
   return;
}

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
         text = gettext("Close");
      } else {
         text = this.closed ? gettext("Re-open") : gettext("Open");  
      }
      break;
  }
   return HopObject.prototype.link_macro.call(this, param, action, text);
};

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
   res.data.title = gettext("Poll {0}", this.question);
   res.data.body = this.renderSkinAsString("Poll#main");
   this.site.renderSkin("Site#page");
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
   res.data.body = this.renderSkinAsString("Poll#edit");
   this.site.renderSkin("Site#page");
   return;
};

Poll.prototype.input_macro = function(param, name) {
   switch (name) {
      case "choices":
      var index = 0;
      var add = function(choice) {
         index += 1;
         return choice.renderSkin("Choice#edit", {index: index});
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
   if (data.save !== Poll.CLOSED) {
      delete this.closed;
   } else if (this.status) {
      this.closed = new Date;
   }
   this.status = data.save;
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

Poll.prototype.result_action = function() {
   res.data.title = gettext('Results of poll "{0}"', this.question);
   res.data.body = this.renderSkinAsString("Poll#results");
   this.site.renderSkin("Site#page");
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
   return res.redirect(this.href());
   //return res.redirect(this._parent.href() + "#" + this._id);
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
