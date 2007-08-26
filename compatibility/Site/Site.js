Site.prototype.__defineGetter__("online", function() {
   return this.mode === "online";
   return this.value("mode") === Site.ONLINE;
});

Site.prototype.__defineGetter__("blocked", function() {
   return this.status === "blocked";
   return this.value("status") === Site.BLOCKED;
});

Site.prototype.__defineGetter__("trusted", function() {
   return this.mode === "trusted";
   return this.value("status") === Site.TRUSTED;
});

Site.prototype.__defineGetter__("alias", function() {
   return this.name;
   return this.value("name");
});

Site.prototype.__defineSetter__("alias", function(alias) {
   this.name = alias;
   //this.value("name", alias);
   return;
});

Site.prototype.__defineSetter__("createtime", function(date) {
   this.created = date;
   //this.value("created");
   return;
});

Site.prototype.__defineSetter__("modifytime", function(date) {
   this.modified = date;
   //this.value("modified");
   return;
});
