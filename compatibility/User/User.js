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
   if (!User.getPermission(User.PRIVILEGED)) {
      return;
   }
   if (param.as === "editor") {
      this.select_macro(param, "status");
   } else {
      res.write(this.status);
   }
   return;
   
};

User.prototype.name_macro = function(param) {
   var url;
   if (param.as === "link" && (url = this.url)) {
      link_filter(this.name, param, url);
   } else {
      res.write(this.name);
   }
   return;
};

User.prototype.url_macro = function(param) {
   if (param.as === "editor") {
      this.input_macro(param, "url");
   } else {
      res.write(this.url);
   }
   return;
};

User.prototype.email_macro = function(param) {
   if (this !== session.user) {
      return;
   }
   if (param.as == "editor") {
      this.input_macro(param, "email");
   } else {
      res.write(this.email);
   }
   return;
};
