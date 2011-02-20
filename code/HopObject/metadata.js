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
 * @fileOverview Defines metadata extensions of Helma’s built-in
 * HopObject prototype.
 */

/**
 *
// * @param {String} name
 */
HopObject.prototype.handleMetadata = function(name) {
   this.__defineGetter__(name, function() {
      return this.getMetadata(name);
   });
   this.__defineSetter__(name, function(value) {
      return this.setMetadata(name, value);
   });
   this[name + "_macro"] = function(param) {
      var value;
      if (value = this[name]) {
         res.write(value);
      }
      return;
   };
   return;
}

/**
 *
 * @param {String} name
 * @returns {Object}
 */
HopObject.prototype.getMetadata = function(name) {
   if (!this.metadata) {
      throw Error("No metadata collection defined for prototype " + this.constructor.name);
   }

   var self = this;

   if (!name) {
      var result = {};
      this.metadata.forEach(function() {
         var name = this.name;
         if (name) {
            result[name] = self.getMetadata(name);
         }
      });
      return result;
   }

   var meta = this.metadata.get(name);
   if (!meta) {
      return null;
   }

   return meta.getValue();
}

/**
 *
 * @param {String} name
 * @param {Object} value
 */
HopObject.prototype.setMetadata = function(name, value) {
   if (!this.metadata) {
      throw Error("No metadata collection defined for prototype " + this.constructor.name);
   }

   if (!name) {
      throw Error("Insufficient arguments");
   }

   if (typeof name === "object") {
      for (var i in name) {
         this.setMetadata(i, name[i]);
      }
      return;
   }

   var metadata = this.metadata.get(name);

   if (metadata) {
      metadata.setValue(value);
   } else {
      metadata = new Metadata(this, name, value);
      if (metadata.value !== null) {
         // metadata.persist() is not enough or there will be redundant records!
         this.metadata.add(metadata);
      }
   }
   return;
}

/**
 *
 * @param {String} name
 */
HopObject.prototype.deleteMetadata = function(name) {
   if (!this.metadata) {
      throw Error("No metadata collection defined for prototype " + this.constructor.name);
   }

   var self = this;

   if (arguments.length === 0) {
      return HopObject.remove.call(this.metadata);
   }

   Array.prototype.forEach.call(arguments, function(name) {
      var metadata = self.metadata.get(name);
      metadata && metadata.remove();
      return;
   });
   return;
}

/**
 *
 * @param {Object} param
 * @param {String} name
 */
HopObject.prototype.metadata_macro = function(param, name) {
   var value = this.getMetadata(name);
   value && res.write(value);
   return;
}
