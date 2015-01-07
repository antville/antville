// The Antville Project
// http://code.google.com/p/antville
//
// Copyright 2001–2014 by the Workers of Antville.
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

/**
 * @fileOverview Defines the Skins prototype.
 */

markgettext('Skins');
markgettext('skins');

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
  return res.handlers.layout.getPermission('main');
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
    if (global[group] || group === 'Global') {
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
  res.data.title = gettext('Basic Skins');
  res.data.body = this.renderSkinAsString('$Skins#main');
  res.handlers.site.renderSkin('Site#page');
  return;
}

Skins.prototype.create_action = function() {
  if (req.postParams.save) {
    try {
      var prototype = req.postParams.prototype;
      var name = stripTags(req.postParams.name);
      if (!prototype || !req.postParams.name) {
        throw Error(gettext('Please choose a prototype and enter a skin name'));
      } else if (name !== req.postParams.name || /\s/.test(name) || NAMEPATTERN.test(name)) {
        throw Error(gettext('Please avoid special characters or HTML code in the name field.'));
      } else if (Skin.getByName(prototype, name)) {
        throw Error('Sorry, there is already a skin with that name. Please enter a different one.');
      }
      var skin = this.getSkin(prototype, name);
      skin.update(req.postParams);
      res.message = gettext('The changes were saved successfully.');
      if (req.postParams.save == 1) {
        res.redirect(skin.href('edit'));
      } else {
        res.redirect(res.handlers.layout.skins.href('modified'));
      }
    } catch (ex) {
      res.message = ex;
      app.log(ex);
    }
  }
  res.data.title = gettext('Add Skin');
  res.data.action = this.href(req.action);
  HopObject.confirmConstructor(Skin);
  res.data.body = (new Skin).renderSkinAsString('$Skin#edit');
  this.renderSkin('$Skins#page');
  return;
}

Skins.prototype.modified_action = function() {
  res.data.title = gettext('Modified Skins');
  res.data.list = renderList(this.modified, '$Skin#listItem');
  res.data.body = this.renderSkinAsString('$Skins#list');
  res.handlers.site.renderSkin('Site#page');
  return;
}

Skins.prototype.all_action = function() {
  if (this.parent) {
    res.redirect(res.handlers.layout.skins.href(req.action));
  }
  res.push()
  for each (let set in this.getListOfSkins()) {
    res.write(renderList(set[1], '$Skin#listItem'));
  }
  res.data.list = res.pop();
  res.data.title = gettext('All Skins');
  res.data.body = this.renderSkinAsString('$Skins#list');
  res.handlers.site.renderSkin('Site#page');
  return;
}

Skins.prototype.safe_action = function() {
  res.data.title = gettext('Modified Skins (Safe Mode)');
  res.data.list = renderList(this.modified, '$Skin#listItem');
  res.data.body = this.renderSkinAsString('$Skins#list');
  this.renderSkin('$Skins#page');
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
Skins.prototype.getListOfSkins = function() {
  var result = [];
  var options = Skin.getPrototypeOptions();
  for each (var option in options) {
    var skins = [];
    var prototype = option.value;
    var skinfiles = app.getSkinfilesInPath(res.skinpath);
    var skin = createSkin(skinfiles[prototype][prototype]);
    for each (var name in skin.getSubskinNames()) {
      var subskin = this.getSkin(prototype, name);
      skins.push(subskin);
    }
    skins.sort();
    result.push([prototype, skins]);
  }
  return result;
}
