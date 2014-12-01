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
 * @fileOverview Defines the Trails mountpoint.
 */

Trails.load = function (trails) {
  trails || (trails = []);
  if (trails instanceof Array === false) {
    trails = String(trails).split(',');
  }
  trails.forEach(function (name) {
    name = name.trim();
    var repository = new helma.File(app.dir, '../trails/' + name);
    if (repository.exists()) {
      //console.log('Adding trail', repository.toString());
      app.addRepository(repository.toString());
      app.data.trails.push(name);
    }
  });
  return;
};

Trails.prototype.main_action = function () {
  var self = this;
  res.writeln('<h1>Trails</h1><ul>');
  var dir = new helma.File(app.dir, '../trails');
  if (dir.exists()) {
    dir.list().forEach(function (name) {
      var repository = new helma.File(dir, name);
      if (repository.isDirectory()) {
        if (app.data.trails.indexOf(name) > -1) {
          res.writeln('<li><a href="' + self.href(name) + '">' + name + '</a></li>');
        } else {
          res.writeln('<li>' + name + '</li>');
        }
      }
    });
  }
  res.writeln('</ul>');
};
