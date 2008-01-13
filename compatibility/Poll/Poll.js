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

Poll.prototype.total_macro = function(param) {
   var n = this.votes.size();
   if (n == 0)
      n += " " + (param.no || gettext("votes"));
   else if (n == 1)
      n += " " + (param.one || gettext("vote"));
   else
      n += " " + (param.more || gettext("votes"));
   return n;
};

Poll.prototype.toggle_action = function() {
   var closed = !this.closed;
   this.closed = closed ? 1 : 0;
   this.modifytime = new Date();
   res.redirect(this._parent.href());
   return;
};

Poll.prototype.question_macro = function(param) {
   if (param.as == "editor")
      Html.textArea(this.createInputParam("question", param));
   else
      res.write(this.question);
   return;
};
   
Poll.prototype.closetime_macro = function(param, format) {
   formar || (format = param.format);
   return this.closed_macro(param, format);
};

Poll.prototype.results_macro = function() {
   this.forEach(function() {
      this.renderSkin()
   });
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
            param.text = " " + (param2.one || gettext("vote"));
         else
            param.text = " " + (param2.more || gettext("votes"));
      } else
         param.text = " " + (param2.no || gettext("votes"));
      c.renderSkin("result", param);
   }
   return;
};

Poll.prototype.editlink_macro = function(param) {
   if (session.user) {
      try {
         this.checkEdit(session.user, res.data.memberlevel);
      } catch (deny) {
         return;
      }
      Html.link({href: this.href("edit")},
                param.text || gettext("edit"));
   }
   return;
};

Poll.prototype.deletelink_macro = function(param) {
   if (session.user) {
      try {
         this.checkDelete(session.user, res.data.memberlevel);
      } catch (deny) {
         return;
      }
      Html.link({href: this.href("delete")},
                param.text || gettext("delete"));
   }
   return;
};

Poll.prototype.viewlink_macro = function(param) {
   try {
      if (!this.closed) {
         this.checkVote(session.user, res.data.memberlevel);
         Html.link({href: this.href()},
                   param.text || gettext("vote"));
      }
   } catch (deny) {
      return;
   }
   return;
};

Poll.prototype.closelink_macro = function(param) {
   if (session.user) {
      try {
         this.checkDelete(session.user, res.data.memberlevel);
      } catch (deny) {
         return;
      }
      var str = this.closed ? gettext("re-open") : gettext("close");
      Html.link({href: this.href("toggle")},
                param.text ? param.text : str);
   }
   return;
};
