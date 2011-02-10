//
// The Antville Project
// http://code.google.com/p/antville
//
// Copyright 2001-2011 by The Antville People
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
 * @fileoverview Defines the Metadata prototype (version 2).
 */

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
Metadata.prototype.onUnhandledMacro = function(name) {
   return this.get(name);
}
