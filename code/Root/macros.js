/**
 * macro rendering loginStatus of user
 * valid params:  -  loginSkin
 *                -  logoutSkin
 */

function loginstatus_macro(param) {
   if (session.user)
      this.members.renderSkin("statusloggedin");
   else if (req.action != "login")
      this.members.renderSkin("statusloggedout");
}

/**
 * macro is left here for backwards-compatibility only
 */

function sitelist_macro(param) {
	sitelist_macro(param);
}


/**
 * macro renders the number of site (either all or just the public ones)
 */

function sitecounter_macro(param) {
   if (param.count == "all")
      var size = root.size();
   else
      var size = this.public.size();
   res.write(size);
}

/**
 * macro renders the system-title of this antville-installation
 */

function systitle_macro(param) {
   res.write(this.getSysTitle());
}

/**
 * macro renders the system-url of this antville-installation
 */

function sysurl_macro(param) {
   res.write(this.getSysUrl());
}