/**
 * main action
 */
function main_action() {
   res.data.action = this.href(req.action);
   res.data.title = "Members of " + this._parent.title;
   res.data.body = this.renderSkinAsString("main");
   if (req.data.keyword) {
      try {
         var result = this.searchUser(req.data.keyword);
         res.message = result.toString();
         res.data.searchresult = result.obj;
         res.data.body += this.renderSkinAsString("searchresult");
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

   res.data.body += this.renderSkinAsString("memberlist");
   this._parent.renderSkin("page");
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
            var url = parent.href();
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
         var sp = {name: result.obj.name, password: result.obj.password};
         sendMail(root.sys_email,
                  result.obj.email,
                  getMessage("mail.registration", root.getSysTitle()),
                  this.renderSkinAsString("mailbody", sp)
                 );
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
}

/**
 * action for displaying subscriptions of a user
 */
function subscriptions_action() {
   res.data.title = "Subscriptions of user " + session.user.name;
   res.data.body = session.user.renderSkinAsString("subscriptions");
   this._parent.renderSkin("page");
}