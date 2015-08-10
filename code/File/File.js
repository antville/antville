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
 * @fileOverview Defines the Comment prototype.
 */

markgettext('File');
markgettext('file');
markgettext('a file // accusative');

this.handleMetadata('url');
this.handleMetadata('description');
this.handleMetadata('contentType');
this.handleMetadata('contentLength');
this.handleMetadata('fileName');

/**
 * @param {Object} data
 * @param {Site} site
 * @param {User} user
 * @returns {File}
 */
File.add = function(data, site, user) {
  site || (site = res.handlers.site);
  user || (user = session.user);
  var file = new File;
  file.site = site;
  file.requests = 0;
  file.creator = file.modifier = user;
  file.created = file.modified = new Date;
  file.update(data);
  site.files.add(file);
  return file;
}

/**
 *
 */
File.remove = function() {
  if (this.constructor === File) {
    this.getFile().remove();
    this.deleteMetadata();
    this.remove();
  }
  return;
}

/**
 *
 * @param {String} name
 */
File.getName = function(name) {
  if (name) {
    //return name.replace(/[^\w\d\s._-]/g, String.EMPTY);
    return String(name).trim().replace(/[\/\\:;?+\[\]{}|#"`<>^]/g, String.EMPTY);
  }
  return null;
}

File.getGenericType = function (contentType) {
  switch (contentType) {
    case 'application/msword':
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    return 'word';

    case 'application/acrobat':
    case 'application/pdf':
    case 'applications/vnd.pdf':
    case 'application/x-pdf':
    case 'text/pdf':
    case 'text/x-pdf':
    return 'pdf';

    case 'application/vnd.ms-excel':
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
    return 'excel';

    case 'application/x-mpegURL':
    return 'movie';

    case 'application/gzip':
    case 'application/x-7z-compressed':
    case 'application/x-rar-compressed':
    case 'application/x-stuffit':
    case 'application/x-tar':
    case 'application/zip':
    return 'archive';

    case 'text/htm':
    case 'text/html':
    return 'code';

    default:
    switch (contentType.split('/')[0]) {
      case 'audio':
      return 'sound';

      case 'image':
      return 'image';

      case 'text':
      return 'text';

      case 'video':
      return 'movie';

      default:
      return '';
    }
  }
};

/**
 *
 * @param {String } url
 */
File.redirectOnUploadError = function(url) {
  if (req.data.helma_upload_error) {
    res.message = gettext('Sorry, the file exceeds the maximum upload limit of {0} kB.',
        formatNumber(app.appsProperties.uploadLimit));
    res.redirect(url);
  }
  return;
}

/**
 *
 * @param {String} url
 */
File.redirectOnExceededQuota = function(url) {
  if (res.handlers.site.getDiskSpace() < 0) {
    res.message = gettext('Sorry, there is no disk space left. Please try to delete some files or images first.');
    res.redirect(url);
  }
  return;
}

/**
 * @name File
 * @constructor
 * @property {Date} created
 * @property {User} creator
 * @property {Metadata} metadata
 * @property {Date} modified
 * @property {User} modifier
 * @property {String} name
 * @property {Number} parent_id
 * @property {String} parent_type
 * @property {String} prototype
 * @property {Number} requests
 * @property {Site} site
 * @extends HopObject
 */
File.prototype.constructor = function() {
  return this;
}

/**
 *
 * @param {String} action
 * @return {Boolean}
 */
File.prototype.getPermission = function(action) {
  switch (action) {
    case '.':
    case 'main':
    return true;
    case 'delete':
    case 'edit':
    return this._parent.getPermission('main') &&
        this.creator === session.user ||
        Membership.require(Membership.MANAGER) ||
        User.require(User.PRIVILEGED);
  }
  return false;
}

File.prototype.main_action = function() {
  if (Membership.require(Membership.SUBSCRIBER) &&
      User.require(User.REGULAR)) {
    this.requests += 1;
  }
  return res.redirect(this.getUrl());
}

File.prototype.edit_action = function() {
  File.redirectOnUploadError(this.href(req.action));

  if (req.postParams.save) {
    try {
      File.redirectOnExceededQuota(this.href(req.action));
      this.update(req.postParams);
      res.message = gettext('The changes were saved successfully.');
      res.redirect(this.href('edit'));
    } catch (ex) {
      res.message = ex;
      app.log(ex);
    }
  }

  res.data.action = this.href(req.action);
  res.data.title = gettext('Edit File');
  res.data.body = this.renderSkinAsString('$File#edit');
  return this.site.renderSkin('Site#page');
}

/**
 *
 * @param {String} name
 * @returns {Object}
 */
File.prototype.getFormValue = function(name) {
  var self = this;

  var getOrigin = function(str) {
    var origin = req.postParams.file_origin || self.origin;
    if (origin && origin.contains('://')) {
      return origin;
    }
    return null;
  }

  if (req.isPost()) {
    if (name === 'file') {
      return getOrigin();
    }
    return req.postParams[name];
  }
  switch (name) {
    case 'file':
    return getOrigin();
  }
  return this[name] || req.queryParams[name];
}

/**
 *
 * @param {Object} data
 */
File.prototype.update = function(data) {
  if (data.uploadError) {
    app.log(data.uploadError);
    throw Error(gettext('File size is exceeding the upload limit.'));
  }

  var mime = data.file;
  var origin = data.file_origin;

  if (mime.contentLength < 1) {
    if (origin && origin !== this.origin) {
      mime = getURL(origin);
      if (!mime) {
        throw Error(gettext('Could not fetch the file from the given URL.'));
      }
    } else if (this.isTransient()) {
      throw Error(gettext('There was nothing to upload. Please be sure to choose a file.'));
    }
  }

  if (mime.contentLength > 0) {
    this.origin = origin;
    var mimeName = mime.normalizeFilename(mime.name);
    this.contentLength = mime.contentLength;
    this.contentType = mime.contentType;

    if (!this.name) {
       var name = File.getName(data.name) || mimeName.split('.')[0];
       this.name = this.site.files.getAccessName(name);
    }

    if (!data.description && origin) {
      data.description = gettext('Source: {0}', origin);
    }

    // Make the file persistent before proceeding with writing
    // it to disk (also see Helma bug #607)
    this.isTransient() && this.persist();

    var extension = mimeName.substr(mimeName.lastIndexOf('.')) || String.EMPTY;
    var fileName = this.name + extension;
    if (fileName !== this.fileName) {
      // Remove existing file if the file name has changed
      this.getFile().remove();
    }
    this.fileName = fileName;
    var file = this.getFile();
    mime.writeToFile(file.getParent(), file.getName());
  }

  // FIXME: one day?
  //this.setTags(data.tags || data.tag_array);
  this.description = data.description;
  this.touch();
  return;
}

/**
 *
 */
File.prototype.url_macro = function() {
  return res.write(encodeURI(this.url || this.getUrl()));
}

/**
 *
 * @param {Object} param
 */
File.prototype.contentLength_macro = function(param) {
  return res.write((this.contentLength / 1024).format('###,###') + ' KB');
}

File.prototype.contentType_macro = function (param, mode) {
  if (mode === 'generic') {
    return res.write(File.getGenericType(this.contentType));
  }
  return res.write(this.contentType);
}

/**
 *
 */
File.prototype.getFile = function() {
  var site = this.site || res.handlers.site;
  return site.getStaticFile('files/' + this.fileName);
}

/**
 *
 */
File.prototype.getUrl = function() {
  var site = this.site || res.handlers.site;
  return site.getStaticUrl('files/' + this.fileName);
}

/**
 * @returns {String}
 */
File.prototype.getConfirmText = function() {
  return gettext('You are about to delete the file {0}.', this.name);
}
