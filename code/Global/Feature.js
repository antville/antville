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
// $Author$
// $Date$
// $URL$

/**
 * @fileoverview Defines the Feature prototype.
 */

/**
 * 
 * @param {Object} param
 * @param {String} id
 */
global.feature_macro = function(param, id) {
   var func, feature = Feature.get(id);
   if (feature && (func = feature.main)) {
      func.constructor === Function && func(param);
   }
   return;
}

/**
 *
 * @param {String} id
 * @param {String} url
 * @param {Object} feature
 */
var Feature = function(id, url, feature) {
   var self = this;

   this.__defineGetter__("id", function() {return id});

   for (let i in feature) {
      this[i] = feature[i];
   }

   this.toString = function() {
      return "[Feature: " + html.linkAsString({href: url}, id) + "]";
   }

   return this;
}

/**
 *
 * @param {String} id
 * @param {String} url
 * @param {Object} feature
 * @returns {Feature}
 */
Feature.add = function(id, url, feature) {
   if (!id || !url) {
      throw Error("Insufficient arguments");
   }

   var existingFeature = Feature.get(id);
   if (existingFeature) {
      app.log("Warning! Overwriting already present feature with ID " + id);
      Feature.remove(existingFeature);
   }

   Feature.list().push(new Feature(id, url, feature));
   return this;
}

/**
 *
 * @param {Feature} feature
 * @returns {Number}
 */
Feature.remove = function(feature) {
   var features = Feature.list();
   if (feature === "*") {
      features.length = 0;
   } else if (feature) {
      var index = features.indexOf(feature);
      (index > -1) && features.splice(index, 1);
   }
   return features.length;
}

/**
 *
 */
Feature.list = function() {
   return app.data.features;
}

/**
 *
 * @param {String} id
 * @returns {Feature}
 */
Feature.get = function(id) {
   for each (let feature in Feature.list()) {
      if (feature.id === id) {
         return feature;
      }
   }
   return;
}

/**
 * 
 * @param {String} id
 * @param {Function} callback
 * @returns {Object}
 */
Feature.invoke = function(id, callback) {
   id || (id = "*");
   if (callback) {
      var feature, method, result;
      var args = Array.prototype.slice.call(arguments, 2);
      if (id === "*") {
         for each (feature in Feature.list()) {
            method = feature[String(callback)];
            if (method && method.constructor === Function) {
               result = method.apply(feature, args);
            }
         }
      } else {
         feature = Feature.get(id);
         if (feature) {
            if (callback.constructor === Function) {
               result = callback.apply(feature, args);
            } else {
               method = feature[callback];
               if (method && method.constructor === Function) {
                  result = method.apply(feature, args);
               }
            }
         }
      }
   }
   return result;
}

/**
 *
 * @param {String} action
 * @returns {Boolean}
 */
Feature.getPermission = function(action) {
   for each (let feature in Feature.list()) {
      let method = feature._getPermission;
      if (method && method.constructor === Function && method.call(this, action)) {
         return true;
      }
   }
   return false;
}