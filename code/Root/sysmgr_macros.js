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
   if (!session.user.sysadmin)
      return;
   if (param.as == "editor") {
      param["type"] = "text";
      var iParam = this.createInputParam("sys_email",param);
      // use the users email if sys_email is empty
      if (!iParam.value)
         iParam.value = session.user.email;
      renderInputText(iParam);
   } else
      res.write(this.sys_email);
   return;
}

/**
 * macro rendering allowFiles-flag
 */

function sys_allowFiles_macro(param) {
   // this macro is allowed just for sysadmins
   if (!session.user.sysadmin)
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
   if (!session.user.sysadmin)
      return;
   if (param.as == "editor") {
      var options = new Array("all registered users","only trusted users","---------");
      renderDropDownBox("sys_limitNewSites",options,this.sys_limitNewSites);
   } else
      res.write(this.sys_limitNewSites);
   return;
}

/**
 * macro renders a dropdown containing the minimal registration time
 */

function sys_minMemberAge_macro(param) {
   // this macro is allowed just for sysadmins
   if (!session.user.sysadmin)
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
 * macro renders an input type text for editing the system-timestamp
 * that allows users who have registered before it to create a weblog
 */
function sys_minMemberSince_macro(param) {
   // this macro is allowed just for sysadmins
   if (!session.user.sysadmin)
      return;
   if (param.as == "editor") {
      if (this.sys_minMemberSince)
         param.value = formatTimestamp(this.sys_minMemberSince, "yyyy-MM-dd HH:mm");
      param.name = "sys_minMemberSince";
      renderInputText(param);
   } else
      res.write(this.sys_minMemberSince);
   return;
}


/**
 * macro renders a dropdown containing the number of days a user has to wait
 * after having created a weblog before being allowed to create a new one
 */

function sys_waitAfterNewSite_macro(param) {
   // this macro is allowed just for sysadmins
   if (!session.user.sysadmin)
      return;
   if (param.as == "editor") {
      var options = new Array();
      for (var i=1;i<92;i++) {
         if (i < 7 || !(i%7))
            options[i] = i;
      }
      renderDropDownBox("sys_waitAfterNewSite",options,this.sys_waitAfterNewSite,"----");
   } else
      res.write(this.sys_waitAfterNewSite);
   return;
}


/**
 * macro rendering autocleanup-flag
 */

function sys_enableAutoCleanup_macro(param) {
   // this macro is allowed just for sysadmins
   if (!session.user.sysadmin)
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
   if (!session.user.sysadmin)
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
   if (!session.user.sysadmin)
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
   if (!session.user.sysadmin)
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
   if (!session.user.sysadmin)
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
   if (!session.user.sysadmin)
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
   if (!session.user.sysadmin)
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
   if (!session.user.sysadmin)
      return;
   if (param.as == "editor") {
      renderInputText(this.createInputParam("sys_deleteAfterWarning",param));
   } else
      res.write(this.sys_deleteAfterWarning);
   return;
}

/**
 * macro rendering a dropdown containing all available locales
 */

function localechooser_macro(param) {
   if (!session.user.sysadmin)
      return;
   renderLocaleChooser(this.getLocale());
   return;
}

/**
 * macro renders a chooser for the longdateformat
 */
function longdateformat_macro(param) {
   if (!session.user.sysadmin)
      return;
   this.renderDateformatChooser("long");
}

/**
 * macro renders a chooser for the shortdateformat
 */
function shortdateformat_macro(param) {
   if (!session.user.sysadmin)
      return;
   this.renderDateformatChooser("short");
}

/**
 * macro renders the alias of the frontpage weblog defined
 */
function sys_frontSite_macro(param) {
   if (!session.user.sysadmin)
      return;
   if (param.as == "editor") {
      var inputParam = new Object();
      inputParam.name = "sys_frontSite";
      inputParam.value = root.sys_frontSite ? root.sys_frontSite.alias : null;
      renderInputText(inputParam);
   } else
      res.write (root.sys_frontSite);
   return;
}