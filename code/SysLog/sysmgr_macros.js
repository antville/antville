/**
 * function renders a flag according to object affected
 * by sysadmin-action
 */

function sysmgr_typeflag_macro(param) {
   // this macro is allowed just for sysadmins
   if (!user.isSysAdmin())
      return;
   res.write(param.prefix);
   if (this.type == "weblog")
      res.write("<span class=\"flagdkgreen\" nowrap>WEBLOG</span>");
   else if (this.type == "user")
      res.write("<span class=\"flagred\" nowrap>USER</span>");
   else
      res.write("<span class=\"flagyellow\" nowrap>SYSTEM</span>");
   res.write(param.suffix);
}


/**
 * function renders the name of the object affected
 */

function sysmgr_object_macro(param) {
   // this macro is allowed just for sysadmins
   if (!user.isSysAdmin())
      return;
   if (!this.object)
      return;
   res.write(param.prefix);
   res.write(this.object);
   res.write(param.suffix);
}

/**
 * function renders the log-entry
 */

function sysmgr_logentry_macro(param) {
   // this macro is allowed just for sysadmins
   if (!user.isSysAdmin())
      return;
   res.write(param.prefix);
   res.write(this.logentry);
   res.write(param.suffix);
}

/**
 * function renders the name of the sysadmin as link
 */

function sysmgr_sysadmin_macro(param) {
   // this macro is allowed just for sysadmins
   if (!user.isSysAdmin())
      return;
   if (this.sysadmin)
      this.sysadmin.name_macro(param);
   else {
      res.write(param.prefix);
      res.write("system");
      res.write(param.suffix);
   }
}