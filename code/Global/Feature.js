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

var Feature = function(name, id, description) {
   if (!name || !id) {
      throw Error("Insufficient arguments");
   }
   var feature;
   if (feature = Feature.get(id)) {
      app.log("Already registered a feature with ID " + id);
      return feature;
   }
   this.id = id;
   this.name = name;
   this.description = description;
   Feature.add(this);
   return this;
}

Feature.add = function(feature) {
   app.data.features.push(feature);
   return this;
}

Feature.remove = function(feature) {
   if (feature) {
      var index = app.data.features.indexOf(feature);
      (index > -1) && app.data.features.splice(index, 1);
   } else {
      app.data.features.length = 0;
   }
   return null;
}

Feature.get = function(id) {
   for each (let feature in app.data.features) {
      if (feature.id === id) {
         return feature;
      }
   }
   return null;
}

Feature.invoke = function(methodNameOrFunction, args) {
   var func, result = null;
   for each (let feature in app.data.features) {
      if (methodNameOrFunction.constructor === Function) {
         result = methodNameOrFunction.apply(feature, args);
      } else if (func = feature[methodNameOrFunction]) {
         result = func.apply(feature, args);
      }
   }
   return result;
}

Feature.prototype.handle = function(methodName, func) {
   this[methodName] = func;
   return this;
}

Feature.prototype.toString = function() {
   return html.linkAsString({href: this.id}, "Feature: " + this.name);
}
