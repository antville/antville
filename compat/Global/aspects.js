// The Antville Project
// http://code.google.com/p/antville
//
// Copyright 2007-2011 by Tobi Schäfer.
//
// Copyright 2001–2007 Robert Gaggl, Hannes Wallnöfer, Tobi Schäfer,
// Matthias & Michael Platzer, Christoph Lincke.
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
// $Author$
// $Date$
// $URL$

app.addRepository("modules/helma/Aspects.js");

var aspects = {
   setTopics: function(args, func, obj) {
      var param = args[0];
      //res.debug("aspects before: "+param.tags.toSource());
      var topic = param.topic || param.addToTopic;
      if (!param.tags && topic) {
         param.tags = [topic];
      }
      //res.debug("aspects after: " +param.tags.toSource());
      return args;
   },
   
   fixMacroParams: function(args) {
      var param = args[0];
      var id = args[1] || param.name || param.id;
      var mode = args[2] || param.as;
      var url = param.linkto;
      !param.skin && (param.skin = param.useskin);
      delete(param.name);
      delete(param.as);
      delete(param.linkto);
      return [param, id, mode, url];
   },
   
   fixStoryEditorParams: function(args, func, story) {
      // FIXME: IE sends the button text instead of the value; thus, we
      // need to check for the "editableby" property as well :/
      if (req.isPost() && req.postParams.save != 1 && req.postParams.editableby) {
         if (req.postParams.publish) {
            req.postParams.save = 1;
         }
         if (req.postParams.save != 1) {
            req.postParams.save = 1;
            req.postParams.status = Story.CLOSED;
         } else if (req.postParams.editableby) {
            req.postParams.status = req.postParams.editableby
         }
         req.postParams.mode = (req.postParams.addToFront ? 
               Story.FEATURED : Story.HIDDEN);
         req.postParams.commentMode = (req.postParams.discussions ? 
               Story.OPEN : Story.CLOSED);
      }
      req.postParams.addToFront = null;
      req.postParams.discussions = null;
      req.postParams.editableby = null;
      req.postParams.publish = null;      
      return args;
   },
   
   fixPager: function(args, func, obj) {
      var archive = res.handlers.day = obj.archive || obj;
      res.push();
      archive.stories_macro();
      res.data.storylist = res.pop();
      res.push();
      archive.link_macro({}, "previous", gettext("Previous page"));
      res.data.prevpage = res.pop();
      res.push();
      archive.link_macro({}, "next", gettext("Next page"));
      res.data.nextpage = res.pop();
      return args;
   }
}

helma.aspects.addAround(global, "image_macro", function(args, func) {
   args = aspects.fixMacroParams(args);
   var url = args[3];
   url && res.push();
   func.apply(global, args);
   url && res.write(link_filter(res.pop(), {}, url));
   return;
});

helma.aspects.addAround(global, "poll_macro", function(args, func) {
   return func.apply(global, aspects.fixMacroParams(args));
});

helma.aspects.addAround(global, "file_macro", function(args, func) {
   return func.apply(global, aspects.fixMacroParams(args));
});

helma.aspects.addBefore(global, "story_macro", function(args, func) {
   args = aspects.fixMacroParams(args);
   if (args[0].skin == "display") {
      args[0].skin = "content";
   }
   return args;
});

HopObject.prototype.onCodeUpdate = function() {
   helma.aspects.addAfter(this, "onRequest", function(args, func, obj) {
      res.handlers.members = res.handlers.site.members;
      res.handlers.membermgr = res.handlers.site.members;
      return args;
   });
   helma.aspects.addBefore(this, "skin_macro", function(args, func, obj) {
      param = args[0];
      return [param, args[1] || param.name];
   });
   return helma.aspects.addBefore(this, "link_macro", function(args, func, obj) {
      var param = args[0];
      var to = param.to;
      delete param.to;
      // Compatibility for more recent link macros, doing a lot of i18n witchcraft
      var url = args[1] || ".";
      var text = args[2];
      var action = url.split(/#|\?/)[0];
      if (!text) {
         action === "." && (action = obj._id);
         text = gettext(action.capitalize());
      }
      return [param, to || url, param.text || text, args[3]];
   });
}

Archive.prototype.onCodeUpdate = function() {
   return helma.aspects.addBefore(this, "main_action", aspects.fixPager);
}

Image.prototype.onCodeUpdate = function() {
   return helma.aspects.addBefore(this, "update", aspects.setTopics);
}

Images.prototype.onCodeUpdate = function() {
   return helma.aspects.addAround(this, "getPermission", function(args, func, images) {
      var permission = func.apply(images, args);
      if (!permission) {
         switch (args[0]) {
            case "topics":
            return true;
         }
      }
      return permission;
   });
}

Layout.prototype.onCodeUpdate = function() {
   helma.aspects.addAround(this, "getPermission", function(args, func, layout) {
      var permission = func.apply(layout, args);
      if (!permission) {
         switch (args[0]) {
            case "convert":
            return true;
         }
      }
      return permission;
   });
   return helma.aspects.addAround(this, "image_macro", function(args, func, layout) {
      args = aspects.fixMacroParams(args);
      var url = args[3];
      url && res.push();
      func.apply(layout, args);
      url && link_filter(res.pop(), {}, url);
      return;
   });
}

Members.prototype.onCodeUpdate = function() {
   helma.aspects.addAround(this, "getPermission", function(args, func, members) {
      var permission = func.apply(members, args);
      if (!permission) {
         switch(args[0]) {
            case "sendpwd":
            return true;
         }
      }
      return permission;
   });
}

Site.prototype.onCodeUpdate = function() {
   helma.aspects.addAround(this, "getPermission", function(args, func, site) {
      var permission = func.apply(site, args);
      if (!permission) {
         switch(args[0]) {
            case "rss":
            case "feeds":
            case "mostread":
            return true;
         }
      }
      return permission;
   });
   
   return helma.aspects.addBefore(this, "main_action", aspects.fixPager);
}

Story.prototype.onCodeUpdate = function() {
   helma.aspects.addBefore(this, "edit_action", aspects.fixStoryEditorParams);
   return helma.aspects.addBefore(this, "update", aspects.setTopics);
}

Stories.prototype.onCodeUpdate = function() {
   return helma.aspects.addBefore(this, "create_action",
         aspects.fixStoryEditorParams);
}
