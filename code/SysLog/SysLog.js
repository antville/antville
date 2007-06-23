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

/**
 * constructor for a new SysLog-object
 * @param String type of modified object
 * @param String name or ID of modified object
 * @param String message to add as log-entry
 * @param Object sysadmin
 */

SysLog.prototype.constructor  = function(type, object, logentry, sysadmin) {
   this.type = type;
   this.object = object;
   this.logentry = logentry;
   this.sysadmin = sysadmin;
   this.createtime = new Date();
   return this;
};
/**
 * function renders a flag according to object affected
 * by sysadmin-action
 */

SysLog.prototype.sysmgr_typeflag_macro = function(param) {
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
   return;
};


/**
 * function renders the name of the object affected
 */

SysLog.prototype.sysmgr_object_macro = function(param) {
   // this macro is allowed just for sysadmins
   if (!session.user.sysadmin)
      return;
   if (!this.object)
      return;
   res.write(this.object);
   return;
};

/**
 * function renders the log-entry
 */

SysLog.prototype.sysmgr_logentry_macro = function(param) {
   // this macro is allowed just for sysadmins
   if (!session.user.sysadmin)
      return;
   res.write(this.logentry);
   return;
};

/**
 * function renders the name of the sysadmin as link
 */

SysLog.prototype.sysmgr_sysadmin_macro = function(param) {
   // this macro is allowed just for sysadmins
   if (!session.user.sysadmin)
      return;
   if (this.sysadmin)
      this.sysadmin.name_macro(param);
   else
      res.write("system");
   return;
};
