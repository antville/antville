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

Archive.Fields = ["year", "month", "day"];

Archive.prototype.constructor = function(name, parent) {
   this.name = name;
   this.parent = parent;
   return this;
};

Archive.prototype.getPermission = function(action) {
   var site = res.handlers.site;
   if (!site.getPermission("main")) {
      return false;
   }
   switch (action) {
      case "previous":
      return this.getPage() > 1
      case "next":
      return this.getPage() < this.getSize() / this.getPageSize();
      default:
      return site.archiveMode === Site.PUBLIC;
   }
   return false;
};

Archive.prototype.link_macro = function(param, action, text) {
   if (!this.getPermission(action)) {
      return;
   }
   switch (action) {
      case "previous":
      var page = this.getPage() - 1; 
      action = this.href("page" + page, true); break;
      case "next":
      var page = this.getPage() + 1; 
      action = this.href("page" + page, true); break;
   }
   return renderLink.call(global, param, action, text, this);
};

Archive.prototype.getChildElement = function(name) {
   if (name.startsWith("page")) {
      return new Archive(name);
   } else if (!isNaN(name)) {
      return new Archive(name, this);
   }
   return this.get(name);
};

Archive.prototype.href = function(action, full) {
   res.push();
   res.write(res.handlers.site.href("archive"));
   res.write("/");
   // FIXME: jala.Date.Calendar does not fully conform with href() generation
   if (full) {
      var value;
      for each (var field in Archive.Fields) {
         if (value = this.getDate(field)) {
            res.write(value);
            res.write("/");
         }
      }
   }
   action && res.write(action);
   return res.pop();
};

Archive.prototype.main_action = function() {
   res.data.body = this.renderSkinAsString("Archive#main");
   res.handlers.site.renderSkin("Site#page");
   return;
};

Archive.prototype.list_macro = function(param, type) {
   switch (type) {
      default:
      var day, storyDay; 
      var page = this.getPage();
      var pageSize = this.getPageSize();
     
      var renderStory = function(story) {
         storyDay = story.created.getDate();
         if (day !== storyDay) {
            story.renderSkin("Story#day");
            day = storyDay;
         }
         story.renderSkin("Story#preview");
         return;
      };
   
      if (!this.parent) {
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
      sql = res.pop();
   
      var db = getDBConnection("antville");
      rows = db.executeRetrieval(sql);
      var story, storyDay, day;
      while (rows.next()) {
         story = Story.getById(rows.getColumnItem("id"));
         renderStory(story);
      }
      rows.release();
   }
   return;
};

Archive.prototype.getDate = function(part) {
   if (path.contains(this) > -1) {
      var value;
      if (part) {
         var site = res.handlers.site;
         var offset = path.contains(site);
         var index = Archive.Fields.indexOf(part);
         var value = path[offset + 2 + index];
         if (value && value.parent) {
            return (part === "month" ? value.name - 1 : value.name);
         }
      } else {
         var value;
         var date = new Date;
         (value = this.getDate("year")) && date.setYear(value);
         (value = this.getDate("month")) && date.setMonth(value);
         (value = this.getDate("day"))  && date.setDate(value);
         return new Date(date);
      }
   }
   return null;
};

Archive.prototype.getPage = function() {
   if (this.name && this.name.startsWith("page")) {
      return Number(this.name.substr(4));
   }
   return 1;
};

Archive.prototype.getPageSize = function() {
   return 10;
};

Archive.prototype.getSize = function() {
   if (!res.meta.archiveSize) {
      var db = getDBConnection("antville");
      var sql = "select count(*) as max from content " + this.getFilter();
      var rows = db.executeRetrieval(sql);
      rows.next();
      res.meta.archiveSize = rows.getColumnItem("max");
   }
   return res.meta.archiveSize;
};

Archive.prototype.getFilter = function() {
   if (!res.meta.archiveFilter) {
      var site = res.handlers.site;
      res.push();
      res.write("where site_id = ");
      res.write(site._id);
      res.write(" and prototype = 'Story' and status <> 'closed'");
      var part;
      if (part = this.getDate("year")) {
          res.write(" and year(created) = " + part);
      }
      if (part = this.getDate("month")) {
         res.write(" and month(created) = " + (part + 1));
      }
      if (part = this.getDate("day")) {
         res.write(" and day(created) = " + part);
      }
      res.write(" order by created desc");
      res.meta.archiveFilter = res.pop();
   }
   return res.meta.archiveFilter;
};

Archive.prototype.page1_action = function() {
   return res.redirect(this.href());
};
