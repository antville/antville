/**
 * macro rendering loginStatus of user
 * valid params:  -  loginSkin
 *                -  logoutSkin
 */

function loginstatus_macro(param) {
   if (user.uid)
      this.members.renderSkin("statusloggedin");
   else if (req.action != "login")
      this.members.renderSkin("statusloggedout");
}

/**
 * macro is left here for backwards-compatibility only
 */

function webloglist_macro(param) {
	webloglist_macro(param);
}


/**
 * macro renders the number of weblogs (either all or just the public ones)
 */

function weblogcounter_macro(param) {
   if (param.count == "all")
      var size = root.size();
   else
      var size = this.public.size();
   res.write(param.prefix)
   res.write(size);
   res.write(param.suffix);
}
