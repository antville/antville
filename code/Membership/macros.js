/**
 * macro renders the username of this member
 */

function username_macro(param) {
   renderPrefix(param);
   if (param.linkto) {
      this.openLink(param);
      res.write(this.username);
      this.closeLink();
   } else
      res.write(this.username);
   renderSuffix(param);
}

/**
 * macro renders the createtime of this membership
 */

function createtime_macro(param) {
   renderPrefix(param);
   res.write(this.weblog.formatTimestamp(this.createtime,param));
   renderSuffix(param);
}

/**
 * macro renders eMail-address of member
 */

function email_macro(param) {
   renderPrefix(param);
   res.write(this.user.email);
   renderSuffix(param);
}

/**
 * macro renders user-level
 */

function userlevel_macro(param) {
   renderPrefix(param);
   if (this.isAdmin())
      res.write("Admin");
   else if (this.isContributor())
      res.write("Contributor");
   else
      res.write("User");
   renderSuffix(param);
}

/**
 * macro renders admin-status
 */

function admin_macro(param) {
   renderPrefix(param);
   if (param.as == "editor")
      this.renderInputCheckbox(this.createInputParam("admin",param));
   else
      res.write(parseInt(this.admin,10) ? "yes" : "no");
   renderSuffix(param);
}

/**
 * macro renders conributor-status
 */

function contributor_macro(param) {
   renderPrefix(param);
   if (param.as == "editor")
      this.renderInputCheckbox(this.createInputParam("contributor",param));
   else
      res.write(parseInt(this.contributor,10) ? "yes" : "no");
   renderSuffix(param);
}

