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
 * @fileOverview Defines the Skin prototype
 */

markgettext('Skin');
markgettext('skin');

/**
 *
 * @param {String} group
 * @param {String} name
 * @returns {Skin}
 */
Skin.getByName = function(group, name) {
  var skinSet = (res.handlers.layout || path.layout).skins.get(group);
  if (skinSet) {
    var skin = skinSet.get(name);
    if (skin) {
      return skin;
    }
  }
  return null;
}

/**
 * @param {String} prototype
 * @param {String} name
 * @param {Layout} layout
*/
Skin.add = function(prototype, name, layout) {
  var skin = new Skin(prototype, name);
  layout.skins.add(skin);
  return skin;
}

/**
 *
 * @param {Skin} skin
 */
Skin.remove = function() {
  if (this.constructor === Skin) {
    this.setSource(this.source);
    this.source = null;
    this.remove();
  }
  return;
}

/**
 * @returns  {String[]}
 */
Skin.getPrototypeOptions = function() {
  var prototypes = [];
  var content, file;
  var skinFiles = app.getSkinfilesInPath(res.skinpath);
  for (var name in skinFiles) {
    // Include root skins only for root site
    if (name === root.constructor.name && res.handlers.site !== root) {
      continue;
    }
    if (skinFiles[name][name]) {
      prototypes.push({value: name, display: name});
    }
  }
  return prototypes.sort(new String.Sorter('display'));
}

/**
 * @name Skin
 * @constructor
 * @param {String} prototype
 * @param {String} name
 * @property {Date} created
 * @property {User} creator
 * @property {Layout} layout
 * @property {Date} modified
 * @property {User} modifier
 * @property {String} prototype
 * @property {String} source
 * @extends HopObject
 */
Skin.prototype.constructor = function(prototype, name) {
  HopObject.confirmConstructor(this);
  this.prototype = prototype || String.EMPTY;
  this.name = name || String.EMPTY;
  this.creator = this.modifier = session.user;
  this.created = this.modified = new Date;
  return this;
}

/**
 *
 * @param {String} action
 * @returns {Boolean}
 */
Skin.prototype.getPermission = function(action) {
  switch (action) {
    case '.':
    case 'main':
    return true;
  }
  return res.handlers.skins.getPermission('main');
}

/**
 *
 * @param {String} action
 * @returns {String}
 */
Skin.prototype.href = function(action) {
  res.push();
  res.write(res.handlers.layout.skins.href());
  res.write(this.prototype);
  res.write('/');
  res.write(this.name);
  res.write('/');
  action && (res.write(action));
  return res.pop();
}

Skin.prototype.main_action = function() {
  if (res.handlers.site === root) {
    res.contentType = 'text/plain';
    res.write(this.getSource());
    return;
  }
  res.redirect(this.href('edit'));
  return;
}

Skin.prototype.edit_action = function() {
  if (req.postParams.save) {
    try {
      var url = this.href(req.action);
      this.update(req.postParams);
      res.message = gettext('The changes were saved successfully.');
      if (req.postParams.save == 1) {
        res.redirect(url);
      } else {
        res.redirect(res.handlers.layout.skins.href('modified'));
      }
    } catch (ex) {
      res.message = ex;
      app.log(ex);
    }
  }
  res.data.action = this.href(req.action);
  res.data.title = gettext('Edit Skin: {0}.{1}', this.prototype, this.name);
  res.data.body = this.renderSkinAsString('$Skin#edit');
  res.handlers.skins.renderSkin('$Skins#page');
  return;
}

/**
 *
 * @param {Object} data
 */
Skin.prototype.update = function(data) {
  if (this.isTransient()) {
    res.handlers.layout.skins.add(this);
    this.source = this.getSource(); // Copies the skin file source to database
  }
  if (this.prototype === 'Site' && this.name === 'page') {
    var macro = 'response.body';
    if (!createSkin(data.source).containsMacro(macro)) {
      var macro = ['<code><%', macro, '%></code>'].join(String.EMPTY);
      throw Error(gettext('The {0} macro is missing. It is essential for accessing the site and must be present in this skin.', macro));
    }
  }
  this.setSource(data.source);
  this.touch();
  return;
}

Skin.prototype.reset_action = function() {
  if (req.postParams.proceed) {
    try {
      Skin.remove.call(this);
      res.message = gettext('{0} was successfully reset.', gettext('Skin'));
      res.redirect(res.handlers.layout.skins.href('modified'));
    } catch(ex) {
      res.message = ex;
      app.log(ex);
    }
  }

  res.data.action = this.href(req.action);
  res.data.title = gettext('Confirm Reset');
  res.data.body = this.renderSkinAsString('$HopObject#confirm', {
    text: this.getConfirmText()
  });
  res.handlers.site.renderSkin('Site#page');
  return;
}

Skin.prototype.compare_action = function() {
  var originalSkin = this.source || String.EMPTY;
  var diff = this.getSource().diff(originalSkin);
  if (!diff) {
    res.message = gettext('No differences were found.');
  } else {
    res.push();
    var param = {}, leftLineNumber = rightLineNumber = 0;
    for each (let line in diff) {
      if (line.deleted) {
        param.right = encode(line.value);
        param.leftStatus = 'added';
        param.rightStatus = '';
        for (let i=0; i<line.deleted.length; i++) {
          leftLineNumber += 1;
          param.leftLineNumber = leftLineNumber;
          param.rightLineNumber = '';
          param.left = encode(line.deleted[i]);
          param.right = '';
          this.renderSkin('$Skin#difference', param);
        }
      }
      if (line.inserted) {
        param.left = encode(line.value);
        param.leftStatus = '';
        param.rightStatus = 'removed';
        for (let i=0; i<line.inserted.length; i++) {
          rightLineNumber += 1;
          param.leftLineNumber = '';
          param.rightLineNumber = rightLineNumber;
          param.left = '';
          param.right = encode(line.inserted[i]);
          this.renderSkin('$Skin#difference', param);
        }
      }
      if (line.value !== null) {
        leftLineNumber += 1;
        rightLineNumber += 1;
        param.leftLineNumber = leftLineNumber;
        param.rightLineNumber = rightLineNumber;
        param.leftStatus = param.rightStatus = '';
        param.left = encode(line.value);
        param.right = param.left;
        this.renderSkin('$Skin#difference', param);
      }
    }
    res.data.diff = res.pop();
  }

  res.data.title = gettext('Compare Skin: {0}', this.getTitle());
  res.data.body = this.renderSkinAsString('$Skin#compare');
  res.handlers.skins.renderSkin('$Skins#page');
  return;
}

/**
 *
 * @return {String}
 */
Skin.prototype.getTitle = function() {
  return this.prototype + '.' + this.name;
}

/**
 *
 * @param {String} name
 * @return {Object}
 */
Skin.prototype.getFormOptions = function(name) {
  switch (name) {
    case 'prototype':
    return Skin.getPrototypeOptions();
  }
}

Skin.prototype.getFormValue = function(name) {
  switch (name) {
    case 'source':
    return req.data.source || this.getSource();
  }
  return HopObject.prototype.getFormValue.apply(this, arguments);
}

/**
 * @returns {String}
 */
Skin.prototype.getSource = function() {
  var skin;
  // FIXME: Maintain skin inheritance by checking if we target the Site skin of root
  if (res.handlers.site === root && this.prototype === 'Site') {
    skin = this.getSubskin('Root');
    if (skin) {
      return skin.getSource();
    }
  }
  skin = this.getSubskin();
  if (skin) {
    return skin.getSource();
  }
  return null;
}

/**
 *
 * @param {String} source
 */
Skin.prototype.setSource = function(source) {
  // FIXME: Maintain skin inheritance by checking if we target the Site skin of root
  var prototype = (res.handlers.site === root && this.prototype === 'Site') ? 'Root' : this.prototype;
  var skin = this.getMainSkin(prototype);
  if (!skin) {
    return;
  }

  res.push();
  if (source != null) {
    res.writeln('<% #' + this.name + ' %>');
    res.writeln(source.trim().replace(/(<%\s*)#/g, '$1// #'));
  }
  var subskins = skin.getSubskinNames();
  for (var i in subskins) {
    if (subskins[i] !== this.name) {
      res.writeln('<% #' + subskins[i] + ' %>');
      source = skin.getSubskin(subskins[i]).source;
      source && res.writeln(source.trim());
    }
  }
  source = res.pop();

  var file = this.getStaticFile();
  if (!file.exists()) {
    file.getParentFile().mkdirs();
    file.createNewFile();
  }
  var fos = new java.io.FileOutputStream(file);
  var bos = new java.io.BufferedOutputStream(fos);
  var writer = new java.io.OutputStreamWriter(bos, 'UTF-8');
  writer.write(source);
  writer.close();
  bos.close();
  fos.close();

  this.clearCache();
  return;
}

/**
 *
 * @returns {java.io.File}
 */
Skin.prototype.getStaticFile = function() {
  // FIXME: Maintain skin inheritance by checking if we target the Site skin of root
  var prototype = (res.handlers.site === root && this.prototype === 'Site') ? 'Root' : this.prototype;
  return new java.io.File(res.skinpath[0], prototype + '/' + this.prototype + '.skin');
}

/**
 * @param {String} prototype
 * @returns {Skin}
 */
Skin.prototype.getMainSkin = function(prototype) {
  var source, skinSet = app.getSkinfilesInPath(res.skinpath)[prototype || this.prototype];
  if (skinSet) {
    source = skinSet[this.prototype];
    if (source !== null) {
      return createSkin(source);
    }
  }
  return null;
}

/**
 *
 * @param prototype
 * @param name
 * @returns {Skin}
 */
Skin.prototype.getSubskin = function(prototype, name) {
  var mainSkin = this.getMainSkin(prototype);
  if (mainSkin) {
    return mainSkin.getSubskin(name || this.name);
  }
  return null;
}

/**
 *
 */
Skin.prototype.render = function() {
  return renderSkin(createSkin(this.getSource()));
}

/**
 *
 * @param {String} source
 * @returns {Boolean}
 */
Skin.prototype.equals = function(source) {
  // FIXME: The removal of linebreaks is necessary but it's not very nice
  var re = /\r|\n/g;
  var normalize = function(str) {
    return str.replace(re, String.EMPTY);
  }
  return normalize(source) === normalize(this.getSource());
}

/**
 * @returns {String}
 */
Skin.prototype.getConfirmText = function() {
  return gettext('You are about to reset the skin {0}.{1}.',
      this.prototype, this.name);
}

/**
 * @returns {String}
 */
Skin.prototype.toString = function() {
  return 'Skin #' + this._id + ': ' + this.prototype + '.' + this.name;
}

/**
 *
 */
Skin.prototype.status_macro = function() {
  return this.isTransient() ? 'inherited' : 'modified';
}

/**
 *
 */
Skin.prototype.content_macro = function() {
  return res.write(this.getSource());
}
