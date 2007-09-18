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

LogEntry.prototype.constructor = function(context, action) {
   this.context_id = context._id;
   this.context_type = context._prototype;
   this.action = action || req.action;
   this.ip = req.data.http_remotehost;
   this.referrer = req.data.http_referrer;
   this.creator = session.user;
   this.created = new Date;
   return this;
};

LogEntry.prototype.getMacroHandler = function(name) {
   switch (name) {
      case "context":
      return this.context || {name: this.context_id};
   }
   return null;
}

LogEntry.prototype.toString = function() {
   return "[LogEntry #" + this._id + ": " + this.creator + " requested " +
         this.action + " action of " + this.context_type + " #" + 
         this.context_id + " on " + formatDate(this.created) + "]";
} 

LogEntry.prototype.label_macro = function(param) {
   if (!User.getPermission(User.PRIVILEGED)) {
      return;
   }
   switch (this.context_type) {
      case "Site" :
      res.write("<span class=\"flagDark\" style=\"background-color:#006600;\">SITE</span>");
      break;
      case "User" :
      res.write("<span class=\"flagDark\" style=\"background-color:#009900;\">USER</span>");
      break;
      default :
      res.write("<span class=\"flagLight\" style=\"background-color:#FFCC00;\">ROOT</span>");
   }
   return;
};