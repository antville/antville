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
   return;
}

/**
 * macro renders the number of site (either all or just the public ones)
 */
function sitecounter_macro(param) {
   if (param.count == "all")
      var size = root.size();
   else
      var size = this.publicSites.size();
   if (size == 0)
      res.write(param.no ? param.no : size);
   else if (size == 1)
      res.write(param.one ? param.one : size);
   else
      res.write(size + (param.more ? param.more : ""));
   return;
}

/**
 * render the system title of this antville installation
 */
function title_macro() {
   res.write(this.getTitle());
   return;
}

/**
 * render the system-url of this antville installation
 */
function url_macro(param) {
   res.write(this.getUrl());
   return;
}

/**
 * render the system manager navigation if user is a system manager
 */
function sysmgrnavigation_macro(param) {
   if (session.user && session.user.sysadmin)
      this.renderSkin("sysmgrnavigation");
   return;
}

/**
 * proxy macro for LayoutMgr.layoutchooser
 */
function layoutchooser_macro(param) {
   if (root.sys_layout)
      param.selected = root.sys_layout.alias;
   root.layouts.layoutchooser_macro(param);
   return;
}
