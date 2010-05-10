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
// $Revision: 3704 $
// $LastChangedBy: piefke3000 $
// $LastChangedDate: 2008-09-13 14:01:31 +0200 (Sat, 13 Sep 2008) $
// $URL: https://antville.googlecode.com/svn/trunk/updater/Root/Root.js $
//

// Apply with enabled updater repository via ant patch -Dpatch.id=20080913

root.forEach(function() {
   var site = this;
   if (site.layout) {
      res.handlers.layout = site.layout;
      res.skinpath = site.layout.getSkinPath();
      
      // Fixing the corrupted <% site#history" %> macros
      var skin = site.layout.skins.getSkin("Site", "page");
      var source = skin.getSource();
      
      var newSource = source.replace(/<%(\s+site#(history|searchbox)"[^%]*%>)/g, function() {
         var replacement = "<% // " + arguments[1];
         app.log(arguments[0] + " ==> " + replacement);
         return replacement;
      });
      if (newSource !== source) {
         var delta = source.length - newSource.length;
         //if (Math.abs(delta) > 5) res.debug("!!! Delta in " + site + ": " + delta);
         skin.setSource(newSource);
      }
      
      // Fixing the macro handlers in skins shared between Story and Comment
      ["history", "rss", "result"].forEach(function(name) {
         var skin = site.layout.skins.getSkin("Story", name);
         var source = skin.getSource();
         if (!source) {
            // FIXME: What the heck is going on here?
            app.log("????? " + site.name + ": " + skin);
            return;
         }
         var newSource = source.replace(/(<%\s+)story\./g, function() {
            var replacement = arguments[1] + "this.";
            app.log(arguments[0] + " ==> " + replacement);
            return replacement;
         });
         var delta = source.length - newSource.length;
         if (delta !== 0) {
            //if (Math.abs(delta) > 5) app.log("!!! Delta in " + site + " skin Story:" + name + ": " + delta);
            skin.setSource(newSource);
         }
      });
  } else {
     app.log("Creating missing layout for site " + site.name);
     site.layout = new Layout(site);
   }
});
