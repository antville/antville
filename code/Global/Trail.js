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

function Trail(name) {
  var Proto = global[name];
  if (Proto && Proto instanceof Function) {
    return Proto;
  }
  app.log('Undefined trail ' + name);
  return;
}

Trail.invoke = function (name, callback, args) {
  var trail = Trail(name);
  if (trail) {
    callback.apply(trail, args);
  }
};

function trail_macro(param, name, macro) {
  macro || (macro = 'trail');
  var Proto = Trail(name);
  var trail = new Proto();
  var method = trail[macro + '_macro'];
  if (method && method instanceof Function) {
    method.call(trail, param);
  }
  return;
}
