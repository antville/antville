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
// $Author$
// $Date$
// $URL$

app.addRepository("modules/helma/Aspects.js");

(function() {

  function skinMayDisplayEditLink(name) {
    return req.cookies[User.COOKIE + 'LayoutSandbox'] &&
      res.handlers.layout.getPermission('main') &&
      typeof name === 'string' &&
      !name.startsWith('$') &&
      res.contentType === 'text/html';
  }

  function renderSkin(args, func, object) {
    res.meta.skins || (res.meta.skins = {});

    var name = args[0];
    if (name.startsWith('#')) {
      // Fix names using short form (ie. missing prototype)
      name = object.constructor.name + name;
    }
    var id = name.replace('#', '-').toLowerCase();

    if (skinMayDisplayEditLink(name) && !res.meta.skins[name]) {
      res.meta.skins[name] = true;
      var parts = name.split('#');
      var prototype = parts[0];
      var skinName = parts[1];
      var skin = new Skin(prototype, skinName);
      res.writeln('<!-- Begin of #skin-' + id + ' -->');
      res.writeln('<div id="skin-' + id + '" class="skin" data-name="' +
          name + '" data-href="' + skin.href('edit') + '">');
      func.apply(object, args);
      res.writeln('</div>\n<!-- End of #skin-' + id + ' -->');
    } else {
      func.apply(object, args);
    }

    return;
  }

  function renderSkinAsString(args, func, object) {
    var name = args[0];
    if (skinMayDisplayEditLink(name)) {
      res.push();
      object.renderSkin.apply(object, args);
      return res.pop();
    }
    return func.apply(object, args);
  }

  var prototypes = app.__app__.getPrototypes().toArray();
  for each (var prototype in prototypes) {
    if (prototype.name in global) {
      global[prototype.name].prototype.onCodeUpdate = function() {
        this.__renderSkin__ = this.renderSkin;
        this.__renderSkinAsString__ = this.renderSkinAsString;
        helma.aspects.addAround(this, 'renderSkin', renderSkin);
        helma.aspects.addAround(this, 'renderSkinAsString', renderSkinAsString);
      }
    }
  }

}());
