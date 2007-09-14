User.prototype.__defineGetter__("blocked", function() {
   return this.value("status") === User.BLOCKED;
});

User.prototype.__defineSetter__("blocked", function(blocked) {
   this.value("status", User.BLOCKED);
});

User.prototype.__defineGetter__("trusted", function() {
   return this.value("status") === User.TRUSTED;
});

User.prototype.__defineSetter__("trusted", function(blocked) {
   this.value("status", User.TRUSTED);
});

User.prototype.__defineGetter__("sysadmin", function() {
   return this.value("status") === User.PRIVILEGED;
});

User.prototype.__defineSetter__("sysadmin", function(blocked) {
   this.value("status", User.PRIVILEGED);
});

User.prototype.status_macro = function(param) {
   // This macro is allowed for privileged users only
   if (!User.isAdministrator()) {
      return;
   }
   if (param.as === "editor") {
      this.select_macro(param, "status");
   } else {
      res.write(this.value("status"));
   }
   return;
   
};

User.prototype.name_macro = function(param) {
   var url;
   if (param.as === "link" && (url = this.value("url"))) {
      link_filter(this.value("name"), param, url);
   } else {
      res.write(this.value("name"));
   }
   return;
};

User.prototype.url_macro = function(param) {
   if (param.as === "editor") {
      this.input_macro(param, "url");
   } else {
      res.write(this.value("url"));
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
      res.write(this.value("email"));
   }
   return;
};
