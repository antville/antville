/**
 * macro rendering loginStatus of user
 * valid params:  -  loginSkin
 *                -  logoutSkin
 */

function loginstatus_macro(param) {
   if (user.uid)
      this.members.renderSkin("statusloggedin");
   else if (getActionName() != "login")
      this.members.renderSkin("statusloggedout");
}

/**
 * macro renders the 10 freshest weblogs
 */

function webloglist_macro(param) {
   if (this.size()) {
      res.write(param.prefix)
      for (var i=0;i<(this.size() > 10 ? 10 : this.size());i++) {
         if (this.get(i).isOnline() && this.get(i).lastupdate)
            this.get(i).renderSkin("preview");
      }
      res.write(param.suffix);
   }
}

/**
 * macro renders the number of weblogs
 */

function weblogcounter_macro(param) {
   res.write(param.prefix)
   res.write(this.size());
   res.write(param.suffix);
}
