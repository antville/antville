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
 * @fileOverview Extends the Importer namespace with the legacy Blogger.com import.
 */

/**
 * Imports a Blogger.com Atom/RSS export, creating a bare Story (title, text,
 * created only) for each entry.
 * @param {Site} site The site to import into.
 * @param {User} user The user who will become the creator of the imported content.
 */
Importer.blogger = function(site, user) {
  var xml = File.getById(site.import_id);
  if (!xml) {
    return;
  }

  var file = new java.io.File(xml.getFile());
  var reader = new rome.XmlReader(file);
  var input = new rome.SyndFeedInput(true);
  var feed = input.build(reader);
  Api.constrain(site, user);
  for (var i = 0; i < feed.entries.size(); i += 1) {
    var entry = feed.entries.get(i);
    var category = entry.categories.get(0);
    if (category.name !== 'http://schemas.google.com/blogger/2008/kind#post') {
      continue;
    }
    Story.add({
      title: entry.title,
      text: entry.description || entry.contents.get(0).value,
      created: entry.publishedDate.format('yyyy-MM-dd HH:mm'),
      status: Story.CLOSED,
      mode: Story.FEATURED
    }, site, user);
  }
  return;
};
