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
 * Cheaply sniffs whether a file could plausibly be XML (an Atom/RSS feed,
 * as Importer.blogger expects), so an obviously-wrong upload (an image, a
 * corrupt/truncated zip, etc.) can be rejected immediately instead of
 * being queued to fail asynchronously during the next cron run. Not a
 * real parse — just checks that the content starts with a '<' once
 * leading whitespace/BOM is stripped, same spirit as Importer.isZipFile's
 * magic-byte check.
 * @param {java.io.File} file
 * @returns {Boolean}
 */
Importer.isXmlFile = function(file) {
  var stream = new java.io.FileInputStream(file);
  try {
    var buf = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, 256);
    var read = stream.read(buf);
    if (read < 1) {
      return false;
    }
    var text = String(new java.lang.String(buf, 0, read, 'utf-8')).trim();
    return text.charAt(0) === '<';
  } finally {
    stream.close();
  }
};

/**
 * Reads and parses a whole JSON file produced by Exporter.
 * @param {java.io.File} file
 * @returns {Object}
 */
Importer.readJson = function(file) {
  var bytes = java.nio.file.Files.readAllBytes(file.toPath());
  return JSON.parse(new java.lang.String(bytes, 'utf-8'));
};

/**
 * Masks an e-mail address for display, keeping just enough to let a human
 * recognize a real match without exposing the full address
 * (e.g. "tobi@antville.org" -> "t***@a***.org").
 * @param {String} email
 * @returns {String}
 */
Importer.maskEmail = function(email) {
  if (!email) {
    return null;
  }
  var at = email.indexOf('@');
  if (at < 1) {
    return email.charAt(0) + '***';
  }
  var local = email.substring(0, at);
  var domain = email.substring(at + 1);
  var dot = domain.indexOf('.');
  var domainName = dot < 0 ? domain : domain.substring(0, dot);
  var domainRest = dot < 0 ? String.EMPTY : domain.substring(dot);
  return local.charAt(0) + '***@' + domainName.charAt(0) + '***' + domainRest;
};

/**
 * Extracts an export archive to a fresh temp dir and builds an account-
 * matching report: for every account referenced anywhere in the export,
 * classifies it as resolved (a same-named target account whose e-mail
 * matches, via the export's own HMAC key — see Exporter.hmac), ambiguous
 * (same name, but the e-mail doesn't match — likely a coincidental
 * namesake), or unresolved (no account under that name on the target at
 * all). Nothing is written to the site yet; that only happens once the
 * admin reviews and confirms this report (possibly amended with manual
 * overrides) via Importer.restoreSite.
 * @param {Site} site
 * @param {File} zipFile The uploaded export archive.
 * @returns {Object} The report, already persisted as site metadata.
 */
Importer.preview = function(site, zipFile) {
  var tempDir = new java.io.File(java.nio.file.Files.createTempDirectory('antville-import-' + site.name));
  var zip = new helma.Zip(new java.io.File(zipFile.getFile()));
  zip.extractAll(tempDir);

  var index = Importer.readJson(new java.io.File(tempDir, 'index.json'))[0];
  var exportKey = index && index.exportKey && java.util.Base64.getDecoder().decode(index.exportKey);

  var accountsFile = new java.io.File(tempDir, 'accounts.json');
  var accounts = accountsFile.exists() ? Importer.readJson(accountsFile) : [];

  var report = {resolved: [], ambiguous: [], unresolved: []};

  accounts.forEach(function(row) {
    var existing = row.name && User.getByName(row.name);
    if (!existing) {
      report.unresolved.push({id: row.id, name: row.name});
      return;
    }
    var matches = exportKey && existing.email && row.email_hmac &&
        Exporter.hmac(exportKey, existing.email.trim().toLowerCase()) === row.email_hmac;
    if (matches) {
      report.resolved.push({id: row.id, name: row.name, accountId: existing._id});
    } else {
      report.ambiguous.push({
        id: row.id,
        name: row.name,
        accountId: existing._id,
        maskedEmail: Importer.maskEmail(existing.email)
      });
    }
  });

  site.importReport = JSON.stringify(report);
  site.importTempDir = tempDir.getPath();

  return report;
};

/**
 * Merges the admin's overrides (submitted from the #import_review skin)
 * into a preview report, producing the final old-account-id -> resolution
 * map that Importer.restoreSite uses. An override maps a still-unresolved
 * or ambiguous account name to either an existing target account id
 * ("useExisting") or nothing (falls through to a placeholder).
 * @param {Object} report From Importer.preview.
 * @param {Object} overrides Plain object keyed by account id (as in the report), e.g. {"<id>": {useExisting: <accountId>}}.
 * @returns {Object} Map of old account id -> {type: 'matched', accountId} | {type: 'placeholder', name}.
 */
Importer.mergeOverrides = function(report, overrides) {
  overrides || (overrides = {});
  var accountMap = {};

  report.resolved.forEach(function(entry) {
    accountMap[entry.id] = {type: 'matched', accountId: entry.accountId};
  });

  report.ambiguous.concat(report.unresolved).forEach(function(entry) {
    var override = overrides[entry.id];
    if (override && override.useExisting) {
      accountMap[entry.id] = {type: 'matched', accountId: Number(override.useExisting)};
    } else {
      accountMap[entry.id] = {type: 'placeholder', name: entry.name};
    }
  });

  return accountMap;
};

/** @constant Metadata keys that must never be copied from an export onto the target site — all are handleMetadata-backed transient/operational state, not content. */
Importer.SITE_METADATA_DENYLIST = [
  'job', 'import_id', 'importError', 'importReport', 'importTempDir',
  'importAccountMap', 'export', 'exportError'
];

/**
 * Recursively deletes a directory and everything in it.
 * @param {java.io.File} file
 */
Importer.deleteRecursively = function(file) {
  if (!file || !file.exists()) {
    return;
  }
  if (file.isDirectory()) {
    var children = file.listFiles();
    for (var i = 0; i < children.length; i += 1) {
      Importer.deleteRecursively(children[i]);
    }
  }
  file['delete']();
};

/**
 * Imports a site and its content for the specified user. Dispatches on
 * whether a preview/confirm round has already prepared a native restore
 * (site.importTempDir set): if so, resumes straight into
 * Importer.restoreSite with the already-extracted temp dir and the
 * already-finalized account map — no re-extraction, no live account
 * matching left to do. Otherwise, this is the legacy single-step path:
 * falls back to Importer.blogger (only defined when the compat repository
 * is active), or fails with a clear error surfaced via site.importError.
 * @param {Site} site The site to import.
 * @param {User} user The user who will become the creator of any content whose original author can't be resolved.
 */
Importer.run = function(site, user) {
  var tempDirPath = site.importTempDir;
  var upload = !tempDirPath && File.getById(site.import_id);

  try {
    if (tempDirPath) {
      var accountMap = JSON.parse(site.importAccountMap || '{}');
      Importer.restoreSite(site, new java.io.File(tempDirPath), accountMap, user);
    } else if (upload && typeof Importer.blogger === 'function') {
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
    if (tempDirPath) {
      Importer.deleteRecursively(new java.io.File(tempDirPath));
    }
    site.job = null;
    site.import_id = null;
    site.importTempDir = null;
    site.importReport = null;
    site.importAccountMap = null;
  }

  return;
};

/**
 * Restores a site's core content (site fields, skins, stories, comments,
 * images, files) from an already-extracted export archive, using an
 * already-finalized account resolution map (see Importer.preview /
 * Importer.mergeOverrides). Polls, tags and membership are handled
 * separately (Phase 2).
 * @param {Site} site The site to restore into.
 * @param {java.io.File} tempDir The already-extracted export contents.
 * @param {Object} accountMap Old account id -> {type: 'matched', accountId} | {type: 'placeholder', name}.
 * @param {User} user The user who will become the creator of any content whose original author can't be resolved.
 */
Importer.restoreSite = function(site, tempDir, accountMap, user) {
  // Restore runs via Admin.dequeue() (a cron/background invocation, not a
  // real HTTP request), so res.handlers.site is never populated the way
  // it would be for a request against this site. Comment.prototype.update
  // reads res.handlers.site directly (not this.site, unlike Story's own
  // update) when notifying of a callback — set it explicitly so that
  // doesn't NPE the first time a restored comment's delta exceeds the
  // notification threshold.
  res.handlers.site = site;

  var idMap = {skins: {}, content: {}, images: {}, files: {}};
  var accountCache = {};

  var resolveAccount = function(oldId) {
    if (!oldId) {
      return user;
    }
    if (accountCache[oldId]) {
      return accountCache[oldId];
    }
    var entry = accountMap[oldId];
    var resolved;
    if (entry && entry.type === 'matched') {
      resolved = User.getById(entry.accountId) || user;
    } else if (entry && entry.type === 'placeholder') {
      resolved = User.add({name: entry.name});
      resolved.status = User.BLOCKED;
    } else {
      resolved = user;
    }
    accountCache[oldId] = resolved;
    return resolved;
  };

  var index = Importer.readJson(new java.io.File(tempDir, 'index.json'))[0];

  site.mode = index.mode;

  // index.metadata is a raw dump of every metadata row the source site
  // had, including transient/operational ones (job, export, importError,
  // etc. are all handleMetadata-backed and so live in the same metadata
  // table) — these must never be copied onto the target, which has its
  // own in-flight import state.
  var metadata = index.metadata || {};
  Importer.SITE_METADATA_DENYLIST.forEach(function(key) {
    delete metadata[key];
  });
  site.setMetadata(metadata);

  var skinsFile = new java.io.File(tempDir, 'skins.json');
  if (skinsFile.exists()) {
    Importer.readJson(skinsFile).forEach(function(row) {
      var skin = Skin.add(row.prototype, row.name, site.layout);
      skin.setSource(row.source);
      skin.creator = resolveAccount(row.creator_id);
      skin.modifier = resolveAccount(row.modifier_id);
      skin.created = new Date(row.created);
      skin.modified = new Date(row.modified);
      idMap.skins[row.id] = skin;
    });
  }

  // title/text are already persisted by Story/Comment's own update() (see
  // their reservedKeys lists) the moment they're passed into .add()'s data
  // bag below — re-applying them via a plain setMetadata() call afterward
  // writes a second, redundant copy of each into the metadata table
  // (confirmed live: every restored story/comment ended up with two rows
  // apiece for title and text). Strip them before the setMetadata() call
  // so only genuinely-custom metadata keys, if any, get written.
  var customMetadata = function(metadata) {
    var result = {};
    for (var key in metadata) {
      if (key !== 'title' && key !== 'text') result[key] = metadata[key];
    }
    return result;
  };

  var storiesFile = new java.io.File(tempDir, 'stories.json');
  if (storiesFile.exists()) {
    Importer.readJson(storiesFile).forEach(function(row) {
      var story = Story.add({
        title: row.metadata.title,
        text: row.metadata.text,
        status: row.status,
        mode: row.mode,
        commentMode: row.comment_mode
      }, site, user);
      story.creator = resolveAccount(row.creator_id);
      story.modifier = resolveAccount(row.modifier_id);
      story.created = new Date(row.created);
      story.modified = new Date(row.modified);
      story.setMetadata(customMetadata(row.metadata));
      idMap.content[row.id] = story;
    });
  }

  var commentsFile = new java.io.File(tempDir, 'comments.json');
  if (commentsFile.exists()) {
    var comments = Importer.readJson(commentsFile);
    comments.sort(function(a, b) {
      return new Date(a.created) - new Date(b.created);
    });
    comments.forEach(function(row) {
      var parent = idMap.content[row.parent_id];
      if (!parent) {
        app.logger.warn('Skipping comment #' + row.id + '; its parent was not restored (likely a dangling reference)');
        return;
      }
      // Comment.prototype.update, unlike Story's, never reads data.created
      // at all — passing it through the data bag here silently did
      // nothing for the real column (every restored comment got "now" as
      // its created timestamp) while still leaking into metadata via
      // setCustomContent (created isn't in Story/Comment's reservedKeys
      // list). Set it directly afterward instead, same as modified below.
      var comment = Comment.add({
        title: row.metadata.title,
        text: row.metadata.text,
        status: row.status
      }, parent);
      comment.creator = resolveAccount(row.creator_id);
      comment.modifier = resolveAccount(row.modifier_id);
      comment.created = new Date(row.created);
      comment.modified = new Date(row.modified);
      comment.setMetadata(customMetadata(row.metadata));
      idMap.content[row.id] = comment;
    });
  }

  var readAsset = function(relativePath) {
    var parts = relativePath.split('/');
    var dir = tempDir;
    for (var i = 0; i < parts.length - 1; i += 1) {
      dir = new java.io.File(dir, parts[i]);
    }
    return new helma.File(dir, parts[parts.length - 1]);
  };

  var imagesFile = new java.io.File(tempDir, 'images.json');
  if (imagesFile.exists()) {
    Importer.readJson(imagesFile).forEach(function(row) {
      // contentType/description/fileName/origin are handleMetadata-backed
      // (see Image.KEYS in code/Image/Image.js), so — like Story/Comment's
      // text/title — they live under row.metadata, not as top-level
      // columns on the export row itself.
      var isLayout = row.parent_type === 'Layout';
      var fileName = row.metadata.fileName;
      var asset = readAsset('static/' + (isLayout ? 'layout' : 'images') + '/' + fileName);
      if (!asset.exists()) {
        app.logger.warn('Skipping image #' + row.id + '; asset file ' + fileName + ' not found in export');
        return;
      }
      var mime = Packages.helma.util.MimePart(fileName, asset.toByteArray(), row.metadata.contentType);
      var image = Image.add({
        name: row.name,
        file: mime,
        file_origin: row.metadata.origin,
        description: row.metadata.description
      }, isLayout ? site.layout : site, user);
      image.creator = resolveAccount(row.creator_id);
      image.modifier = resolveAccount(row.modifier_id);
      image.created = new Date(row.created);
      image.modified = new Date(row.modified);
      // Deliberately not calling image.setMetadata(row.metadata) here:
      // every key in it (fileName, contentType, contentLength, width,
      // height, thumbnail*) is machine-derived and was already correctly
      // recomputed by Image.add's own update() from the actual
      // re-uploaded bytes above — re-applying the export's OLD values
      // would silently overwrite the freshly generated fileName with one
      // that doesn't exist on disk under this site (confirmed live:
      // every restored image 404s this way). description, the one
      // genuinely author-supplied field, was already passed into the
      // data bag above.
      idMap.images[row.id] = image;
    });
  }

  var filesFile = new java.io.File(tempDir, 'files.json');
  if (filesFile.exists()) {
    Importer.readJson(filesFile).forEach(function(row) {
      var fileName = row.metadata.fileName;
      var asset = readAsset('static/files/' + fileName);
      if (!asset.exists()) {
        app.logger.warn('Skipping file #' + row.id + '; asset file ' + fileName + ' not found in export');
        return;
      }
      var mime = Packages.helma.util.MimePart(fileName, asset.toByteArray(), row.metadata.contentType);
      var file = File.add({name: row.name, file: mime}, site, user);
      file.creator = resolveAccount(row.creator_id);
      file.modifier = resolveAccount(row.modifier_id);
      file.created = new Date(row.created);
      file.modified = new Date(row.modified);
      // See the matching note in the image restore loop above —
      // File.add's own update() already correctly regenerated
      // fileName/contentType/contentLength from the re-uploaded bytes;
      // re-applying row.metadata here would silently overwrite that with
      // the export's stale old fileName.
      idMap.files[row.id] = file;
    });
  }

  return;
};
