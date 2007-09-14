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
// $Revision:3329 $
// $LastChangedBy:piefke3000 $
// $LastChangedDate:2007-09-14 15:18:09 +0200 (Fri, 14 Sep 2007) $
// $URL$
//

Members.prototype.main_action = function() {
   res.data.title = gettext("Members of {0}", this._parent.title);
   res.data.list = renderList(this, "mgrlistitem", 10, req.data.page);
   res.data.pager = renderPageNavigation(this, this.href(req.action), 10, 
         req.data.page);
   res.data.body = this.renderSkinAsString("main");
   res.handlers.site.renderSkin("page");
   return;
};

Members.prototype.register_action = function() {
   if (req.postParams.register) {      
      try {
         var user = User.register(req.postParams);
         // Subscribe user to this site if public
         if (res.handlers.site && res.handlers.site.online) {
            this.add(new Membership(user));
         }
         var title = getTitle();
         if (root.sys_email) {
            var sp = {name: user.name};
            sendMail(root.sys_email, user.email, 
                  gettext('Welcome to "{0}"!', title),
                  this.renderSkinAsString("mailregconfirm", sp));
         }
         var url = session.data.referrer || this._parent.href();
         delete session.data.referrer;
         res.message = gettext('Welcome to "{0}", {1}. Have fun!',
               title, user.name);
         res.redirect(url);
      } catch (ex) {
         app.log(ex);
         res.message = ex;
      }
   }

   session.data.token = User.getSalt();
   res.data.action = this.href(req.action);
   res.data.title = gettext("Login");
   res.data.body = this.renderSkinAsString("register");
   this._parent.renderSkin("page");
   return;
};

Members.prototype.login_action = function() {
   if (req.postParams.login) {
      try {
         var user = User.login(req.postParams);
         var url = session.data.referrer || this._parent.href();
         delete session.data.referrer;
         res.message = gettext('Welcome to "{0}", {1}. Have fun!',
               res.handlers.context.getTitle(), user.name);
         res.redirect(url);
      } catch (ex) {
         res.message = ex;
         app.log(ex);
      }
   }

   if (!session.data.referrer) {
      session.data.referrer = req.data.http_referer;
   }
   session.data.token = User.getSalt();
   res.data.action = this.href(req.action);
   res.data.title = gettext("Login");
   res.data.body = this.renderSkinAsString("login");
   this._parent.renderSkin("page");
   return;
};

Members.prototype.logout_action = function() {
   if (session.user) {
     res.message = gettext("Good bye, {0}! Lookin' forward to seeing you again!", 
           session.user.name);
     session.logout();
     delete session.data.referrer;
     res.setCookie("avUsr", "");
     res.setCookie("avPw", "");
   }
   res.redirect(this._parent.href());
   return;
};

Members.prototype.edit_action = function() {
   if (req.postParams.save) {
      try {
         session.user.update(req.postParams);
         res.message = gettext("The changes were saved successfully.");
         res.redirect(this._parent.href());
      } catch (err) {
         res.message = err.toString();
      }
   }

   session.data.token = User.getSalt();
   session.data.salt = session.user.value("salt"); // FIXME
   res.data.title = gettext("Profile of user {0}", session.user.name);
   res.data.body = session.user.renderSkinAsString("edit");
   this._parent.renderSkin("page");
   return;
};

Members.prototype.salt_js_action = function() {
   var user;
   if (user = User.getByName(req.params.user)) {
      res.write((user.value("salt") || String.EMPTY).toSource());
   }
   return;
};

Members.prototype.subscribers_action = function() {
   res.data.title = gettext("Subscribers of {0}", this._parent.title);
   res.data.list = renderList(this.subscribers, "mgrlistitem", 10, 
         req.data.page);
   res.data.pager = renderPageNavigation(this.subscribers, 
         this.href(req.action), 10, req.data.page);
   res.data.body = this.renderSkinAsString("main");
   res.handlers.site.renderSkin("page");
   return;
};

Members.prototype.contributors_action = function() {
   res.data.title = gettext("Contributors of {0}", this._parent.title);
   res.data.list = renderList(this.contributors, "mgrlistitem", 10, 
         req.data.page);
   res.data.pager = renderPageNavigation(this.contributors, 
         this.href(req.action), 10, req.data.page);
   res.data.body = this.renderSkinAsString("main");
   res.handlers.site.renderSkin("page");
   return;
};

Members.prototype.managers_action = function() {
   res.data.title = gettext("Managers of {0}", this._parent.title);
   res.data.list = renderList(this.managers, "mgrlistitem", 10, 
         req.data.page);
   res.data.pager = renderPageNavigation(this.managers, 
         this.href(req.action), 10, req.data.page);
   res.data.body = this.renderSkinAsString("main");
   res.handlers.site.renderSkin("page");
   return;
};

Members.prototype.owners_action = function() {
   res.data.title = gettext("Owners of {0}", this._parent.title);
   res.data.list = renderList(this.owners, "mgrlistitem", 10, 
         req.data.page);
   res.data.pager = renderPageNavigation(this.owners, 
         this.href(req.action), 10, req.data.page);
   res.data.body = this.renderSkinAsString("main");
   res.handlers.site.renderSkin("page");
   return;
};

Members.prototype.updated_action = function() {
   res.data.title = gettext("Updated sites for user {0}", session.user.name);
   res.data.list = session.user.renderSkinAsString("sitelist");
   res.data.body = session.user.renderSkinAsString("subscriptions");
   res.handlers.site.renderSkin("page");
   return;
};

Members.prototype.subscriptions_action = function() {
   res.data.title = gettext("Subscriptions of user {0}", session.user.name);
   res.data.list = renderList(session.user.subscriptions, "subscriptionlistitem");
   res.data.body = session.user.renderSkinAsString("subscriptions");
   res.handlers.context.renderSkin("page");
   return;
};

Members.prototype.memberships_action = function() {
   res.data.title = gettext("Memberships of user {0}", session.user.name);
   res.data.list = renderList(session.user.memberships, "subscriptionlistitem");
   res.data.body = session.user.renderSkinAsString("subscriptions");
   res.handlers.context.renderSkin("page");
   return;
};

Members.prototype.add_action = function() {
   if (req.postParams.term) {
      try {
         var result = this.search(req.postParams.term);
         if (result.length < 1) {
            res.message = gettext("Found no user matching the search input.");
         } else {
            if (result.length >= 100) {
               res.message = gettext("Found too many users, displaying the first {0} matches only.", 
                     result.length);
            } else {
               res.message = ngettext("Found one user matching the search input.",
                     "Found {0} users matching the search input.", 
                      result.length);
            }
            res.data.result = this.renderSkinAsString("searchresult", result);
         }
      } catch (ex) {
         res.message = ex;
         app.log(ex);
      }
   } else if (req.postParams.add) {
      try {
         var membership = this.addMembership(req.postParams);
         var message = this.renderSkinAsString("mailnewmember", {
            site: res.handlers.site.title,
            creator: session.user.name,
            url: res.handlers.site.href(),
            account: req.postParams.name
         });
         // FIXME:
         //sendMail(root.sys_email, result.obj.user.email,
         //      getMessage("mail.newMember", result.obj.site.title), message);
         res.message = gettext("Successfully added {0} to the list of members.", 
               req.postParams.name);
         res.redirect(membership.href("edit"));
      } catch (ex) {
         res.message = ex;
         app.log(ex);
      }
      res.redirect(this.href());
   } else {
      res.message = gettext("Enter a search term to display a list of matching users.");
   }
   res.data.action = this.href(req.action);
   res.data.title = gettext('Add member to {0}', this._parent.title);
   res.data.body = this.renderSkinAsString("new");
   res.handlers.context.renderSkin("page");
   return;
};

Members.prototype.search = function(searchString) {
   var mode = "= '";
   if (searchString.contains("*")) {
      searchString = searchString.replace(/\*/g, "%");
      mode = "like '";
   }
   var dbConn = getDBConnection("antville");
   var query = "select name from user where name " + mode + searchString + 
         "' order by name asc";
   var rows = dbConn.executeRetrieval(query);
   var counter = 0, name;
   res.push();
   while (rows.next() && counter < 100) {
      name = rows.getColumnItem("name");
      // Continue if the user is already a member
      if (this.get(name)) {
         continue;
      };
      this.renderSkin("searchresultitem", {name :name});
      counter += 1;
   }
   rows.release();
   return {
      result: res.pop(),
      length: counter
   };
};

Members.prototype.addMembership = function(data) {
   var user = root.users.get(data.name);
   if (!user) {
      throw Error(gettext("Sorry, your input did not match any registered user."));
   } else if (this.get(data.name)) {
      throw Error(gettext("This user is already a member of this site."));
   }
   var membership = new Membership(user);
   this.add(membership);
   return membership;
};

/* FIXME: obsolete?
Members.prototype.renderMemberlist = function() {
   var currLvl = null;
   res.push();
   for (var i=0;i<this.size();i++) {
      var m = this.get(i);
      if (m.level != currLvl) {
         this.renderSkin("membergroup", {group: getRole(m.level)});
         currLvl = m.level;
      }
      m.renderSkin("mgrlistitem");
   }
   return res.pop();
};
*/

Members.prototype.getPermission = function(action) {
   switch (action) {
      case ".":
      case "main":
      case "owners":
      case "managers":
      case "contributors":
      case "subscribers":
      case "add":
      return User.getPermission(User.PRIVILEGED) ||
            Membership.getPermission(Membership.OWNER) || 
            Membership.getPermission(Membership.MANAGER);
      
      case "updated":
      case "memberships":
      case "subscriptions":
      return !!session.user;
   }
   return true;
};

Members.prototype.modSorua_action = function() {
   if (!app.data.modSorua) app.data.modSorua = new Array();
   var returnUrl = req.data["sorua-return-url"];
   var failUrl   = req.data["sorua-fail-url"];
   var userID    = req.data["sorua-user"];
   var action    = req.data["sorua-action"];
   if (action == "authenticate") {    // authenticate-action
      if (session.user && (userID == null || userID == "" || session.user.name == userID)) {
         // store returnUrl + timestamp + userID
         app.data.modSorua[returnUrl] = {time: new Date(), userID: session.user.name}; 
         res.redirect(returnUrl);
      } else if (failUrl) {
         res.redirect(failUrl);
      } else {
         session.data.modSorua = {returnUrl: returnUrl,
                                 userID: userID};
         res.redirect(this.href("modSoruaLoginForm"));
      }

   } else if (action == "verify") {
      // first remove outdated entries
      var now = new Date();
      var arr = new Array();
      for (var i in app.data.modSorua) {
         if (app.data.modSorua[i] && app.data.modSorua[i].time &&
            now.valueOf() - app.data.modSorua[i].time.valueOf() < 1000 * 60)
            arr[i] = app.data.modSorua[i];
      }
      app.data.modSorua = arr;
      // now check whether returnUrl has been used recently
      if (app.data.modSorua[returnUrl]) {
         res.status = 200;
         res.write("user:" + app.data.modSorua[returnUrl].userID);
         return;
      } else {
         res.status = 403;
         return;
      }

   } else { // handle wrong call of AuthURI
     res.redirect(root.href("main"));

   }   
};

Members.prototype.modSoruaLoginForm_action = function() {
   if (!session.data.modSorua || !session.data.modSorua.returnUrl) 
      res.redirect(root.href()); // should not happen anyways
   if (req.data.login) {
      try {
         res.message = this.evalLogin(req.data.name, req.data.password);
         var returnUrl = session.data.modSorua.returnUrl;
         app.data.modSorua[returnUrl] = {time: new Date(), userID: req.data.name};
         res.redirect(returnUrl);
      } catch (err) {
         res.message = err.toString();
      }      
   }
   res.data.action = this.href("modSoruaLoginForm");
   this.renderSkin("modSorua");
};

Members.getByName = function(name) {
   var site = res.handlers.site;
   if (site) {
      return site.members.get(name);
   }
   return null;
};
