Image.prototype.topicchooser_macro = function() {
   return Story.prototype.topicchooser_macro.apply(this, arguments);
};

Image.prototype.gallery_macro = function() {
   return Story.prototype.topic_macro.apply(this, arguments);
};

Image.prototype.topic_macro = Image.prototype.gallery_macro;
