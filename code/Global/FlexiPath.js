function FlexiPath(name, parent) {
   var self = this;

   this._id = name;
   this._parent = parent;
   this._patterns = {};

   this.__defineGetter__("patterns", function() {
      var ref = this;
      while (ref._parent.constructor === FlexiPath) {
         ref = ref._parent;
      }
      return ref._patterns;
   });

   this.addUrlPattern = function(pattern, callback) {
      this._patterns[pattern] = callback;
      return;
   }

   this.href = function(action) {
      var href = [];
      var ref = this;
      while (ref._parent === this.constructor) {
         href.unshift(ref._id);
         ref = ref._parent;
      }
      //href.push("/");
      if (action) {
         href.push(action);
      }
      return root.api.href() + href.join("/");
   }

   this.getChildElement = function(name) {
      return new this.constructor(name, self);
   }

   return this;
};

FlexiPath.prototype.main_action = function() {
   for (let pattern in this.patterns) {
      let match;
      let re = new RegExp(pattern);
      if (match = req.path.match(re)) {
         return this.patterns[pattern].apply(this, match);
      }
   }
   return;
}
