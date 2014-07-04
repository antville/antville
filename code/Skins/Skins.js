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
//   http://www.apache.org/licenses/LICENSE-2.0
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

/**
 * @fileOverview Defines the Skins prototype.
 */

markgettext("Skins");
markgettext("skins");

/**
 * @name Skins
 * @constructor
 * @param {String} name
 * @param {Skins} parent
 * @property {Skin[]} _children
 * @property {Skin[]} custom
 * @property {Skin[]} modified
 * @property {String} name
 * @property {Skins} parent
 * @extends HopObject
 */
Skins.prototype.constructor = function(name, parent) {
  this.name = name;
  this.parent = parent;
  return this;
}

/**
 *
 * @param {String} action
 * @returns {Boolean}
 */
Skins.prototype.getPermission = function(action) {
  return res.handlers.layout.getPermission("main");
}

/**
 *
 * @param {String} name
 * @returns {Skins|Skin}
 */
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

Skins.prototype.onRequest = function() {
  if (this.parent) {
    res.redirect(res.handlers.layout.skins.href(req.action));
  }
  return HopObject.prototype.onRequest.call(this);
}

Skins.prototype.main_action = function() {
  res.data.title = gettext("Basic Skins");
  res.data.body = this.renderSkinAsString("$Skins#main");
  res.handlers.site.renderSkin("Site#page");
  return;
}

Skins.prototype.create_action = function() {
  if (req.postParams.save) {
    try {
      var prototype = req.postParams.prototype;
      var name = stripTags(req.postParams.name);
      if (!prototype || !req.postParams.name) {
        throw Error(gettext("Please choose a prototype and enter a skin name"));
      } else if (name !== req.postParams.name || /\s/.test(name) || NAMEPATTERN.test(name)) {
        throw Error(gettext("Please avoid special characters or HTML code in the name field."));
      } else if (Skin.getByName(prototype, name)) {
        throw Error("Sorry, there is already a skin with that name. Please enter a different one.");
      }
      var skin = this.getSkin(prototype, name);
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
  res.data.title = gettext('Add Skin');
  res.data.action = this.href(req.action);
  HopObject.confirmConstructor(Skin);
  res.data.body = (new Skin).renderSkinAsString("$Skin#edit");
  this.renderSkin("$Skins#page");
  return;
}

Skins.prototype.modified_action = function() {
  res.data.title = gettext("Modified Skins");
  res.push();
  this.renderSkin("$Skins#header");
  this.modified.forEach(function() {
    this.renderSkin("$Skin#listItem");
  });
  res.data.body = res.pop();
  res.handlers.site.renderSkin("Site#page");
  return;
}

Skins.prototype.all_action = function() {
  if (this.parent) {
    res.redirect(res.handlers.layout.skins.href(req.action));
  }
  res.data.list = this.getOutline();
  res.data.title = gettext("All Skins");
  res.data.body = this.renderSkinAsString("$Skins#all");
  res.handlers.site.renderSkin("Site#page");
  return;
}

Skins.prototype.safe_action = function() {
  res.data.title = gettext("Modified Skins");
  res.push();
  this.modified.forEach(function() {
    this.renderSkin("$Skin#listItem");
  });
  res.data.title = "Modified Skins";
  res.data.body = res.pop();
  this.renderSkin("$Skins#page");
  return;
}

/**
 *
 * @param {String} group
 * @param {String} name
 * @returns {Skin}
 */
Skins.prototype.getSkin = function(group, name) {
  return Skin.getByName(group, name) || new Skin(group, name);
}

/**
 *
 * @returns {String}
 */
Skins.prototype.getOutline = function() {
  var skinfiles, prototype, skin, subskins, names, skins = [];
  var options = Skin.getPrototypeOptions();

  for each (var option in options) {
    names = [];
    prototype = option.value;
    skinfiles = app.getSkinfilesInPath(res.skinpath);
    skin = createSkin(skinfiles[prototype][prototype]);
    subskins = skin.getSubskinNames();
    for each (var subskin in subskins) {
      names.push(subskin);
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
      html.openTag("a", {href: "#" + prototype});
      res.write(prototype);
      html.closeTag("a");
      html.openTag("ul");
      for each (var name in skin) {
        subskin = this.getSkin(prototype, name);
        html.openTag("li");
        html.link({href: subskin.href("edit")},
            subskin.prototype + "." + subskin.name);
        html.closeTag("li");
      }
      html.closeTag("ul");
      html.closeTag("li");
    }
  }
  return res.pop();
}
