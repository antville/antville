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
 * @fileOverview Defines the TagHub prototype
 */

/**
 * @param {String} name
 * @param {Story|Image} tagged
 * @returns {TagHub}
 */
TagHub.add = function(name, tagged) {
  HopObject.confirmConstructor(this);
  var hub = new TagHub;
  var site = tagged.site || res.handlers.site;
  var tag = site.getTags(tagged._prototype, Tags.ALL).get(name);
  if (!tag) {
    tag = Tag.add(name, tagged._prototype, site);
  }
  hub.tag = tag;
  hub.tagged = tagged;
  tagged.tags.add(hub);
  return hub;
}

/**
 * @name TagHub
 * @constructor
 * @property {Tag} tag
 * @property {Number} tag_id
 * @property {Story|Image} tagged
 * @property {Number} tagged_id
 * @property {String} tagged_type
 * @extends HopObject
 */
TagHub.prototype.constructor = function() {
  HopObject.confirmConstructor(TagHub);
  return this;
}

/**
 *
 * @param {String} name
 * @returns {HopObject}
 */
TagHub.prototype.getMacroHandler = function(name) {
  switch (name.toLowerCase()) {
    case 'tagged':
    case 'story':
    case 'image':
    return this.tagged;
    break;
  }
}

/**
 * @return {String}
 */
TagHub.prototype.toString = function() {
  return 'Tag ' + this.tag.name + ' of ' + this.tagged.toString();
}
