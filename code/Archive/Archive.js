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

Archive.PAGER = "page";
Archive.COLLECTION = "collection";

Archive.prototype.constructor = function(name, type, parent) {
   this.name = name;
   this.type = type;
   this.parent = parent;
   return this;
}

Archive.prototype.getChildElement = function(name) {
   if (name.startsWith(Archive.PAGER)) {
      return new Archive(name, Archive.PAGER, this);
   } else if (!isNaN(name)) {
      return new Archive(name, Archive.COLLECTION, this);
   }
   return this.get(name);
}

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
   res.data.title = "Archive of " + res.handlers.site.getTitle();
   res.data.body = this.renderSkinAsString("Archive#main");
   res.handlers.site.renderSkin("Site#page");
   res.handlers.site.log();
   return;
}

Archive.prototype.page1_action = function() {
   return res.redirect(this.href());
}

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

Archive.prototype.stories_macro = function() {
   var day, storyDay; 
   var page = this.getPage();
   var pageSize = this.getPageSize();
  
   var renderStory = function(story) {
      storyDay = story.created.getDate();
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

   res.push();
   res.write("select id from content ");
   res.write(this.getFilter());
   res.write(" limit " + pageSize);
   res.write(" offset " + (page - 1) * pageSize);
   var sql = res.pop();

   var db = getDBConnection("antville");
   rows = db.executeRetrieval(sql);
   var story, storyDay, day;
   while (rows.next()) {
      story = Story.getById(rows.getColumnItem("id"));
      renderStory(story);
   }
   rows.release();
   return;
}

Archive.prototype.getSize = function() {
   // FIXME: This is a little bit inconsistent and thus needs special care
   var archive = this.type === Archive.PAGER ? this.parent : this;
   if (!archive.parent) {
      return res.handlers.site.stories.featured.size();
   }
   var db = getDBConnection("antville");
   var sql = "select count(*) as max from content " + this.getFilter();
   var rows = db.executeRetrieval(sql);
   rows.next();
   return rows.getColumnItem("max");
}

Archive.prototype.getFilter = function() {
   var buffer = [];
   var archive = this;
   do {
      if (archive.type === Archive.COLLECTION) {
         buffer.push(Number(archive.name));
      }
   } while (archive = archive.parent);
   
   if (buffer.length > 0) {
      buffer.reverse();
      //buffer[1] && (buffer[1] += 1);
   } else {
      var now = new Date;
      buffer.push(now.getDate());
      buffer.push(now.getMonth() + 1);
      buffer.push(now.getFullYear());
   }
    
   res.push();
   var site = res.handlers.site;
   res.write("where site_id = ");
   res.write(site._id);
   res.write(" and prototype = 'Story' and status <> 'closed'");

   var keys = ["year", "month", "day"];
   for (var i in buffer) {
      res.write(" and ");
      res.write(keys[i]);
      res.write("(created) = ");
      res.write(buffer[i]);
   }
   res.write(" order by created desc");
   return res.pop();
}

Archive.prototype.getPage = function() {
   if (this.type === Archive.PAGER) {
      return Number(this.name.substr(4));
   }
   return 1;
}

Archive.prototype.getPageSize = function() {
   return res.handlers.site.pageSize;
}

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
