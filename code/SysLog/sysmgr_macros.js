/**
 * function renders a flag according to object affected
 * by sysadmin-action
 */

function sysmgr_typeflag_macro(param) {
   // this macro is allowed just for sysadmins
   if (!isUserSysAdmin())
      return;
   if (this.type == "site")
      res.write("<span class=\"flagdkgreen\" nowrap>SITE</span>");
   else if (this.type == "user")
      res.write("<span class=\"flagred\" nowrap>USER</span>");
   else
      res.write("<span class=\"flagyellow\" nowrap>SYSTEM</span>");
}


/**
 * function renders the name of the object affected
 */

function sysmgr_object_macro(param) {
   // this macro is allowed just for sysadmins
   if (!isUserSysAdmin())
      return;
   if (!this.object)
      return;
   res.write(this.object);
}

/**
 * function renders the log-entry
 */

function sysmgr_logentry_macro(param) {
   // this macro is allowed just for sysadmins
   if (!isUserSysAdmin())
      return;
   res.write(this.logentry);
}

/**
 * function renders the name of the sysadmin as link
 */

function sysmgr_sysadmin_macro(param) {
   // this macro is allowed just for sysadmins
   if (!isUserSysAdmin())
      return;
   if (this.sysadmin)
      this.sysadmin.name_macro(param);
   else
      res.write("system");
}