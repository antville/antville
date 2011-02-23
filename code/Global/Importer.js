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
 * @fileOverview 
 */

var Importer = {}

Importer.run = function(site, user) {
   try {
      var xml = File.getById(site.import_id);
      if (xml) {
         var file = new java.io.File(xml.getFile());
         var reader = new rome.XmlReader(file);
         var input = new rome.SyndFeedInput(true);
         var feed = input.build(reader);
         Api.constrain(site, user);
         for (var i=0; i<feed.entries.size(); i+=1) {
            var entry = feed.entries.get(i);
            var category = entry.categories.get(0);
            if (category.name !== "http://schemas.google.com/blogger/2008/kind#post") {
               continue;
            }
            var story = new Story;
            story.site = site;
            story.creator = user;
            story.update({
               title: entry.title,
               text: entry.description || entry.contents.get(0).value,
               created: entry.publishedDate.format(SHORTDATEFORMAT),
               status: Story.CLOSED,
               mode: Story.FEATURED
            });
            site.stories.add(story);
         }
         File.remove.call(xml);
      }
   } catch (ex) {
      app.log(ex);
   }

   // Reset the site’s export status
   site.job = null;
   site.import_id = null;
   return;
}
