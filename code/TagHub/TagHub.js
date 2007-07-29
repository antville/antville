TagHub.prototype.constructor = function(name, tagged, user) {
   var site = res.handlers.site;
   var tag = site.tags.get(name);
   if (!tag) {
      tag = new Tag(name, site, tagged._prototype);
      site.tags.add(tag);
   }
   this.tag = tag;
   this.tagged = tagged;
   this.user = user;
   return this;
};

TagHub.prototype.getMacroHandler = function(name) {
   switch (name.toLowerCase()) {
      case "parent":
      case "story":
      case "image":
      return this.parent;
      break;
   }
};

TagHub.prototype.toString = function() {
   return "[Tag ``" + this.tag.name + "'' of " + this.tagged_type + " " + 
         this.tagged_id + "]";
};
