//
// The Antville Project
// http://code.google.com/p/antville
//
// Copyright 2001-2007 by The Antville People
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
//

/**
 * @fileoverview Fields and methods of the Metadata prototype.
 */

// Resolve dependencies
app.addRepository("modules/core/Object.js");

Metadata.PREFIX = Metadata().__name__.toLowerCase() + "_";

// Save internal methods for good
/** @ignore */
Metadata.prototype._get = Metadata.prototype.get;
/** @ignore */
Metadata.prototype._set = Metadata.prototype.set;

/**
 * Retrieves the name of the property that contains the data for the 
 * Metadata instance. The name is constructed out of the instances's mountpoint 
 * and the suffix "_data".
 * @returns The resulting value
 * @type String
 */
Metadata.prototype.getDataSourceName = function() {
   return Metadata.PREFIX + "source";
};

/**
 * Retrieves the properties and values of the Metadata instance from the parent 
 * node.
 */
Metadata.prototype.load = function() {
   return eval(this._parent[this.getDataSourceName()]);
};

/**
 * Copies the properties and values of the Metadata instance to the parent 
 * node.
 */
Metadata.prototype.save = function() {
   var ref = this.cache.data || {};
   this._parent[this.getDataSourceName()] = ref.toSource();
   return;
};

/**
 * Retrieves the value of a property of the Metadata instance. If no argument
 * is given the complete metadata structure is returned.
 * @param {String} key The name of the desired property
 * @returns The resulting value
 */
Metadata.prototype.get = function(key) {
   if (this.cache.data == null) {
      this.cache.data = this.load() || {};
   }
   return (arguments.length > 0) ? this.cache.data[key] : this.cache.data;
};

/**
 * Copies a value into a property of the Metadata instance. If the first 
 * argument is omitted the complete metadata is replaced with the second
 * argument.
 * @param {String} key The name of the desired property
 * @param {Object} value The future value of the property
 */
Metadata.prototype.set = function(key, value) {
   if (arguments.length > 1) {
      // Coerce Java classes into String prototypes
      if (value && !value.constructor) {
         value = String(value);
      }
      this.get()[key] = value;
   } else if (arguments.length > 0) {
      value = arguments[0];
      if (value instanceof Object === false) {
         value = value.clone({});
      }
      this.cache.data = value;
   }
   this.save();
   return;
};

/**
 * Removes a property from the Metadata instance.
 * @param {String} key The name of the desired property
 */
Metadata.prototype.remove = function(key) {
   delete this.cache.data[key];
   this.save();
   return;
};

/**
 * Removes all properties and values from the Metadata instance.
 */
Metadata.prototype.destroy = function() {
   delete this.cache.data;
   this.save();
   return;
};

/**
 * Get all valid keys of the Metadata instance.
 * @returns The list of valid keys
 * @type Array
 */
Metadata.prototype.keys = function() {
   var cache = this.get();
   var keys = [];
   for (var i in cache) {
      keys.push(i);
   }
   return keys;
};

/**
 * Retrieves the number of properties contained in the Metadata instance.
 * @returns The size of the Metadata instance.
 * @type Number
 */
Metadata.prototype.size = function() {
   return this.keys().length;   
};

/**
 * Concatenates a string representation of the Metadata instance.
 * @returns A string representing the Metadata object
 * @type String
 */
Metadata.prototype.toString = function() {
   res.push();
   var keys = this.keys();
   res.write("[Metadata (");
   if (keys.length < 1) {
      res.write("empty");
   } else {
      res.write(keys.length);
      res.write(" element");
      if (keys.length > 1) {
         res.write("s");
      }
   }
   res.write(")]");
   return res.pop();
};

/**
 * Concatenates the source of the underlying HopObject of the Metadata 
 * instance. Useful for debugging purposes.
 * @returns The source of the underlying HopObject.
 * @type String
 */
Metadata.prototype.toSource = function() {
   return this.get().toSource();
};

/**
 * Retrieves all properties and values of the Metadata instance.
 * @returns The property map of the Metadata instance
 * @type Object
 * @deprecated Use get() without a parameter instead.
 */
Metadata.prototype.getData = function() {
   return this.get();
};

/**
 * Replaces all properties and values of the Metadata instance with those of
 * another object.
 * @param {Object} obj The replacing data
 * @type Boolean
 * @deprecated Use set() with a single object parameter instead.
 */
Metadata.prototype.setData = function(obj) {
   obj && this.set(obj);
   return;
};

// FIXME: Should this really be included here?
Metadata.prototype.getFormValue = function(name) {
   if (req.isPost()) {
      return req.postParams[name];
   } else {
      return this.get(name) || req.queryParams[name] || String.EMPTY;
   }
}

Metadata.prototype.onUnhandledMacro = function(name) {
   return this.get(name);
}
