/**
 * macro rendering title
 */

function sys_title_macro(param) {
   if (param.as == "editor") {
      param["type"] = "text";
      renderInputText(this.createInputParam("sys_title",param));
   } else
      res.write(this.sys_title);
   return;
}

/**
 * macro rendering siteurl
 */

function sys_url_macro(param) {
   if (param.as == "editor") {
      param["type"] = "text";
      renderInputText(this.createInputParam("sys_url",param));
   } else
      res.write(this.sys_url);
   return;
}

/**
 * macro rendering address used for sending mails
 */

function sys_email_macro(param) {
   // this macro is allowed just for sysadmins
   if (!isUserSysAdmin())
      return;
   if (param.as == "editor") {
      param["type"] = "text";
      renderInputText(this.createInputParam("sys_email",param));
   } else
      res.write(this.sys_email);
   return;
}

/**
 * macro rendering allowFiles-flag
 */

function sys_allowFiles_macro(param) {
   // this macro is allowed just for sysadmins
   if (!isUserSysAdmin())
      return;
   if (param.as == "editor") {
      renderInputCheckbox(this.createInputParam("sys_allowFiles",param));
   } else
      res.write(this.sys_allowFiles ? "yes" : "no");
   return;
}

/**
 * macro rendering a dropdown for limiting the creation of new sites
 */

function sys_limitNewSites_macro(param) {
   // this macro is allowed just for sysadmins
   if (!isUserSysAdmin())
      return;
   if (param.as == "editor") {
      var options = new Array("all registered users","only trusted users","---------");
      renderDropDownBox("sys_limitNewSites",options,this.sys_limitNewSites);
   } else
      res.write(this.sys_limitNewSites);
   return;
}

/**
 * macro renders a dropdown containing the minimal registration
 */

function sys_minMemberAge_macro(param) {
   // this macro is allowed just for sysadmins
   if (!isUserSysAdmin())
      return;
   if (param.as == "editor") {
      var options = new Array();
      for (var i=1;i<92;i++) {
         if (i < 7 || !(i%7))
            options[i] = i;
      }
      renderDropDownBox("sys_minMemberAge",options,this.sys_minMemberAge,"----");
   } else
      res.write(this.sys_minMemberAge);
   return;
}

/**
 * macro renders a dropdown containing the number of days a user has to wait
 * after having created a weblog before being allowed to create a new one
 */

function sys_waitAfterNewWeblog_macro(param) {
   // this macro is allowed just for sysadmins
   if (!isUserSysAdmin())
      return;
   if (param.as == "editor") {
      var options = new Array();
      for (var i=1;i<92;i++) {
         if (i < 7 || !(i%7))
            options[i] = i;
      }
      renderDropDownBox("sys_waitAfterNewWeblog",options,this.sys_waitAfterNewWeblog,"----");
   } else
      res.write(this.sys_waitAfterNewWeblog);
   return;
}


/**
 * macro rendering autocleanup-flag
 */

function sys_enableAutoCleanup_macro(param) {
   // this macro is allowed just for sysadmins
   if (!isUserSysAdmin())
      return;
   if (param.as == "editor") {
      renderInputCheckbox(this.createInputParam("sys_enableAutoCleanup",param));
   } else
      res.write(this.sys_enableAutoCleanup ? "yes" : "no");
   return;
}

/**
 * macro rendering hour when automatic cleanup starts
 */

function sys_startAtHour_macro(param) {
   // this macro is allowed just for sysadmins
   if (!isUserSysAdmin())
      return;
   if (param.as == "editor") {
      var options = new Array();
      for (var i=0;i<24;i++)
         options[i] = (i < 10 ? "0" + i : i);
      renderDropDownBox("sys_startAtHour",options,this.sys_startAtHour);
   } else
      res.write(this.sys_startAtHour);
   return;
}

/**
 * macro rendering blockPrivateSites-flag
 */

function sys_blockPrivateSites_macro(param) {
   // this macro is allowed just for sysadmins
   if (!isUserSysAdmin())
      return;
   if (param.as == "editor") {
      renderInputCheckbox(this.createInputParam("sys_blockPrivateSites",param));
   } else
      res.write(this.sys_blockPrivateSites ? "yes" : "no");
   return;
}

/**
 * macro rendering Number of days before sending blockwarning-mail
 */

function sys_blockWarningAfter_macro(param) {
   // this macro is allowed just for sysadmins
   if (!isUserSysAdmin())
      return;
   if (param.as == "editor") {
      renderInputText(this.createInputParam("sys_blockWarningAfter",param));
   } else
      res.write(this.sys_blockWarningAfter);
   return;
}

/**
 * macro rendering Number of days to wait before blocking private site
 */

function sys_blockAfterWarning_macro(param) {
   // this macro is allowed just for sysadmins
   if (!isUserSysAdmin())
      return;
   if (param.as == "editor") {
      renderInputText(this.createInputParam("sys_blockAfterWarning",param));
   } else
      res.write(this.sys_blockAfterWarning);
   return;
}

/**
 * macro rendering deleteInactiveSites-flag
 */

function sys_deleteInactiveSites_macro(param) {
   // this macro is allowed just for sysadmins
   if (!isUserSysAdmin())
      return;
   if (param.as == "editor") {
      renderInputCheckbox(this.createInputParam("sys_deleteInactiveSites",param));
   } else
      res.write(this.sys_deleteInactiveSites ? "yes" : "no");
   return;
}

/**
 * macro rendering Number of days before sending deletewarning-mail
 */

function sys_deleteWarningAfter_macro(param) {
   // this macro is allowed just for sysadmins
   if (!isUserSysAdmin())
      return;
   if (param.as == "editor") {
      renderInputText(this.createInputParam("sys_deleteWarningAfter",param));
   } else
      res.write(this.sys_deleteWarningAfter);
   return;
}

/**
 * macro rendering Number of days to wait before deleting inactive site
 */

function sys_deleteAfterWarning_macro(param) {
   // this macro is allowed just for sysadmins
   if (!isUserSysAdmin())
      return;
   if (param.as == "editor") {
      renderInputText(this.createInputParam("sys_deleteAfterWarning",param));
   } else
      res.write(this.sys_deleteAfterWarning);
   return;
}

/**
 * macro rendering a dropdown containing all 
 */

function localechooser_macro(param) {
   renderLocaleChooser(this.getLocale());
   return;
}

