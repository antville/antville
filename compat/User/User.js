// The Antville Project
// http://code.google.com/p/antville
//
// Copyright 2007-2011 by Tobi Schäfer.
//
// Copyright 2001–2007 Robert Gaggl, Hannes Wallnöfer, Tobi Schäfer,
// Matthias & Michael Platzer, Christoph Lincke.
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

disableMacro(User, "password");

User.prototype.__defineGetter__("blocked", function() {
   return this.status === User.BLOCKED;
});

User.prototype.__defineSetter__("blocked", function(blocked) {
   this.status = blocked ? User.BLOCKED : User.DEFAULT;
});

User.prototype.__defineGetter__("trusted", function() {
   return this.status === User.TRUSTED;
});

User.prototype.__defineSetter__("trusted", function(trusted) {
   this.status = trusted ? User.TRUSTED : User.DEFAULT;
});

User.prototype.__defineGetter__("sysadmin", function() {
   return this.status === User.PRIVILEGED;
});

User.prototype.__defineSetter__("sysadmin", function(privileged) {
   this.status = privileged ? User.PRIVILEGED : User.DEFAULT;
});

User.prototype.status_macro = function(param) {
   // This macro is allowed for privileged users only
   if (!User.require(User.PRIVILEGED)) {
      return;
   }
   if (param.as === "editor") {
      this.select_macro(param, "status");
   } else {
      res.write(this.status);
   }
   return;
}

User.prototype.name_macro = function(param) {
   if (param.as === "link" && this.url) {
      link_filter(this.name, param, this.url);
   } else {
      res.write(this.name);
   }
   return;
}

User.prototype.url_macro = function(param) {
   if (param.as === "editor") {
      this.input_macro(param, "url");
   } else {
      res.write(this.url);
   }
   return;
}

User.prototype.email_macro = function(param) {
   if (!User.require(User.PRIVILEGED) && this !== session.user) {
      return;
   }
   if (param.as === "editor") {
      this.input_macro(param, "email");
   } else {
      res.write(this.email);
   }
   return;
}
