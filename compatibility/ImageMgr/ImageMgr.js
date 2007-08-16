ImageMgr.prototype.topicchooser_macro = function() {
   return Story.prototype.topicchooser_macro.apply(res.handlers.image || 
         new Image, arguments);
};

ImageMgr.prototype.link_macro = function(param) {
   if (this.getContext() === "Layout" && param.to === "myimages") {
      param.to = "default";
      param.text = "default images";
   }
   return HopObject.prototype.link_macro.apply(this, arguments);
};
