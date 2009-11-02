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
 * @fileOverview Defines the TagHub prototype
 */

/**
 * @name TagHub
 * @constructor
 * @param {String} name
 * @param {Story|Image} tagged
 * @param {User} user
 * @property {Tag} tag
 * @property {Number} tag_id
 * @property {Story|Image} tagged
 * @property {Number} tagged_id
 * @property {String} tagged_type
 * @property {User} user
 * @extends HopObject
 */
TagHub.prototype.constructor = function(name, tagged, user) {
   var site = tagged.site || res.handlers.site;
   var tag = site.getTags(tagged._prototype, Tags.ALL).get(name);
   if (!tag) {
      tag = new Tag(name, site, tagged._prototype);
      site.$tags.add(tag);
      //res.commit();
   }
   this.tag = tag;
   this.tagged = tagged;
   this.user = user;
   return this;
}

/**
 * 
 * @param {String} name
 * @returns {HopObject}
 */
TagHub.prototype.getMacroHandler = function(name) {
   switch (name.toLowerCase()) {
      case "tagged":
      case "story":
      case "image":
      return this.tagged;
      break;
   }
}

/**
 * @return {String}
 */
TagHub.prototype.toString = function() {
   return "[Tag ``" + this.tag.name + "'' of " + this.tagged_type + " " + 
         this.tagged_id + "]";
}
