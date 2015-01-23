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
 * @fileOverview Defines the Claustra mountpoint.
 */

Claustra.load = function () {
  var claustra = getProperty('claustra', null);
  if (!claustra) {
    return;
  }
  claustra.split(',').forEach(function (name) {
    name = name.trim();
    try {
      var repository = new helma.File(app.dir, '../claustra/' + name);
      console.info('Adding claustra', repository);
      app.addRepository(repository.toString());
      app.data.claustra.push(name);
    } catch (ex) {
      console.error(ex);
    }
  });
  return;
};

Claustra.getByName = function (name) {
  return root.claustra.get(String(name).toLowerCase());
};

Claustra.invoke = function () {
  app.data.claustra.forEach(function (name) {
    let claustra = Claustra.getByName(name);
    if (claustra && claustra.main && claustra.main.constructor === Function) {
      claustra.main();
    }
  });
  return;
};

Claustra.prototype.getPermission = function () {
  return User.require(User.PRIVILEGED);
};

Claustra.prototype.main_action = function () {
  var dir = new helma.File(app.dir, '../claustra');
  if (dir.exists()) {
    var self = this;
    res.push();
    dir.list().forEach(function (name) {
      var repository = new helma.File(dir, name);
      if (repository.isDirectory()) {
        var enabled = !!Claustra.getByName(name);
        var href = enabled ? self.href(name) : '';
        self.renderSkin('$Claustra#listItem', {
          name: name,
          href: href,
          enabled: enabled
        });
      }
    });
    res.data.list = res.pop();
  }
  res.data.title = gettext('Claustra');
  res.data.body = this.renderSkinAsString('$Claustra#main');
  root.renderSkin('Site#page');
  return;
};
