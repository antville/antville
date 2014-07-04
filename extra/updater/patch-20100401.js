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
//   http://www.apache.org/licenses/LICENSE-2.0
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

// Apply with enabled updater repository via ant patch -Dpatch.id=20100401

var sql = new Sql;

// Correct Image.contentLength property for some images
sql.retrieve("select id from image");
sql.traverse(function() {
  var image = Image.getById(this.id);
  try {
    var contentLength = image.getFile().getLength();
    app.log("Processing " + image + ": " + image.contentLength);
    if (contentLength && image.contentLength !== contentLength) {
      app.log("Updating content length to " + contentLength);
      image.contentLength = contentLength;
      res.commit();
    }
  } catch (x) { }
});
app.log("Done.");
