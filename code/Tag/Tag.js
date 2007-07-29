Tag.prototype.constructor = function(name, site, type) {
   this.name = name;
   this.site = site;
   this.type = type;
   return this;
};

Tag.prototype.main_action = function() {
   res.debug(this.name + ": " + this.size());
};

Tag.prototype.toString = function() {
   return "[Tag ``" + this.name + "'' of Site ``" + this.site.alias + "'']";
};
