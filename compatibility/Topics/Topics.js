Topics.prototype.main_action = function() {
   res.redirect(this.href());
};

Topics.prototype.getChildElement = function(id) {
   res.redirect(this.href() + id);
};

Topics.prototype.href = function() {
   var mountpoint = (this._parent.constructor === Site ? "tags" : "galleries");
   return res.handlers.site[mountpoint].href();  
};
