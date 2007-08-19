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
