//
// The Antville Project
// http://code.google.com/p/antville
//
// Copyright 2001-2007 by The Antville People
//
// Licensed under the Apache License, Version 2.0 (the ``License'');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an ``AS IS'' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// $Revision$
// $LastChangedBy$
// $LastChangedDate$
// $URL$
//

app.addRepository("modules/helma/Aspects.js");

var aspects = {
   setTopics: function(args, func, obj) {
      var param = args[0];
      param.tags = [param.topic || param.addToTopic];
      return args;
   },
   
   upgradeArguments: function(args) {
      var param = args[0];
      var id = args[1] || param.name;
      var mode = args[2] || param.as;
      var url = param.linkto;
      delete(param.name);
      delete(param.as);
      delete(param.linkto);
      return [param, id, mode, url];
   }
}

helma.aspects.addAround(global, "image_macro", function(args, func, obj) {
   args = aspects.upgradeArguments(args);
   var url = args[3];
   url && res.push();
   func.apply(global, args);
   url && link_filter(res.pop(), {}, url);
   return;
});

helma.aspects.addAround(global, "poll_macro", function(args, func, obj) {
   args = aspects.upgradeArguments(args);
   var url = args[3];
   url && res.push();
   func.apply(global, args);
   url && link_filter(res.pop(), {}, url);
   return;
});

helma.aspects.addAround(global, "file_macro", function(args, func, obj) {
   return func.apply(global, aspects.upgradeArguments(args));
});

helma.aspects.addAround(global, "story_macro", function(args, func, obj) {
   return func.apply(global, aspects.upgradeArguments(args));
});

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
}

ImageMgr.prototype.onCodeUpdate = function() {
   return helma.aspects.addBefore(this, "evalImg", aspects.setTopics);
}

Site.prototype.onCodeUpdate = function() {
   helma.aspects.addBefore(this, "main_action", function(args, func, site) {
      res.handlers.day = site.archive;
      res.push();
      list_macro({}, "stories");
      res.data.storylist = res.pop();
      return args;
   });
   return helma.aspects.addBefore(this, "update", function(args, func, site) {
      if (!site.isTransient()) {
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
}

Story.prototype.onCodeUpdate = function() {
   return helma.aspects.addBefore(this, "evalStory", aspects.setTopics);
}

Stories.prototype.onCodeUpdate = function() {
   return helma.aspects.addBefore(this, "evalNewStory", aspects.setTopics);
}
