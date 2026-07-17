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
 * @fileOverview Defines the Importer namespace.
 */

/**
 * The Importer namespace provides methods for importing a site.
 * @namespace
 */
var Importer = {};

/** @constant ZIP local file header signature ("PK\x03\x04"). */
Importer.ZIP_MAGIC = [0x50, 0x4B, 0x03, 0x04];

/**
 * Detects whether a file is a ZIP archive by content, regardless of its
 * uploaded name or extension.
 * @param {java.io.File} file
 * @returns {Boolean}
 */
Importer.isZipFile = function(file) {
  var stream = new java.io.FileInputStream(file);
  try {
    var header = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, 4);
    if (stream.read(header) < 4) {
      return false;
    }
    for (var i = 0; i < Importer.ZIP_MAGIC.length; i += 1) {
      if ((header[i] & 0xFF) !== Importer.ZIP_MAGIC[i]) {
        return false;
      }
    }
    return true;
  } finally {
    stream.close();
  }
};

/**
 * Imports a site and its content for the specified user. Dispatches on the
 * uploaded file's content: a native Antville export archive is detected by
 * its ZIP magic bytes and handled by Importer.restoreSite; anything else
 * falls back to Importer.blogger (only defined when the compat repository
 * is active), or fails with a clear error surfaced via site.importError.
 * @param {Site} site The site to import.
 * @param {User} user The user who will become the creator of the site’s imported content.
 */
Importer.run = function(site, user) {
  var upload = File.getById(site.import_id);

  try {
    if (!upload) {
      throw Error(gettext('No import file found.'));
    }

    if (Importer.isZipFile(new java.io.File(upload.getFile()))) {
      if (typeof Importer.restoreSite !== 'function') {
        throw Error(gettext('Native site import is not available yet.'));
      }
      Importer.restoreSite(site, upload, user);
    } else if (typeof Importer.blogger === 'function') {
      Importer.blogger(site, user);
    } else {
      throw Error(gettext('Unrecognized import file.'));
    }

    site.importError = null;
  } catch (ex) {
    app.log('Failed to import site #' + site._id + ' (' + site.name + '): ' + ex);
    site.importError = ex.toString();
  } finally {
    upload && File.remove.call(upload);
    site.job = null;
    site.import_id = null;
  }

  return;
};
