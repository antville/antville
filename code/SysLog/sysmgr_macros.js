/**
 * function renders a flag according to object affected
 * by sysadmin-action
 */

function sysmgr_typeflag_macro(param) {
   // this macro is allowed just for sysadmins
   if (!session.user.sysadmin)
      return;
   switch (this.type) {
      case "site" :
         res.write("<span class=\"flagDark\" style=\"background-color:#006600;\">SITE</span>");
         break;
      case "user" :
         res.write("<span class=\"flagDark\" style=\"background-color:#009900;\">USER</span>");
         break;
      default :
         res.write("<span class=\"flagLight\" style=\"background-color:#FFCC00;\">SYSTEM</span>");
   }
}


/**
 * function renders the name of the object affected
 */

function sysmgr_object_macro(param) {
   // this macro is allowed just for sysadmins
   if (!session.user.sysadmin)
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
   if (!session.user.sysadmin)
      return;
   res.write(this.logentry);
}

/**
 * function renders the name of the sysadmin as link
 */

function sysmgr_sysadmin_macro(param) {
   // this macro is allowed just for sysadmins
   if (!session.user.sysadmin)
      return;
   if (this.sysadmin)
      this.sysadmin.name_macro(param);
   else
      res.write("system");
}