/**
 * main action, lists all members in alpabetical order
 */
function main_action() {
   this.renderView(this, "Members");
   return;
}

/**
 * list all subscribers of a site
 */
function subscribers_action() {
   this.renderView(this.subscribers, "Subscribers");
   return;
}

/**
 * list all contributors of a site
 */
function contributors_action() {
   this.renderView(this.contributors, "Contributors");
   return;
}

/**
 * list all content managers of a site
 */
function managers_action() {
   this.renderView(this.managers, "Content Managers");
   return;
}

/**
 * list all admins of a site
 */
function admins_action() {
   this.renderView(this.admins, "Administrators");
   return;
}

/**
 * action for displaying the last updated 
 * site list of a user's subscriptions
 */
function updated_action() {
   res.data.title = "Updated sites for user " + session.user.name;
   res.data.sitelist = session.user.renderSkinAsString("sitelist");
   res.data.body = session.user.renderSkinAsString("subscriptions");
   res.handlers.context.renderSkin("page");
   return;
}

/**
 * action for displaying subscriptions of a user
 */
function subscriptions_action() {
   this.renderSubscriptionView(session.user.subscriptions, "Subscriptions");
   return;
}

/**
 * action for displaying memberships of a user
 */
function memberships_action() {
   this.renderSubscriptionView(session.user.memberships, "Memberships");
   return;
}

/**
 * action for creating a new membership
 */
function create_action() {
   if (req.data.cancel)
      res.redirect(this.href());
   else if (req.data.keyword) {
      try {
         var result = this.searchUser(req.data.keyword);
         res.message = result.toString();
         res.data.searchresult = this.renderSkinAsString("searchresult", {result: result.obj});
      } catch (err) {
         res.message = err.toString();
      }
   } else if (req.data.add) {
      try {
         var result = this.evalNewMembership(req.data.username, session.user);
         res.message = result.toString();
         // send confirmation mail
         var sp = new Object();
         sp.site = result.obj.site.title;
         sp.creator = session.user.name;
         sp.url = result.obj.site.href();
         sp.account = result.obj.user.name;
         var mailbody = this.renderSkinAsString("mailnewmember", sp);
         sendMail(root.sys_email,
                  result.obj.user.email,
                  getMessage("mail.newMember", result.obj.site.title),
                  mailbody);
         res.redirect(result.obj.href("edit"));
      } catch (err) {
         res.message = err.toString();
         if (err instanceof MailException)
            res.redirect(result.obj.href("edit"));
         res.redirect(this.href());
      }
   }
   res.data.action = this.href(req.action);
   res.data.title = "Search members of " + this._parent.title;
   res.data.body = this.renderSkinAsString("new");
   res.handlers.context.renderSkin("page");
   return;
}

/**
 * edit actions for user profiles
 */
function edit_action() {
   if (req.data.cancel)
      res.redirect(this._parent.href());
   else if (req.data.save) {
      try {
         res.message = this.updateUser(req.data);
         res.redirect(this._parent.href());
      } catch (err) {
         res.message = err.toString();
      }
   }

   res.data.title = "Profile of user " + session.user.name;
   res.data.body = session.user.renderSkinAsString("edit");
   this._parent.renderSkin("page");
   return;
}

/**
 * login action
 */
function login_action() {
   res.message = new Message("introLogin");
   if (req.data.login) {
      try {
         res.message = this.evalLogin(req.data.name, req.data.password);
         if (session.data.referrer) {
            var url = session.data.referrer;
            session.data.referrer = null;
         } else
            var url = this._parent.href();
         res.redirect(url);
      } catch (err) {
         res.message = err.toString();
      }
   }

   if (!session.data.referrer && req.data.http_referer)
      session.data.referrer = req.data.http_referer;
   res.data.action = this.href(req.action);
   res.data.title = "Login";
   res.data.body = this.renderSkinAsString("login");
   this._parent.renderSkin("page");
   return;
}

/**
 * logout action
 */
function logout_action() {
   if (session.user) {
     res.message = new Message("logout", session.user.name);
     session.logout();
     session.data.referrer = null;
     res.setCookie ("avUsr", "");
     res.setCookie ("avPw", "");
   }
   res.redirect(this._parent.href());
   return;
}

/**
 * register action
 */
function register_action() {
   if (req.data.cancel)
      res.redirect(this._parent.href());
   else if (req.data.register) {
      if (session.data.referrer) {
         var url = session.data.referrer;
         session.data.referrer = null;
      } else
         var url = this._parent.href();
      try {
         var result = this.evalRegistration(req.data);
         res.message = result.toString();
         // now we log in the user and send the confirmation mail
         session.login(result.obj.name, result.obj.password);
         if (root.sys_email) {
            var sp = {name: result.obj.name, password: result.obj.password};
            sendMail(root.sys_email,
                     result.obj.email,
                     getMessage("mail.registration", root.getTitle()),
                     this.renderSkinAsString("mailregconfirm", sp)
                    );
         }
         res.redirect(url);
      } catch (err) {
         res.message = err.toString();
         // if we got a mail exception redirect back
         if (err instanceof MailException)
            res.redirect(url);
      }
   }

   res.data.action = this.href(req.action);
   res.data.title = "Register";
   res.data.body = this.renderSkinAsString("register");
   this._parent.renderSkin("page");
   return;
}

/**
 * password reminder action
 */
function sendpwd_action() {
   if (req.data.cancel)
      res.redirect(this._parent.href());
   else if (req.data.send) {
      try {
         res.message = this.sendPwd(req.data.email);
         res.redirect(this._parent.href());
      } catch (err) {
         res.message = err.toString();
      }
   }

   res.data.action = this.href(req.action);
   res.data.title = "Recover your password";
   res.data.body = this.renderSkinAsString("sendpwd");
   this._parent.renderSkin("page");
   return;
}
