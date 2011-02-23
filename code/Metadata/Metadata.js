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
 * FIXME: This could be useful when defining prototypes with the definePrototype() method.
 * @see http://helma.org/wiki/Defining+HopObject+mappings+programmatically/
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

Metadata.prototype.constructor = function(parent, name, value) {
   if (parent && name && value) {
      this.parent = parent;
      this.name = name;
      this.setValue(value);
   }
   return this;
}

Metadata.prototype.setValue = function(value) {
   [this.value, this.type] = Metadata.normalize(value);
   if (this.value === null) {
      this.remove();
   }
   return;
}

Metadata.prototype.getValue = function() {
   var Constructor = global[this.type];
   switch (Constructor) {
      case null:
      case undefined:
      return null;

      case Boolean:
      return eval(this.value).valueOf();

      case Date:
      return new Date(this.value);

      case Number:
      case String:
      return (new Constructor(this.value)).valueOf();

      default:
      return eval(this.value);
   }
}

/**
 * 
 */
Metadata.prototype.toString = function() {
   return "Metadata of " + this.parent + " (" + this.name + " = " + this.value + ")";
}

/**
 *
 * @param {String} name
 * @returns {HopObject}
 */
// FIXME: Is this obsolete?
Metadata.prototype.onUnhandledMacro = function(name) {
   return this.get(name);
}
