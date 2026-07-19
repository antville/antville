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
 * The Importer namespace provides methods for importing a site or account.
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
 * Reads and parses a whole JSON file produced by Exporter.
 * @param {java.io.File} file
 * @returns {Object}
 */
Importer.readJson = function(file) {
  var bytes = java.nio.file.Files.readAllBytes(file.toPath());
  return JSON.parse(new java.lang.String(bytes, 'utf-8'));
};

/**
 * Reads a named JSON file from a temp dir if it exists, else [].
 * @param {java.io.File} tempDir
 * @param {String} name
 * @returns {Array}
 */
Importer.readJsonFile = function(tempDir, name) {
  var file = new java.io.File(tempDir, name);
  return file.exists() ? Importer.readJson(file) : [];
};

/**
 * Resolves a slash-separated relative path (as recorded in export JSON,
 * e.g. "static/images/<fileName>" or "<siteName>/images/<fileName>")
 * against an extracted export's temp dir.
 * @param {java.io.File} tempDir
 * @param {String} relativePath
 * @returns {helma.File}
 */
Importer.readAsset = function(tempDir, relativePath) {
  var parts = relativePath.split('/');
  var dir = tempDir;
  for (var i = 0; i < parts.length - 1; i += 1) {
    dir = new java.io.File(dir, parts[i]);
  }
  return new helma.File(dir, parts[parts.length - 1]);
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
 * all). Nothing is written yet; that only happens once the admin reviews
 * and confirms this report (possibly amended with manual overrides) via
 * Importer.restoreSite/restoreAccount. Works identically for a site or an
 * account export — both carry index.json's exportKey and accounts.json.
 * @param {Site|User} target The site or account metadata gets attached to.
 * @param {File} zipFile The uploaded export archive.
 * @returns {Object} The report, already persisted as target metadata.
 */
Importer.preview = function(target, zipFile) {
  // Site's upload flow hands over a File HopObject (it has a natural
  // files collection to attach one to); User's has no such collection to
  // attach to (see restoreAccount's own notes) and so hands over an
  // already-extracted plain java.io.File instead — accept either.
  var javaFile = typeof zipFile.getFile === 'function' ? new java.io.File(zipFile.getFile()) : zipFile;
  var tempDir = new java.io.File(java.nio.file.Files.createTempDirectory('antville-import-' + target.name));
  var zip = new helma.Zip(javaFile);
  zip.extractAll(tempDir);

  var index = Importer.readJson(new java.io.File(tempDir, 'index.json'))[0];
  var exportKey = index && index.exportKey && java.util.Base64.getDecoder().decode(index.exportKey);

  var accounts = Importer.readJsonFile(tempDir, 'accounts.json');

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

  target.importReport = JSON.stringify(report);
  target.importTempDir = tempDir.getPath();

  return report;
};

/**
 * Merges the admin's overrides (submitted from the #import_review skin)
 * into a preview report, producing the final old-account-id -> resolution
 * map that Importer.restoreSite/restoreAccount uses. An override maps a
 * still-unresolved or ambiguous account name to either an existing target
 * account id ("useExisting") or nothing (falls through to a placeholder).
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

/**
 * Renders the account-matching report from Importer.preview as an HTML
 * fragment for the #import_review skin (used by both Site and User's
 * import_action): how many authors matched automatically, which
 * same-named target accounts need the admin to confirm they're really
 * the same person (shown with a masked e-mail, never the full address),
 * and which names had no match at all (with a field to redirect them to
 * an existing account by username, or leave blank to fall back to a
 * placeholder account).
 * @param {Object} report {resolved, ambiguous, unresolved}
 * @returns {String}
 */
Importer.renderReviewHtml = function(report) {
  var html = [];

  html.push('<p>' + gettext('{0} authors matched automatically.', report.resolved.length) + '</p>');

  if (report.ambiguous.length) {
    html.push('<h2>' + gettext('Possible matches to confirm') + '</h2>');
    html.push('<table class="uk-table">');
    report.ambiguous.forEach(function(entry) {
      html.push('<tr><td>' + encodeXml(entry.name) + '</td>' +
          '<td>' + encodeXml(entry.maskedEmail || String.EMPTY) + '</td>' +
          '<td><label><input type="checkbox" name="override_' + entry.id +
          '" value="' + encodeXml(entry.name) + '"> ' +
          gettext('Yes, this is the same person') + '</label></td></tr>');
    });
    html.push('</table>');
  }

  if (report.unresolved.length) {
    html.push('<h2>' + gettext('No matching account found') + '</h2>');
    html.push('<table class="uk-table">');
    report.unresolved.forEach(function(entry) {
      html.push('<tr><td>' + encodeXml(entry.name) + '</td>' +
          '<td><input type="text" name="override_' + entry.id + '" placeholder="' +
          encodeXml(gettext('Existing account username (optional)')) + '"></td></tr>');
    });
    html.push('</table>');
  }

  return html.join(String.EMPTY);
};

/**
 * Builds a resolveAccount(oldId) function bound to one accountMap: an
 * already-created User for a 'matched'/'placeholder' entry (creating and
 * caching the placeholder on first use), or the fallback user if oldId is
 * absent or its entry is missing.
 * @param {Object} accountMap Old account id -> {type, accountId|name}.
 * @param {User} fallbackUser
 * @returns {Function}
 */
Importer.makeAccountResolver = function(accountMap, fallbackUser) {
  var cache = {};
  return function(oldId) {
    if (!oldId) {
      return fallbackUser;
    }
    if (cache[oldId]) {
      return cache[oldId];
    }
    var entry = accountMap[oldId];
    var resolved;
    if (entry && entry.type === 'matched') {
      resolved = User.getById(entry.accountId) || fallbackUser;
    } else if (entry && entry.type === 'placeholder') {
      // entry.name may already belong to a real, different account on this
      // instance — that's precisely why an ambiguous match can end up here
      // unconfirmed (the admin declined to say they're the same person).
      // User.add's underlying root.users.add(user) enforces name-uniqueness
      // instance-wide, so a blind add would throw. Check first rather than
      // catching the collision after the fact: User.add's user.map({...})
      // persists the account row immediately, before root.users.add(user)
      // ever runs, so a try/catch retry leaves a stray unblocked orphan
      // account behind for every name it had to give up on.
      var name = entry.name;
      for (var attempt = 1; User.getByName(name); attempt += 1) {
        if (attempt > 20) {
          throw Error('Could not find a free placeholder name for “' + entry.name + '”.');
        }
        name = entry.name + '-imported-' + attempt;
      }
      resolved = User.add({name: name});
      resolved.status = User.BLOCKED;
    } else {
      resolved = fallbackUser;
    }
    cache[oldId] = resolved;
    return resolved;
  };
};

/** @constant Metadata keys that must never be copied from an export onto the target — all are handleMetadata-backed transient/operational state, not content. Shared by Site and User targets (importAccountMap only applies to Site today, harmless to strip from a User target too). */
Importer.METADATA_DENYLIST = [
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
 * Formats a Date (or ISO date string, as found in export JSON) the way
 * Story.prototype.update expects it.
 * @param {String|Date} date
 * @returns {String}
 */
Importer.formatDate = function(date) {
  return new Date(date).format('yyyy-MM-dd HH:mm');
};

/**
 * Dispatches a queued import job by target type — mirrors Exporter.run's
 * exact pattern, since Admin.dequeue calls this one entry point
 * unconditionally regardless of whether job.target is a Site or a User.
 * @param {Site|User} target
 * @param {User} user The user who queued the job (job.user — defaults to
 * whoever was logged in at confirm time). Only meaningful for a Site
 * target; an account import's fallback/owner is the target itself.
 */
Importer.run = function(target, user) {
  switch (target.constructor) {
    case Site:
    Importer.runSite(target, user);
    break;

    case User:
    Importer.runAccount(target);
    break;
  }
  return;
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
Importer.runSite = function(site, user) {
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
 * Same dispatch as Importer.run, for an account-level import queued via
 * User.prototype.import_action.
 * @param {User} user The account to import into.
 */
Importer.runAccount = function(user) {
  var tempDirPath = user.importTempDir;

  try {
    if (!tempDirPath) {
      throw Error(gettext('Unrecognized import file.'));
    }
    var accountMap = JSON.parse(user.importAccountMap || '{}');
    Importer.restoreAccount(user, new java.io.File(tempDirPath), accountMap);
    user.importError = null;
  } catch (ex) {
    app.log('Failed to import account #' + user._id + ' (' + user.name + '): ' + ex);
    user.importError = ex.toString();
  } finally {
    if (tempDirPath) {
      Importer.deleteRecursively(new java.io.File(tempDirPath));
    }
    user.job = null;
    user.importTempDir = null;
    user.importReport = null;
    user.importAccountMap = null;
  }

  return;
};

/**
 * @typedef {Object} RestoreContext
 * @property {Site} site The site being restored into.
 * @property {Object} idMap Old id -> new object, per entity type (skins, content, images, files, polls, choices).
 * @property {Function} resolveAccount See Importer.makeAccountResolver.
 * @property {User} user The importing user (creator/parent fallback).
 * @property {java.io.File} tempDir The extracted export's root.
 * @property {String} assetPrefix Path prefix under tempDir where this site's static assets live ("static" for a site export, the original site name for an account export — see Exporter.saveAccount's differing zip layout).
 */

/**
 * Restores skins.json rows into ctx.site.layout.
 * @param {Array} rows
 * @param {RestoreContext} ctx
 */
Importer.restoreSkins = function(rows, ctx) {
  rows.forEach(function(row) {
    var skin = Skin.add(row.prototype, row.name, ctx.site.layout);
    skin.setSource(row.source);
    skin.creator = ctx.resolveAccount(row.creator_id);
    skin.modifier = ctx.resolveAccount(row.modifier_id);
    skin.created = new Date(row.created);
    skin.modified = new Date(row.modified);
    ctx.idMap.skins[row.id] = skin;
  });
};

/**
 * Restores stories.json rows into ctx.site.
 * @param {Array} rows
 * @param {RestoreContext} ctx
 */
Importer.restoreStories = function(rows, ctx) {
  rows.forEach(function(row) {
    var story = Story.add({
      title: row.metadata.title,
      text: row.metadata.text,
      created: Importer.formatDate(row.created),
      status: row.status,
      mode: row.mode,
      commentMode: row.comment_mode
    }, ctx.site, ctx.user);
    story.creator = ctx.resolveAccount(row.creator_id);
    story.modifier = ctx.resolveAccount(row.modifier_id);
    story.modified = new Date(row.modified);
    story.setMetadata(row.metadata);
    ctx.idMap.content[row.id] = story;
  });
};

/**
 * Restores comments.json rows, threaded under stories/comments already in
 * ctx.idMap.content — processed in creation order so a reply's parent
 * comment already exists by the time it's restored.
 * @param {Array} rows
 * @param {RestoreContext} ctx
 */
Importer.restoreComments = function(rows, ctx) {
  rows.slice().sort(function(a, b) {
    return new Date(a.created) - new Date(b.created);
  }).forEach(function(row) {
    var parent = ctx.idMap.content[row.parent_id];
    if (!parent) {
      app.logger.warn('Skipping comment #' + row.id + '; its parent was not restored (likely a dangling reference)');
      return;
    }
    var comment = Comment.add({
      title: row.metadata.title,
      text: row.metadata.text,
      created: Importer.formatDate(row.created),
      status: row.status
    }, parent);
    comment.creator = ctx.resolveAccount(row.creator_id);
    comment.modifier = ctx.resolveAccount(row.modifier_id);
    comment.modified = new Date(row.modified);
    comment.setMetadata(row.metadata);
    ctx.idMap.content[row.id] = comment;
  });
};

/**
 * Restores images.json rows (both Site- and Layout-parented) from the
 * extracted static asset tree.
 * @param {Array} rows
 * @param {RestoreContext} ctx
 */
Importer.restoreImages = function(rows, ctx) {
  rows.forEach(function(row) {
    // contentType/description/fileName/origin are handleMetadata-backed
    // (see Image.KEYS in code/Image/Image.js), so — like Story/Comment's
    // text/title — they live under row.metadata, not as top-level columns
    // on the export row itself.
    var isLayout = row.parent_type === 'Layout';
    var fileName = row.metadata.fileName;
    var asset = Importer.readAsset(ctx.tempDir, ctx.assetPrefix + '/' + (isLayout ? 'layout' : 'images') + '/' + fileName);
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
    }, isLayout ? ctx.site.layout : ctx.site, ctx.user);
    image.creator = ctx.resolveAccount(row.creator_id);
    image.modifier = ctx.resolveAccount(row.modifier_id);
    image.created = new Date(row.created);
    image.modified = new Date(row.modified);
    // Deliberately not calling image.setMetadata(row.metadata) here: every
    // key in it (fileName, contentType, contentLength, width, height,
    // thumbnail*) is machine-derived and was already correctly recomputed
    // by Image.add's own update() from the actual re-uploaded bytes above
    // — re-applying the export's OLD values would silently overwrite the
    // freshly generated fileName with one that doesn't exist on disk
    // under this site (confirmed live: every restored image/file 404s
    // this way). description, the one genuinely author-supplied field,
    // was already passed into the data bag above.
    ctx.idMap.images[row.id] = image;
  });
};

/**
 * Restores files.json rows from the extracted static asset tree.
 * @param {Array} rows
 * @param {RestoreContext} ctx
 */
Importer.restoreFiles = function(rows, ctx) {
  rows.forEach(function(row) {
    var fileName = row.metadata.fileName;
    var asset = Importer.readAsset(ctx.tempDir, ctx.assetPrefix + '/files/' + fileName);
    if (!asset.exists()) {
      app.logger.warn('Skipping file #' + row.id + '; asset file ' + fileName + ' not found in export');
      return;
    }
    var mime = Packages.helma.util.MimePart(fileName, asset.toByteArray(), row.metadata.contentType);
    var file = File.add({name: row.name, file: mime}, ctx.site, ctx.user);
    file.creator = ctx.resolveAccount(row.creator_id);
    file.modifier = ctx.resolveAccount(row.modifier_id);
    file.created = new Date(row.created);
    file.modified = new Date(row.modified);
    // See the matching note in restoreImages — File.add's own update()
    // already correctly regenerated fileName/contentType/contentLength
    // from the re-uploaded bytes; re-applying row.metadata here would
    // silently overwrite that with the export's stale old fileName.
    ctx.idMap.files[row.id] = file;
  });
};

/**
 * Restores polls.json rows: choices are created from title_array, in
 * order, and mapped back to the original choices[].id by that same order
 * (Poll.prototype.update creates one Choice per entry, in order) so
 * Importer.restoreVotes can replay ballots against the right Choice
 * afterward. A row.vote (a single choice id — as saveAccount embeds,
 * scoped to just the exporting account's own ballot) is replayed directly
 * here instead, since account exports carry no separate votes.json.
 * @param {Array} rows
 * @param {RestoreContext} ctx
 */
Importer.restorePolls = function(rows, ctx) {
  rows.forEach(function(row) {
    var poll = Poll.add({
      question: row.question,
      title_array: row.choices.map(function(choice) { return choice.title; }),
      save: row.status
    }, ctx.site);
    poll.creator = ctx.resolveAccount(row.creator_id);
    poll.modifier = ctx.resolveAccount(row.modifier_id);
    poll.created = new Date(row.created);
    poll.modified = new Date(row.modified);
    // Unlike Site/Story/Comment/Image/File, Poll has no metadata
    // collection wired up at all (confirmed live: poll.setMetadata throws
    // "No metadata collection defined for prototype Poll") — Exporter's
    // addMetadata still queries the raw metadata table directly for
    // export, but there's nothing to write back on import.
    row.choices.forEach(function(choice, index) {
      ctx.idMap.choices[choice.id] = poll.get(index);
    });
    ctx.idMap.polls[row.id] = poll;

    if (row.vote && ctx.idMap.choices[row.vote]) {
      var vote = Vote.add(ctx.idMap.choices[row.vote], poll);
      vote.creator = ctx.resolveAccount(row.creator_id);
      vote.creator_name = row.creator_name;
      // The account export only ever records the choice id, not the
      // ballot's own timestamps — reusing the poll's is the closest
      // available approximation, not a bug to chase.
      vote.created = new Date(row.created);
      vote.modified = new Date(row.modified);
    }
  });
};

/**
 * Restores votes.json rows (site exports only — see Importer.restorePolls
 * for the account-export single-ballot case) against choices/polls already
 * in ctx.idMap.
 * @param {Array} rows
 * @param {RestoreContext} ctx
 */
Importer.restoreVotes = function(rows, ctx) {
  rows.forEach(function(row) {
    var choice = ctx.idMap.choices[row.choice_id];
    var poll = ctx.idMap.polls[row.poll_id];
    if (!choice || !poll) {
      app.logger.warn('Skipping vote #' + row.id + '; its choice or poll was not restored (likely a dangling reference)');
      return;
    }
    var vote = Vote.add(choice, poll);
    vote.creator = ctx.resolveAccount(row.creator_id);
    vote.creator_name = row.creator_name;
    vote.created = new Date(row.created);
    vote.modified = new Date(row.modified);
  });
};

/**
 * Restores tags.json rows against content/images already in ctx.idMap
 * (site exports only — account exports carry no tags.json at all, since
 * tags aren't meaningfully scoped to a single creator).
 * @param {Array} rows
 * @param {RestoreContext} ctx
 */
Importer.restoreTags = function(rows, ctx) {
  rows.forEach(function(row) {
    var tagged = row.tagged_type === 'Image' ? ctx.idMap.images[row.tagged_id] : ctx.idMap.content[row.tagged_id];
    if (!tagged) {
      app.logger.warn('Skipping tag #' + row.id + ' (' + row.name + '); its tagged object was not restored (likely a dangling reference)');
      return;
    }
    tagged.addTag(row.name);
  });
};

/**
 * Restores members.json rows (site exports only — see restoreAccount's
 * own handling of the owner membership for a freshly created site).
 * Updates an existing membership in place rather than assuming the target
 * never has one under this name (it may well already — restore-in-place,
 * or a target the importing user already belongs to).
 * @param {Array} rows
 * @param {RestoreContext} ctx
 */
Importer.restoreMemberships = function(rows, ctx) {
  rows.forEach(function(row) {
    // A membership row's own creator_id/creator_name *is* the member (see
    // Importer.preview's docs) — Membership.prototype.constructor already
    // sets creator/name from the user passed in, so there's no separate
    // matching step here, just the same idMap.accounts lookup everything
    // else goes through.
    var member = ctx.resolveAccount(row.creator_id);
    var membership = Membership.getByName(member.name, ctx.site);
    if (membership) {
      membership.role = row.role;
    } else {
      membership = Membership.add(member, row.role, ctx.site);
    }
    membership.modifier = ctx.resolveAccount(row.modifier_id);
    membership.created = new Date(row.created);
    membership.modified = new Date(row.modified);
  });
};

/**
 * Restores a site's core content and long-tail entities (site fields,
 * skins, stories, comments, images, files, polls with vote replay, tags,
 * membership) from an already-extracted export archive, using an
 * already-finalized account resolution map (see Importer.preview /
 * Importer.mergeOverrides).
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

  // Same problem, different symptom: Vote.add hardcodes session.user
  // directly (no user param at all) to set creator/creator_name — null
  // here for the same reason. session.user isn't a writable property
  // (confirmed live: "no public instance field or method named user" —
  // it's a Java-backed SessionBean), so log the importing user in
  // properly instead. The actual resolved account gets backfilled onto
  // each vote right after Vote.add anyway, same as everywhere else, so
  // this is only ever read transiently.
  session.login(user);

  var idMap = {skins: {}, content: {}, images: {}, files: {}, polls: {}, choices: {}};
  var resolveAccount = Importer.makeAccountResolver(accountMap, user);

  var index = Importer.readJson(new java.io.File(tempDir, 'index.json'))[0];

  site.mode = index.mode;

  // index.metadata is a raw dump of every metadata row the source site
  // had, including transient/operational ones (job, export, importError,
  // etc. are all handleMetadata-backed and so live in the same metadata
  // table) — these must never be copied onto the target, which has its
  // own in-flight import state.
  var metadata = index.metadata || {};
  Importer.METADATA_DENYLIST.forEach(function(key) {
    delete metadata[key];
  });
  site.setMetadata(metadata);

  var ctx = {
    site: site,
    idMap: idMap,
    resolveAccount: resolveAccount,
    user: user,
    tempDir: tempDir,
    assetPrefix: 'static'
  };

  Importer.restoreSkins(Importer.readJsonFile(tempDir, 'skins.json'), ctx);
  Importer.restoreStories(Importer.readJsonFile(tempDir, 'stories.json'), ctx);
  Importer.restoreComments(Importer.readJsonFile(tempDir, 'comments.json'), ctx);
  Importer.restoreImages(Importer.readJsonFile(tempDir, 'images.json'), ctx);
  Importer.restoreFiles(Importer.readJsonFile(tempDir, 'files.json'), ctx);
  Importer.restorePolls(Importer.readJsonFile(tempDir, 'polls.json'), ctx);
  Importer.restoreVotes(Importer.readJsonFile(tempDir, 'votes.json'), ctx);
  Importer.restoreTags(Importer.readJsonFile(tempDir, 'tags.json'), ctx);
  Importer.restoreMemberships(Importer.readJsonFile(tempDir, 'members.json'), ctx);

  return;
};

/**
 * Restores every site the exporting account owned (per sites.json's role
 * column) as a brand-new site — this is why restore-in-place and
 * cross-install migration are the same code path for a site export but
 * NOT for an account export: an account can never be restored "in place"
 * onto its own pre-existing sites, since those still exist and are what
 * was exported from. Sites the account was only a non-owner member of are
 * skipped entirely — no site metadata was ever exported for those (see
 * Exporter.saveAccount), so there's nothing to restore, and re-creating
 * someone else's site would make no sense anyway.
 * @param {User} user The account being restored into — becomes the owner
 * of every restored site, and the creator/parent fallback within them.
 * @param {java.io.File} tempDir The already-extracted export contents.
 * @param {Object} accountMap Old account id -> {type: 'matched', accountId} | {type: 'placeholder', name}.
 */
Importer.restoreAccount = function(user, tempDir, accountMap) {
  session.login(user);

  var idMap = {skins: {}, content: {}, images: {}, files: {}, polls: {}, choices: {}, sites: {}};
  var resolveAccount = Importer.makeAccountResolver(accountMap, user);

  var groupBySite = function(rows) {
    var groups = {};
    rows.forEach(function(row) {
      (groups[row.site_id] || (groups[row.site_id] = [])).push(row);
    });
    return groups;
  };

  var sites = Importer.readJsonFile(tempDir, 'sites.json');
  var skinsBySite = groupBySite(Importer.readJsonFile(tempDir, 'skins.json'));
  var storiesBySite = groupBySite(Importer.readJsonFile(tempDir, 'stories.json'));
  var commentsBySite = groupBySite(Importer.readJsonFile(tempDir, 'comments.json'));
  var imagesBySite = groupBySite(Importer.readJsonFile(tempDir, 'images.json'));
  var filesBySite = groupBySite(Importer.readJsonFile(tempDir, 'files.json'));
  var pollsBySite = groupBySite(Importer.readJsonFile(tempDir, 'polls.json'));

  sites.forEach(function(row) {
    if (row.role !== Membership.OWNER) {
      app.log('Skipping site #' + row.id + ' (' + row.name + '); the exporting account was only a ' + row.role + ' there, not the owner');
      return;
    }

    // Site names must be unique instance-wide; the original name may
    // already be taken (by the very site this was exported from, if
    // restoring into the same instance, or by an unrelated site). Fall
    // back to a numbered suffix rather than silently dropping the site.
    var newSite;
    for (var attempt = 0; ; attempt += 1) {
      var name = attempt ? row.name + '-imported-' + attempt : row.name;
      try {
        newSite = Site.add({name: name}, user);
        break;
      } catch (ex) {
        if (attempt > 20) {
          throw ex;
        }
      }
    }

    Membership.add(user, Membership.OWNER, newSite);
    res.handlers.site = newSite;

    newSite.mode = row.mode;
    var metadata = row.metadata || {};
    Importer.METADATA_DENYLIST.forEach(function(key) {
      delete metadata[key];
    });
    newSite.setMetadata(metadata);

    var ctx = {
      site: newSite,
      idMap: idMap,
      resolveAccount: resolveAccount,
      user: user,
      tempDir: tempDir,
      // Exporter.saveAccount zips assets under "<siteName>/..." (using
      // the ORIGINAL site's name), not under "static/..." like saveSite
      // does — the two export types lay out their static assets
      // differently, so restoreAccount needs its own prefix per site.
      assetPrefix: row.name
    };

    Importer.restoreSkins(skinsBySite[row.id] || [], ctx);
    Importer.restoreStories(storiesBySite[row.id] || [], ctx);
    Importer.restoreComments(commentsBySite[row.id] || [], ctx);
    Importer.restoreImages(imagesBySite[row.id] || [], ctx);
    Importer.restoreFiles(filesBySite[row.id] || [], ctx);
    Importer.restorePolls(pollsBySite[row.id] || [], ctx);
    // No tags/separate votes/memberships restore here — saveAccount
    // exports neither tags.json nor votes.json at all (a poll's own vote,
    // if any, is embedded on the poll row and replayed by restorePolls
    // above), and the owner membership was already established when the
    // site was created, a few lines up.

    idMap.sites[row.id] = newSite;
  });

  return;
};
