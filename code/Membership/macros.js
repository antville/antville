/**
 * macro renders the username of this member
 */

function username_macro(param) {
   res.write(param.prefix)
   if (param.linkto) {
      this.openLink(param);
      res.write(this.username);
      this.closeLink();
   } else
      res.write(this.username);
   res.write(param.suffix);
}

/**
 * macro renders the createtime of this membership
 */

function createtime_macro(param) {
   res.write(param.prefix)
   res.write(this.weblog.formatTimestamp(this.createtime,param));
   res.write(param.suffix);
}

/**
 * macro renders eMail-address of member
 */

function email_macro(param) {
   res.write(param.prefix)
   res.write(this.user.email);
   res.write(param.suffix);
}

/**
 * macro renders user-level
 */

function userlevel_macro(param) {
   res.write(param.prefix)
   if (this.isAdmin())
      res.write("Admin");
   else if (this.isContributor())
      res.write("Contributor");
   else
      res.write("User");
   res.write(param.suffix);
}

/**
 * macro renders admin-status
 */

function admin_macro(param) {
   res.write(param.prefix)
   if (param.as == "editor")
      this.renderInputCheckbox(this.createInputParam("admin",param));
   else
      res.write(parseInt(this.admin,10) ? "yes" : "no");
   res.write(param.suffix);
}

/**
 * macro renders conributor-status
 */

function contributor_macro(param) {
   res.write(param.prefix)
   if (param.as == "editor")
      this.renderInputCheckbox(this.createInputParam("contributor",param));
   else
      res.write(parseInt(this.contributor,10) ? "yes" : "no");
   res.write(param.suffix);
}

