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

// Apply with enabled updater repository via ant patch -Dpatch.id=20081211

root.forEach(function() {
  var site = this;
  if (site.layout) {
    res.handlers.layout = site.layout;
    res.skinpath = site.layout.getSkinPath();

    // Fixing the <% if <% comment.created %> %> macro
    var skin = site.layout.skins.getSkin("Comment", "edit");
    var source = skin.getSource();
    var re = /(<%\s+if\s+<%\s+comment\.creat)ed(\s+%>\s+is\s+null)/g;
    var newSource = source.replace(re, function() {
      var replacement = arguments[1] + "or" + arguments[2];
      app.log(arguments[0] + " ==> " + replacement);
      return replacement;
    });
    if (newSource !== source) {
      skin.setSource(newSource);
    }
  }
});
