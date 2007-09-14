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

MemberMgr.prototype.main_action = function() {
   this.renderView(this, gettext("Members"));
   return;
};

MemberMgr.prototype.register_action = function() {
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

MemberMgr.prototype.login_action = function() {
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

MemberMgr.prototype.logout_action = function() {
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

MemberMgr.prototype.create_action = function() {
   if (req.postParams.keyword) {
      try {
         var result = this.searchUser(req.postParams.keyword);
         res.message = result.toString();
         res.data.searchresult = this.renderSkinAsString("searchresult", 
               {result: result.obj});
      } catch (err) {
         res.message = err.toString();
      }
   } else if (req.postParams.add) {
      try {
         var result = this.evalNewMembership(req.postParams.username, 
               session.user);
         res.message = result.toString();
         // send confirmation mail
         var sp = new Object();
         sp.site = result.obj.site.title;
         sp.creator = session.user.name;
         sp.url = result.obj.site.href();
         sp.account = result.obj.user.name;
         var mailbody = this.renderSkinAsString("mailnewmember", sp);
         sendMail(root.sys_email, result.obj.user.email,
               getMessage("mail.newMember", result.obj.site.title), mailbody);
         res.redirect(result.obj.href("edit"));
      } catch (err) {
         res.message = err.toString();
         if (err instanceof MailException)
            res.redirect(result.obj.href("edit"));
         res.redirect(this.href());
      }
   }
   res.data.action = this.href(req.action);
   res.data.title = getMessage("MemberMgr.searchTitle", 
         {siteTitle: this._parent.title});
   res.data.body = this.renderSkinAsString("new");
   res.handlers.context.renderSkin("page");
   return;
};

MemberMgr.prototype.edit_action = function() {
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

MemberMgr.prototype.salt_js_action = function() {
   var user;
   if (user = User.getByName(req.params.user)) {
      res.write((user.value("salt") || String.EMPTY).toSource());
   }
   return;
};

MemberMgr.prototype.subscribers_action = function() {
   this.renderView(this.subscribers, gettext("Subscribers"));
   return;
};

MemberMgr.prototype.contributors_action = function() {
   this.renderView(this.contributors, gettext("Contributors"));
   return;
};

MemberMgr.prototype.managers_action = function() {
   this.renderView(this.managers, gettext("Content Managers"));
   return;
};

MemberMgr.prototype.admins_action = function() {
   this.renderView(this.admins, gettext("Administrators"));
   return;
};

MemberMgr.prototype.updated_action = function() {
   res.data.title = gettext("Updated sites for user {0}", session.user.name);
   res.data.list = session.user.renderSkinAsString("sitelist");
   res.data.body = session.user.renderSkinAsString("subscriptions");
   res.handlers.site.renderSkin("page");
   return;
};

MemberMgr.prototype.subscriptions_action = function() {
   this.renderSubscriptionView(session.user.subscriptions, 
         gettext("Subscriptions"));
   return;
};

MemberMgr.prototype.memberships_action = function() {
   this.renderSubscriptionView(session.user.memberships, 
         gettext("Memberships"));
   return;
};

MemberMgr.prototype.sendPwd = function(email) {
   if (!email)
      throw new Exception("emailMissing");
   var sqlClause = "select USER_NAME,USER_PASSWORD from AV_USER where USER_EMAIL = '" + email + "'";
   var dbConn = getDBConnection("antville");
   var dbResult = dbConn.executeRetrieval(sqlClause);
   var cnt = 0;
   var pwdList = "";
   while (dbResult.next()) {
      pwdList += getMessage("MemberMgr.userName") + ": " + dbResult.getColumnItem("USER_NAME") + "\n";
      pwdList += getMessage("MemberMgr.password") + ": " + dbResult.getColumnItem("USER_PASSWORD") + "\n\n";
      cnt++;
   }
   dbResult.release;
   if (!cnt)
      throw new Exception("emailNoAccounts");
   // now we send the mail containing all accounts for this email-address
   var mailbody = this.renderSkinAsString("mailpassword", {text: pwdList});
   sendMail(root.sys_email, email, getMessage("mail.sendPwd"), mailbody);
   return new Message("mailSendPassword");
};

MemberMgr.prototype.searchUser = function(key) {
   var dbConn = getDBConnection("antville");
   var dbError = dbConn.getLastError();
   if (dbError)
      throw new Exception("database", dbError);
   var query = "select USER_NAME,USER_URL from AV_USER ";
   query += "where USER_NAME like '%" + key + "%' order by USER_NAME asc";
   var searchResult = dbConn.executeRetrieval(query);
   var dbError = dbConn.getLastError();
   if (dbError)
      throw new Exception("database", dbError);
   var found = 0;
   res.push();
   while (searchResult.next() && found < 100) {
      var name = searchResult.getColumnItem("USER_NAME");
      var url = searchResult.getColumnItem("USER_URL");
      // do nothing if the user is already a member
      if (this.get(name))
         continue;
      var sp = {name: name,
                description: (url ? Html.linkAsString({href: url}, url) : null)};
      this.renderSkin("searchresultitem", sp);
      found++;
   }
   dbConn.release();
   switch (found) {
      case 0:
         throw new Exception("resultNoUser");
      case 1:
         return new Message("resultOneUser", null, res.pop());
      case 100:
         return new Message("resultTooManyUsers", null, res.pop());
      default:
         return new Message("resultManyUsers", found, res.pop());
   }
};

MemberMgr.prototype.evalNewMembership = function(username, creator) {
   var newMember = root.users.get(username);
   if (!newMember)
      throw new Exception("resultNoUser");
   else if (this.get(username))
      throw new Exception("userAlreadyMember");
   try {
      var ms = new Membership(newMember);
      this.add(ms);
      return new Message("memberCreate", ms.user.name, ms);
   } catch (err) {
      throw new Exception("memberCreate", username);
   }
   return;
};

MemberMgr.prototype.renderMemberlist = function() {
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

MemberMgr.prototype.renderView = function(collection, title) {
   if (this._parent != root) {
      res.data.title = getMessage("MemberMgr.viewListTitle", {title: title, siteName: this._parent.title});
      res.data.memberlist = renderList(collection, "mgrlistitem", 10, req.data.page);
      res.data.pagenavigation = renderPageNavigation(collection, this.href(req.action), 10, req.data.page);
      res.data.body = this.renderSkinAsString("main");
      res.handlers.context.renderSkin("page");
   }
   return;
};

MemberMgr.prototype.renderSubscriptionView = function(collection, title) {
   var list = collection.list();
   list.sort(function(a, b) {
      var title1 = a.value("site").value("title").toLowerCase();
      var title2 = b.value("site").value("title").toLowerCase();
      if (title1 > title2) {
         return 1;
      } else if (title1 < title2) {
         return -1;
      }
      return 0;      
   });
   res.data.title = getMessage("MemberMgr.subscriptionsTitle", 
         {titel: title, userName: session.user.name});
   res.data.list = renderList(list, "subscriptionlistitem");
   res.data.body = session.user.renderSkinAsString("subscriptions");
   res.handlers.context.renderSkin("page");
   return;
};

MemberMgr.prototype.checkAccess = function(action, usr, level) {
   var deny = null;
   try {
      switch (action) {
         case "main" :
         case "admins" :
         case "managers" :
         case "contributors" :
         case "subscribers" :
         case "create" :
         checkIfLoggedIn(this.href(action));
         this.checkEditMembers(usr, level);
         break;
         
         case "updated" :
         case "memberships" :
         case "subscriptions" :
         case "edit" :
         checkIfLoggedIn(this.href(action));
         break;
      }
   } catch (deny) {
      res.message = deny.toString();
      res.redirect(this._parent.href());
   }
   return;
};

MemberMgr.prototype.modSorua_action = function() {
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

MemberMgr.prototype.modSoruaLoginForm_action = function() {
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

MemberMgr.getByName = function(name) {
   var site = res.handlers.site;
   if (site) {
      return site.members.get(name);
   }
   return null;
};
