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
 * @fileoverview Defines the Feature prototype.
 * Another trial to implement modular features.
 */

/**
 * Renders the main() method of a feature, if available.
 * @param {Object} param The default Helma macro parameter object
 * @param {String} id The identifier of the desired feature.
 */
global.feature_macro = function(param, id) {
  var func, feature = Feature.get(id);
  if (feature && (func = feature.main)) {
    func.constructor === Function && func(param);
  }
  return;
}

/**
 * @constructor
 * @property {String} id The feature’s unique identifier.
 * @param {String} id A unique identifier for the feature.
 * @param {String} url The URL of the website providing further information about the feature.
 * @param {Object} feature The initial properties of the feature.
 */
var Feature = function(id, url, feature) {
  var self = this;

  this.__defineGetter__('id', function() {return id});

  for (let i in feature) {
    this[i] = feature[i];
  }

  this.toString = function() {
    return '[Feature: ' + html.linkAsString({href: url}, id) + ']';
  }

  return this;
}

/**
 * Adds a feature to the registry.
 * @see Feature
 * @returns {Feature}
 */
Feature.add = function(id, url, feature) {
  if (!id || !url) {
    throw Error('Insufficient arguments');
  }

  var existingFeature = Feature.get(id);
  if (existingFeature) {
    app.log('Warning! Overwriting already present feature with ID ' + id);
    Feature.remove(existingFeature);
  }

  Feature.list().push(new Feature(id, url, feature));
  return this;
}

/**
 * Removes a feature from the registry.
 * @param {Feature} feature The feature object to be removed.
 * @returns {Number} The resulting number of features still in the registry.
 */
Feature.remove = function(feature) {
  var features = Feature.list();
  if (feature === '*') {
    features.length = 0;
  } else if (feature) {
    var index = features.indexOf(feature);
    (index > -1) && features.splice(index, 1);
  }
  return features.length;
}

/**
 * Lists all available features in the registry.
 * @returns {Feature[]}
 */
Feature.list = function() {
  return app.data.features;
}

/**
 * Retrieves a feature from the registry.
 * @param {String} id The identifier of the desired feature.
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
 * Invokes a (callback) function for a feauture.
 * @param {String} id The identifier of the desired feature. '*' can be used to address all available features.
 * @param {Function|String} callback The callback function or the name of method of the feature.
 * @returns {Object}
 */
Feature.invoke = function(id, callback) {
  id || (id = '*');
  if (callback) {
    var feature, method, result;
    var args = Array.prototype.slice.call(arguments, 2);
    if (id === '*') {
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
 * Wrapper for the Feature._getPermission method. All registered features will be evaluated.
 * @param {String} action The desired action to be invoked.
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