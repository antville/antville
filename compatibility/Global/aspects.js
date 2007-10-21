app.addRepository("modules/helma/Aspects.js");

var aspects = {};

aspects.setTopics = function(args, func, obj) {
   var param = args[0];
   param.tags = [param.topic || param.addToTopic];
   return args;
};

HopObject.prototype.onCodeUpdate = function() {
   return helma.aspects.addBefore(this, "link_macro", function(args, func, obj) {
      var param = args[0];
      return [param, args[1] || param.to, args[2] || param.text];
   });
}

Image.prototype.onCodeUpdate = function() {
   helma.aspects.addAfter(this, "getUrl", function(value, args, func, obj) {
      return Image.getCompatibleFileName(obj, value);
   });
   return helma.aspects.addBefore(this, "update", aspects.setTopics);
};

ImageMgr.prototype.onCodeUpdate = function() {
   return helma.aspects.addBefore(this, "evalImg", aspects.setTopics);
};

Story.prototype.onCodeUpdate = function() {
   return helma.aspects.addBefore(this, "evalStory", aspects.setTopics);
};

Stories.prototype.onCodeUpdate = function() {
   return helma.aspects.addBefore(this, "evalNewStory", aspects.setTopics);
};
