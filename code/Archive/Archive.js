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
// $Author$
// $Date$
// $URL$

/**
 * @fileOverview Defines the Archive prototype.
 */

Archive.PAGER = "page";
Archive.COLLECTION = "collection";

/**
 * @name Archive
 * @constructor
 * @param {Object} name
 * @param {Object} type
 * @param {Object} parent
 * @property {Story[]} _children
 * @property {String} name
 * @property {String} parent
 * @property {String} type
 * @extends HopObject
 */
Archive.prototype.constructor = function(name, type, parent) {
   this.name = name;
   this.type = type;
   this.parent = parent;
   return this;
}

/**
 *
 * @param {String} name
 * @returns {HopObject}
 */
Archive.prototype.getChildElement = function(name) {
   if (name.startsWith(Archive.PAGER)) {
      return new Archive(name, Archive.PAGER, this);
   } else if (!isNaN(name)) {
      return new Archive(name, Archive.COLLECTION, this);
   }
   return this.get(name);
}

/**
 *
 * @param {String} action
 * @returns {Boolean}
 */
Archive.prototype.getPermission = function(action) {
   var site = res.handlers.site;
   if (!site.getPermission("main") || site.archiveMode !== Site.PUBLIC) {
      return false;
   }
   switch (action) {
      case "main":
      case "page1":
      return true;
      case "previous":
      return this.getPage() > 1
      case "next":
      return this.getPage() < this.getSize() / this.getPageSize();
   }
   return false;
}

Archive.prototype.main_action = function() {
   var date = this.getDate();
   var dateString = String.EMPTY;
   switch (path.length - (this.type === Archive.PAGER ? 4 : 3)) {
      case 1:
      dateString = formatDate(date, "yyyy");
      break;
      case 2:
      dateString = formatDate(date, "MMM yyyy");
      break;
      case 3:
      var type = java.text.DateFormat.LONG;
      var locale = res.handlers.site.getLocale();
      var pattern = java.text.DateFormat.getDateInstance(type, locale).toPattern()
      dateString = formatDate(date, pattern);
      break;
   }
   var page = gettext("Page {0} of {1}", this.getPage(),
            Math.ceil(this.getSize() / this.getPageSize()));
   res.data.title = gettext("Story Archive {0} ({1})", dateString, page);
   res.data.body = this.renderSkinAsString("Archive#main");
   res.handlers.site.renderSkin("Site#page");
   res.handlers.site.log();
   return;
}

Archive.prototype.page1_action = function() {
   return res.redirect(this.href());
}

/**
 *
 * @param {String} action
 * @returns {String}
 */
Archive.prototype.href = function(action) {
   var buffer = [];
   var archive = this;
   while (archive.parent) {
      buffer.push(archive.name);
      archive = archive.parent;
   }
   buffer.push(res.handlers.site.href("archive"));
   buffer.reverse();
   if (action) {
      if (this.type === Archive.PAGER) {
         buffer.pop();
      }
      buffer.push(action);
   }
   return buffer.join("/");
}

/**
 *
 * @param {Object} param
 * @param {String} action
 * @param {String} text
 * @see renderLink
 */
Archive.prototype.link_macro = function(param, action, text) {
   if (!this.getPermission(action)) {
      return;
   }
   switch (action) {
      case "previous":
      var page = this.getPage() - 1; break;
      case "next":
      var page = this.getPage() + 1; break;
   }
   var action = "page" + page;
   return renderLink.call(global, param, action, text, this);
}

/**
 *
 */
Archive.prototype.stories_macro = function() {
   var day, storyDay;
   var page = this.getPage();
   var pageSize = this.getPageSize();

   var renderStory = function(story) {
      storyDay = formatDate(story.created, 'yyyy-MM-dd');
      if (day !== storyDay) {
         story.renderSkin("Story#date");
         day = storyDay;
      }
      story.renderSkin("Story#preview");
      return;
   }

   // FIXME: This is a little bit inconsistent and thus needs special care
   var archive = this.type === Archive.PAGER ? this.parent : this;
   if (!archive.parent) {
      var site = res.handlers.site;
      var offset = (page - 1) * pageSize;
      var stories = site.stories.featured.list(offset, pageSize);
      for each (var story in stories) {
         renderStory(story);
      };
      return;
   }

   var sql = new Sql;
   sql.retrieve(Sql.ARCHIVE, res.handlers.site._id, this.getFilter(),
         Sql.ARCHIVEORDER, pageSize, (page - 1) * pageSize);
   sql.traverse(function() {
      var story = Story.getById(this.id);
      renderStory(story);
   });
   return;
}

/**
 * @returns {Number}
 */
Archive.prototype.getSize = function() {
   // FIXME: This is a little bit inconsistent and thus needs special care
   var archive = this.type === Archive.PAGER ? this.parent : this;
   if (!archive.parent) {
      return res.handlers.site.stories.featured.size();
   }
   var size;
   var sql = new Sql;
   sql.retrieve(Sql.ARCHIVESIZE, res.handlers.site._id, this.getFilter());
   sql.traverse(function() {
      size = this.count;
      return;
   });
   return size;
}

/**
 * @param {boolean}
 * @returns {String}
 */
Archive.prototype.getFilter = function() {
   var buffer = [];
   var archive = this;
   do {
      if (archive.type === Archive.COLLECTION) {
         buffer.unshift(Number(archive.name));
      }
   } while (archive = archive.parent);

   if (buffer.length < 0) {
      var now = new Date;
      buffer.push(now.getDate());
      buffer.push(now.getMonth() + 1);
      buffer.push(now.getFullYear());
   }

   res.push();
   var sql = new Sql;
   var keys = ["year", "month", "day"];
   for (var i in buffer) {
      sql.retrieve(Sql.ARCHIVEPART, keys[i], buffer[i]);
      res.write(sql);
   }
   return res.pop();
}

/**
 * @returns {Number}
 */
Archive.prototype.getPage = function() {
   if (this.type === Archive.PAGER) {
      return Number(this.name.substr(4));
   }
   return 1;
}

/**
 * @returns {Number}
 */
Archive.prototype.getPageSize = function() {
   return res.handlers.site.pageSize;
}

/**
 * @returns {Date}
 */
Archive.prototype.getDate = function() {
   var date = new Date;
   var offset = path.contains(res.handlers.site.archive) + 1;
   if (offset > -1) {
      var archive;
      var buffer = [];
      for (var i=offset; i<path.length; i+=1) {
         archive = path[i];
         if (archive.type === Archive.COLLECTION) {
            buffer.push(Number(archive.name));
         }
      }
   }
   buffer[0] && date.setYear(buffer[0]);
   buffer[1] && date.setMonth(buffer[1] - 1);
   buffer[2] && date.setDate(buffer[2]);
   return date;
}
