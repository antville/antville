app.addRepository("modules/helma/Aspects.js");

var aspects = {};

aspects.setTopics = function(args, func, obj) {
   var param = args[0];
   param.tags = [param.topic || param.addToTopic];
   return args;
};

Image.prototype.onCodeUpdate = function() {
   return helma.aspects.addBefore(this, "evalImg", aspects.setTopics);
};

ImageMgr.prototype.onCodeUpdate = function() {
   return helma.aspects.addBefore(this, "evalImg", aspects.setTopics);
};

Story.prototype.onCodeUpdate = function() {
   return helma.aspects.addBefore(this, "evalStory", aspects.setTopics);
};

StoryMgr.prototype.onCodeUpdate = function() {
   return helma.aspects.addBefore(this, "evalNewStory", aspects.setTopics);
};
