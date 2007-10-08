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
};

Image.prototype.onCodeUpdate = function() {
   helma.aspects.addAfter(this, "getUrl", function(value, args, func, obj) {
      return Image.getCompatibleFileName(obj, value);
   });
   return helma.aspects.addBefore(this, "update", aspects.setTopics);
};

ImageMgr.prototype.onCodeUpdate = function() {
   return helma.aspects.addBefore(this, "evalImg", aspects.setTopics);
};

Site.prototype.onCodeUpdate = function() {
   helma.aspects.addBefore(this, "navigation_macro", function(args, func, obj) {
      var param = args[0];
      if (param["for"] === "users" && !param.modules) {
         // FIXME: this is left for backwards-compatibility
         // sometime in the future we'll get rid of the usernavigation.skin
         res.write("...&nbsp;");
         html.link({href: "http://project.antville.org/stories/146"}, 
               "<strong>README</strong>");
         html.tag("br");
         html.tag("br");
         this.renderSkin("usernavigation");
      }
      return args;
   });
   
   return helma.aspects.addBefore(this, "update", function(args, func, obj) {
      if (!obj.isTransient()) {
         var data = args[0];
         data.tagline || (data.tagline = data.properties_tagline);
         data.pageSize || (data.pageSize = data.properties_days);
         if (data.usermaycontrib && data.online) {
            data.mode = Site.OPEN;
         } else if (data.online) {
            data.mode = Site.PUBLIC;
         } else if (!data.mode) {
            data.mode = Site.PRIVATE;
         }
      }
      return args;
   });
};

Story.prototype.onCodeUpdate = function() {
   return helma.aspects.addBefore(this, "evalStory", aspects.setTopics);
};

Stories.prototype.onCodeUpdate = function() {
   return helma.aspects.addBefore(this, "evalNewStory", aspects.setTopics);
};
