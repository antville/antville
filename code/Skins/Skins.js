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
// $Revision:3337 $
// $LastChangedBy:piefke3000 $
// $LastChangedDate:2007-09-21 15:54:30 +0200 (Fri, 21 Sep 2007) $
// $URL$
//

Skins.remove = function(skins) {
   skins || (skins = this);
   if (skins.constructor === Skins) {
      while (skins.size() > 0) {
         HopObject.remove(skins.get(0));
      }
   }
   return;
}

Skins.prototype.constructor = function(name, parent) {
  this.name = name; 
  this.parent = parent;
  return this;
}

Skins.prototype.getPermission = function(action) {
   return res.handlers.layout.getPermission("main");
}

Skins.prototype.getChildElement = function(name) {
   if (this.parent) {
      var group = path[path.length - 1].name;
      var skin = this.getSkin(group, name);
      if (skin) {
         return skin;
      }
      if (global[group] || group === "Global") {
         return this.getSkin(group, name);         
      }
   }
   return new Skins(name, this);
}

Skins.prototype.main_action = function() {
   if (!this._parent) {
      res.redirect(res.handlers.layout.skins.href());
   }
   res.data.title = gettext("Custom skins of {0}", this._parent.title);
   res.data.list = this.renderSkinAsString("$Skins#basic");
   res.data.body = this.renderSkinAsString("$Skins#main");
   res.handlers.site.renderSkin("Site#page");
   return;
}

Skins.prototype.getOutline = function(type) {
   var key = "outline:" + type;
   var outline = this.cache[key];
   if (outline) {
      return outline;
   }

   var prototype, skin, subskins, names, skins = [];
   var options = Skin.getPrototypeOptions();

   for each (var option in options) {
      prototype = option.value;
      names = [];
      for (var name in app.skinfiles[prototype]) {
         if (name === prototype && type !== "custom") {
            skin = createSkin(app.skinfiles[prototype][name]);
            subskins = skin.getSubskinNames();
            for each (var subskin in subskins) {
               names.push(subskin);
            }
         } else if (name !== prototype && type === "custom") {
            names.push(name);
         }
      }
      names.sort();
      skins.push([prototype, names]);
   }
      
   res.push();
   for each (var item in skins) {
      prototype = item[0];
      skin = item[1];
      if (skin && skin.length > 0) {
         html.openTag("li");
         html.openTag("a", {href: "#", name: prototype, id: prototype});
         res.write(prototype);
         html.closeTag("a");
         html.openTag("ul");
         for each (var name in skin) {
            subskin = this.getSkin(prototype, name);
            subskin.renderSkin("$Skin#listItem");
         }
         html.closeTag("ul");
         html.closeTag("li");
      }
   }
   return this.cache[key] = res.pop();
 };

Skins.prototype.create_action = function() {
   var skin = this.getSkin(req.postParams.prototype, req.postParams.name);
   if (req.postParams.save) {
      try {
         if (!req.postParams.prototype || !req.postParams.name) {
            throw Error("Please choose a prototype and enter a skin name");
         }
         skin.update(req.postParams);
         res.message = gettext("The changes were saved successfully.");
         if (req.postParams.save == 1) {
            res.redirect(skin.href("edit"));
         } else {
            res.redirect(res.handlers.layout.skins.href("modified"));
         }
      } catch (ex) {
         res.message = ex;
         app.log(ex);
      }
   }
   if (skin.getSource()) {
      res.data.title = gettext("Edit skin {0}.{1} of {2}", 
            skin.prototype, skin.name, res.handlers.site.title);
   } else {
      res.data.title = gettext('Create a custom skin of {0}', 
            res.handlers.site.title);
   }
   res.data.action = this.href(req.action);
   res.data.body = skin.renderSkinAsString("$Skin#edit");
   this.renderSkin("$Skins#page");
   return;
}

Skins.prototype.modified_action = function() {
   res.data.title = gettext("Modified skins of {0}", this._parent.title);
   res.push();
   this.modified.forEach(function() {
      this.renderSkin("$Skin#listItem");
   });
   res.data.list = res.pop();
   res.data.body = this.renderSkinAsString("$Skins#main");
   res.handlers.site.renderSkin("Site#page");
   return;
}

Skins.prototype.advanced_action = function() {
   if (this.parent) {
      res.redirect(res.handlers.layout.skins.href());
   }
   res.data.list = this.getOutline();
   res.data.title = gettext("Skins of {0}", res.handlers.site.title);
   res.data.body = this.renderSkinAsString("$Skins#main");
   res.handlers.site.renderSkin("Site#page");
   return;
}

// FIXME: i'd like to have this by default (ie. always safe)
Skins.prototype.safe_action = function() {
   res.data.title = gettext("Modified skins of {0}", this._parent.title);
   res.push();
   this.modified.forEach(function() {
      this.renderSkin("$Skin#listItem");
   });
   res.data.list = res.pop();
   res.data.body = this.renderSkinAsString("$Skins#main");
   this.renderSkin("$Skins#page");
   return;
}

Skins.prototype.getSkin = function(group, name) {
   return Skin.getByName(group, name) || new Skin(group, name);
}
