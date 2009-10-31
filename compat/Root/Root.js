//
// The Antville Project
// http://code.google.com/p/antville
//
// Copyright 2001-2007 by The Antville People
//
// Licensed under the Apache License, Version 2.0 (the ``License'');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an ``AS IS'' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// $Revision$
// $LastChangedBy$
// $LastChangedDate$
// $URL$
//

Root.VERSION = "1.2-compatible";

Root.prototype.rss_action = function() {
   return res.redirect(root.href("rss.xml"));
}

Root.prototype.url_macro = function(param) {
   return this.href_macro(param);
}

Root.prototype.sitecounter_macro = function(param) {
   if (param.count === "all") {
      var size = root.size();
   } else {
      var size = root.sites.size();
   }
   if (size < 1) {
      res.write(param.no || size);
   } else if (size < 2) {
      res.write(param.one || size);
   } else {
      res.write(size + (param.more || String.EMPTY));
   }
   return;
}

Root.prototype.sysmgrnavigation_macro = function(param) {
   if (session.user && session.user.sysadmin)
      this.renderSkin("sysmgrnavigation");
   return;
}

Root.prototype.sys_title_macro = function(param) {
   if (param.as == "editor")
      Html.input(this.createInputParam("sys_title", param));
   else
      res.write(this.getTitle());
   return;
}

Root.prototype.sys_url_macro = function(param) {
   return this.title_macro(param);
}

Root.prototype.sys_email_macro = function(param) {
   return;
}

// FIXME: The following macros will be replaced by rewritten code

Root.prototype.sys_allowFiles_macro = function(param) {
   // this macro is allowed just for sysadmins
   if (!session.user.sysadmin)
      return;
   if (param.as == "editor") {
      var inputParam = this.createCheckBoxParam("sys_allowFiles", param);
      if (req.data.save && !req.data.sys_allowFiles)
         delete inputParam.checked;
      Html.checkBox(inputParam);
   } else
      res.write(this.sys_allowFiles ? gettext("yes") : gettext("no"));
   return;
}

Root.prototype.sys_diskQuota_macro = function(param) {
   // this macro is allowed just for sysadmins
   if (!session.user.sysadmin)
      return;
   if (param.as == "editor") {
      param["type"] = "text";
      var iParam = this.createInputParam("sys_diskQuota", param);
      Html.input(iParam);
   } else
      res.write(this.sys_diskquota);
   return;
}

Root.prototype.sys_limitNewSites_macro = function(param) {
   // this macro is allowed just for sysadmins
   if (!session.user.sysadmin)
      return;
   if (param.as == "editor") {
      var options = [gettext("all registered users"), 
            gettext("only trusted users"), "---------"];
      Html.dropDown({name: "sys_limitNewSites"}, options, this.sys_limitNewSites);
   } else
      res.write(this.sys_limitNewSites);
   return;
}

Root.prototype.sys_minMemberAge_macro = function(param) {
   // this macro is allowed just for sysadmins
   if (!session.user.sysadmin)
      return;
   if (param.as == "editor") {
      var options = new Array();
      for (var i=1;i<92;i++) {
         if (i < 7 || (i % 7) == 0)
            options[options.length] = i.toString();
      }
      Html.dropDown({name: "sys_minMemberAge"}, options, this.sys_minMemberAge, "----");
   } else
      res.write(this.sys_minMemberAge);
   return;
}

Root.prototype.sys_minMemberSince_macro = function(param) {
   // this macro is allowed just for sysadmins
   if (!session.user.sysadmin)
      return;
   if (param.as == "editor") {
      if (this.sys_minMemberSince)
         param.value = formatTimestamp(this.sys_minMemberSince, "yyyy-MM-dd HH:mm");
      param.name = "sys_minMemberSince";
      Html.input(param);
   } else
      res.write(this.sys_minMemberSince);
   return;
}

Root.prototype.sys_waitAfterNewSite_macro = function(param) {
   // this macro is allowed just for sysadmins
   if (!session.user.sysadmin)
      return;
   if (param.as == "editor") {
      var options = new Array();
      for (var i=1;i<92;i++) {
         if (i < 7 || !(i%7))
            options[i] = i;
      }
      Html.dropDown({name: "sys_waitAfterNewSite"}, options, this.sys_waitAfterNewSite, "----");
   } else
      res.write(this.sys_waitAfterNewSite);
   return;
}

Root.prototype.sys_enableAutoCleanup_macro = function(param) {
   // this macro is allowed just for sysadmins
   if (!session.user.sysadmin)
      return;
   if (param.as == "editor") {
      var inputParam = this.createCheckBoxParam("sys_enableAutoCleanup", param);
      if (req.data.save && !req.data.sys_enableAutoCleanup)
         delete inputParam.checked;
      Html.checkBox(inputParam);
   } else
      res.write(this.sys_enableAutoCleanup ? gettext("yes") : gettext("no"));
   return;
}

Root.prototype.sys_startAtHour_macro = function(param) {
   // this macro is allowed just for sysadmins
   if (!session.user.sysadmin)
      return;
   if (param.as == "editor") {
      var options = new Array();
      for (var i=0;i<24;i++)
         options[i] = (i < 10 ? "0" + i : i.toString());
      Html.dropDown({name: "sys_startAtHour"}, options, this.sys_startAtHour);
   } else
      res.write(this.sys_startAtHour);
   return;
}

Root.prototype.sys_blockPrivateSites_macro = function(param) {
   // this macro is allowed just for sysadmins
   if (!session.user.sysadmin)
      return;
   if (param.as == "editor") {
      var inputParam = this.createCheckBoxParam("sys_blockPrivateSites", param);
      if (req.data.save && !req.data.sys_blockPrivateSites)
         delete inputParam.checked;
      Html.checkBox(inputParam);
   } else
      res.write(this.sys_blockPrivateSites ? gettext("yes") : gettext("no"));
   return;
}

Root.prototype.sys_blockWarningAfter_macro = function(param) {
   // this macro is allowed just for sysadmins
   if (!session.user.sysadmin)
      return;
   if (param.as == "editor")
      Html.input(this.createInputParam("sys_blockWarningAfter", param));
   else
      res.write(this.sys_blockWarningAfter);
   return;
}

Root.prototype.sys_blockAfterWarning_macro = function(param) {
   // this macro is allowed just for sysadmins
   if (!session.user.sysadmin)
      return;
   if (param.as == "editor")
      Html.input(this.createInputParam("sys_blockAfterWarning", param));
   else
      res.write(this.sys_blockAfterWarning);
   return;
}

Root.prototype.sys_deleteInactiveSites_macro = function(param) {
   // this macro is allowed just for sysadmins
   if (!session.user.sysadmin)
      return;
   if (param.as == "editor") {
      var inputParam = this.createCheckBoxParam("sys_deleteInactiveSites", param);
      if (req.data.save && !req.data.sys_deleteInactiveSites)
         delete inputParam.checked;
      Html.checkBox(inputParam);
   } else
      res.write(this.sys_deleteInactiveSites ? gettext("yes") : gettext("no"));
   return;
}

Root.prototype.sys_deleteWarningAfter_macro = function(param) {
   // this macro is allowed just for sysadmins
   if (!session.user.sysadmin)
      return;
   if (param.as == "editor")
      Html.input(this.createInputParam("sys_deleteWarningAfter", param));
   else
      res.write(this.sys_deleteWarningAfter);
   return;
}

Root.prototype.sys_deleteAfterWarning_macro = function(param) {
   // this macro is allowed just for sysadmins
   if (!session.user.sysadmin)
      return;
   if (param.as == "editor")
      Html.input(this.createInputParam("sys_deleteAfterWarning", param));
   else
      res.write(this.sys_deleteAfterWarning);
   return;
}

Root.prototype.sys_frontSite_macro = function(param) {
   if (!session.user.sysadmin)
      return;
   if (param.as == "editor") {
      var inputParam = new Object();
      inputParam.name = "sys_frontSite";
      inputParam.value = root.sys_frontSite ? root.sys_frontSite.alias : null;
      Html.input(inputParam);
   } else
      res.write (root.sys_frontSite);
   return;
}

Root.prototype.sys_allowEmails_macro = function(param) {
  // this macro is allowed just for sysadmins
  if (!session.user.sysadmin)
     return;
  if (param.as == "editor") {
     var options = [gettext("no notification e-mails"), 
           gettext("notification for all sites"), 
           gettext("only trusted sites")];
     Html.dropDown({name: "sys_allowEmails"}, options, this.sys_allowEmails);
  } else
     res.write(this.sys_allowEmails);
  return;
}

