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
 * @fileoverview Defines the Metadata prototype (version 2).
 */

/**
 * Get an object representing the type properties settings suitable for 
 * defining prototypes with the definePrototype() method.
 * @returns {Object} The type properties settings as object.
 * @see {@link http://helma.org/wiki/Defining+HopObject+mappings+programmatically}
 */
Metadata.getTypeProperties = function() {
   return {
      collection: "Metadata",
      "local.1": "$id",
      "foreign.1": "parent_id",
      "local.2": "$prototype",
      "foreign.2": "parent_type",
      accessName: "name"
   }
}

/**
 * Prepare a value for writing it to the metadata database table.
 * The type of each metadata is stored along with its value.
 * The normalize() method determines the type and possibly modifies 
 * the value accordingly.
 * @param {Object} value
 * @returns {Array} Compound value consisting of two elements, 
 * the (normalized) metadata value and its type.
 */
Metadata.normalize = function(value) {
   if (value === null || value === undefined) {
      return [null, null];
   }

   if (!value.constructor) {
      value = String(value);
   }

   var Constructor = value.constructor;
   switch (Constructor) {
      case Boolean:
      case String:
      case Number:
      value = String(value);
      break;

      case Date:
      value = Number(value);
      break;

      default:
      value = value.toSource();
   }
   return [value, Constructor.name];
}

/**
 * @name Metadata
 * @constructor
 * @description The Metadata prototype provides means to store one metadata key-value
 * pair per record in the metadata database table. Each record is assigned to a
 * parent HopObject which is fitted with convenient methods to easily retrieve 
 * and modify the attached metadata objects.
 * @see HopObject#handleMetadata
 * @property {HopObject} parent The HopObject the metadata belongs to.
 * @property {String} name The name (key) of the metadata object.
 * @property {Object} value The value of the metadata object.
 * @property {String} type The type of the metadata object.
 */
Metadata.prototype.constructor = function(parent, name, value) {
   if (parent && name && value) {
      this.parent = parent;
      this.name = name;
      this.setValue(value);
   }
   return this;
}

/**
 * Set the value of a metadata object. If the value equals null
 * the metadata object will be removed.
 * @param {Object} value The desired metadata value.
 */
Metadata.prototype.setValue = function(value) {
   [this.value, this.type] = Metadata.normalize(value);
   if (this.value === null) {
      this.remove();
   }
   return;
}

/**
 * Get the value of a metadata object.
 * @returns {Object} The value of the metadata object.
 */
Metadata.prototype.getValue = function() {
   var Constructor = global[this.type];
   switch (Constructor) {
      case null:
      case undefined:
      return null;

      case Boolean:
      return eval(this.value).valueOf();

      case Date:
      return new Date(Number(this.value));

      case Number:
      case String:
      return (new Constructor(this.value)).valueOf();

      default:
      return eval(this.value);
   }
}

/**
 * Get a textual representation of the metadata object.
 * @returns {String} A textual representation of the metadata object. 
 */
Metadata.prototype.toString = function() {
   return "Metadata of " + this.parent + " (" + this.name + " = " + this.value + ")";
}

/**
 * Handle macros which are not defined elsewhere.
 * @param {String} name The name of the macro.
 * @returns {Object} The resulting value.
 */
// FIXME: Is this obsolete?
Metadata.prototype.onUnhandledMacro = function(name) {
   return this.get(name);
}
