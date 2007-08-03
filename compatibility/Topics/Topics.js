Topics.prototype.main_action = function() {
   return this._parent.stories.tags.main_action();
};

Topics.prototype.getChildElement = function(id) {
   return this._parent.stories.alltags.get(id);
};
