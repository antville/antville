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

function webloglist_macro(param) {
	webloglist_macro(param);
}


/**
 * macro renders the number of weblogs
 */

function weblogcounter_macro(param) {
   res.write(param.prefix)
   res.write(this.size());
   res.write(param.suffix);
}
