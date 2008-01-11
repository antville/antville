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

Tags.prototype.getPermission = function(action) {
   return this._parent.getPermission("main");
};

Tags.prototype.main_action = function() {
   var action = this.getAction();
   if (req.data.group) {
      this.setGroup(req.data.group)
      res.redirect(this.href(action));
   }
   if (req.data.page) {
      this.setPage(req.data.page);
      res.redirect(this.href(action));
   }
   var skin = (action ? "Tags#" + action : "Tags"); 
   res.data.body = this.renderSkinAsString(skin);
   res.handlers.site.renderSkin("page");
   return;
};

Tags.prototype.admin_action = function() {
   return this.main_action();
};

Tags.prototype.getChildElement = function(id) {
   var child = this[id] || this.get(Tags.ALL).get(id);
   return child;

   /* if (child && child.size() > 0) {
      return;
      
      renderList(child, "mgrlistitem", 10, req.data.page);
      res.data.body = this._parent.renderSkinAsString("main");
      path.site.renderSkin("page");
      return {main_action: new Function};
      
      var self = this;
      res.data.title = getMessage("Tags.viewTitle", {title: "Tags", 
            siteName: self._parent.title});
      res.data.list = renderList(child, function(item) {
         item.parent.renderSkin("preview");
      }, 10, req.data.page);
      res.data.pagenavigation = renderPageNavigation(child, 
            child.href(req.action), 20, req.data.page);
      res.data.body = self.renderSkinAsString("main");
      path.site.renderSkin("page");
      return {main_action: new Function};

      var manager = new Manager(this, child);
      manager.getItemHref = function() {
         return this.parent.href();
      };
      manager.setDefaultHandler("Date", -1);
      manager.addHandler("Story", function() {
         if (this.parent.title) {
            return this.parent.title.toLowerCase();
         } else {
            return "Story " + this.parent._id;
         }
      })
      manager.addHandler("Author", function() {
         return this.user.name.toLowerCase();
      });
      manager.addHandler("Date", function() {
         return this.parent.createtime.format("yyyy-MM-dd HH:mm");
      });
      return manager;
   }
   return child; */ 
};

Tags.prototype.alphabet_macro = function() {
   if (this.get(Tags.ALL).size() < 50) {
      return;
   }

   var self = this;
   var collection = this.get(Tags.ALPHABETICAL);
   var prefix = "?group=";
   var group = this.getGroup();

   var add = function(text, id) {
      if (group === id) {
         res.write(text);
      } else {
         Html.link({href: self.href(self.getAction()) + prefix + id}, text);      
      }
      res.write(" ");
      return;
   };

   add("*", Tags.ALL);
   collection.forEach(function() {
      add(this._id, this._id);
   });
   if (this.get(Tags.OTHER).size() > 0) {
      add("?", Tags.OTHER);
   }
   return;
};

Tags.prototype.pager_macro = function() {
   var page = this.getPage();
   var max = this.get(this.getGroup()).size();
   var size = this.getPageSize();
   var total = Math.ceil(max / size);
   if (total < 2) {
      return;
   }
   var prefix = "?page=";
   for (var i=1; i<=total; i+=1) {
      if (i == page) {
         res.write(i);
      } else {
         Html.link({href: this.href(this.getAction()) + prefix + i}, i);      
      }
      res.write(" ");
   }
   return;
};

Tags.prototype.header_macro = function(param) {
   var header = this.getHeader();
   for each (var title in header) {
      this.renderSkin("Tags#header", {title: title});
   }
   return;
};

Tags.prototype.list_macro = function(param, skin) {
   var page = this.getPage();
   var size = this.getPageSize();
   var start = (page - 1) * size;
   var collection = this.get(this.getGroup()).list(start, size);
   // FIXME: ListRenderer should do this
   //var list = new jala.ListRenderer(collection);
   //list.render(skin || mgrlistitem);
   var index = start + 1;
   for each (var item in collection) {
      // FIXME: Is there a more elegant solution?
      if (item.constructor !== Tag) {
         item = item.get(0);
      }
      item.renderSkin(skin || "Tag#item", {index: index});
      index += 1;
   }
   return;
};

Tags.prototype.get = function(group) {
   return this._parent.getTags(this._id, group || this.getGroup());
};

Tags.prototype.getGroup = function() {
   return decodeURIComponent(session.data[this.href("group")] || Tags.ALL);
};

Tags.prototype.setGroup = function(group) {
   session.data[this.href("group")] = encodeURIComponent(group);
   this.setPage(1);
   return;
};

Tags.prototype.getPage = function() {
   return session.data[this.href("page")] || 1;
};

Tags.prototype.setPage = function(page) {
   session.data[this.href("page")] = page;
   return;
};

Tags.prototype.getPageSize = function() {
   return 25;
};

Tags.prototype.getAction = function() {
   return (req.action === "main" ? String.EMPTY : req.action);
};

Tags.prototype.getHeader = function() {
   if (this._parent.getAdminHeader) {
      return this._parent.getAdminHeader(this._id) || [];
   }
   return [];
};

Tags.ALL = "all";
Tags.OTHER = "other";
Tags.ALPHABETICAL = "alphabetical";

/*
Tags.prototype.get__ = function(group) {
   var subnodeRelation = new java.lang.StringBuffer();
   var add = function(s) {
      subnodeRelation.append(s);
      return;
   };
   
   var collection = this._parent.tagList;
   add("where tagjoin.site_id = ");
   add(path.site._id);
   add(" and tagjoin.parent_type = '" + this._parent.getTagType() + "' ");

   var group = group || this.getGroup();
   switch (group) {
      case "*":
      break;
      
      case "+":
      add("and substr(tagjoin.name, 1, 1) >= 'a' and ");
      add("substr(tagjoin.name, 1, 1) <= 'z' ");
      break;
      
      case "?":
      add("and (substr(tagjoin.name, 1, 1) < 'a' or ");
      add("substr(tagjoin.name, 1, 1) > 'z') ");
      break;

      default:
      add(" and substr(tagjoin.name, 1, 1) = '" + group + "' ");
   }

   add("group by tagjoin.name ");
   add("order by tagjoin.name asc");
   collection.subnodeRelation = subnodeRelation.toString();
   return collection;
};
*/
