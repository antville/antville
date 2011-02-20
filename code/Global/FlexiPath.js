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
//    http://www.apache.org/licenses/LICENSE-2.0
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
 * @fileoverview Defines the FlexiPath prototype.
 */

var FlexiPath = function(name, parent) {
   var self = this;

   this._id = name;
   this._parent = parent;
   this._patterns = {};

   this.__defineGetter__("patterns", function() {
      var ref = this;
      while (ref._parent.constructor === FlexiPath) {
         ref = ref._parent;
      }
      return ref._patterns;
   });

   this.addUrlPattern = function(pattern, callback) {
      this._patterns[pattern] = callback;
      return;
   }

   this.href = function(action) {
      var href = [];
      var ref = this;
      while (ref._parent === this.constructor) {
         href.unshift(ref._id);
         ref = ref._parent;
      }
      //href.push("/");
      if (action) {
         href.push(action);
      }
      return root.api.href() + href.join("/");
   }

   this.getChildElement = function(name) {
      return new this.constructor(name, self);
   }

   return this;
};

FlexiPath.prototype.main_action = function() {
   for (let pattern in this.patterns) {
      let match;
      let re = new RegExp(pattern);
      if (match = req.path.match(re)) {
         return this.patterns[pattern].apply(this, match);
      }
   }
   return;
}
