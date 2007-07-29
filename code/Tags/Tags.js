Tags.prototype.main_action = function() {
   if (req.data.group) {
      this.setGroup(req.data.group)
      res.redirect(this.href());
   }
   if (req.data.page) {
      this.setPage(req.data.page);
      res.redirect(this.href());
   }
   res.data.body = this.renderSkinAsString("main");
   res.handlers.context.renderSkin("page");
   return;
};

Tags.prototype.getChildElement = function(id) {
   res.debug(id)
   var child = path.site.tags.get(id);
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
   var collection = this.getCollection("+");
   if (collection.size() < 50) {
      //return;
   }

   var self = this;
   var prefix = "?group=";
   var group = this.getGroup();

   var navigation = function(id) {
      if (group === id) {
         res.write(id);
      } else {
         Html.link({href: self.href() + prefix + id}, id);      
      }
      res.write(" ");
      return;
   };

   navigation("*");
   collection.forEach(function() {
      navigation(this._id);
   });
   if (this.getCollection("?").size() > 0) {
      navigation("?");
   }
   return;
};

Tags.prototype.pager_macro = function() {
   var page = this.getPage();
   var max = this.getCollection().size();
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
         Html.link({href: this.href() + prefix + i}, i);      
      }
      res.write(" ");
   }
   return;
};

Tags.prototype.list_macro = function() {
   var page = this.getPage();
   var size = this.getPageSize();
   var start = (page - 1) * size;
   var collection = this.getCollection().list(start, size);
   var id;
   for each (var item in collection) {
      id = item.groupname || item.name;
      Html.openTag("li");
      Html.link({href: this.href() + encodeURIComponent(id)}, id);
      Html.closeTag("li");
   }
};

Tags.prototype.getCollection = function(group) {
   if (!group) {
      group = this.getGroup();
   }
   switch (group) {
      case "*":
      return this._parent.allTags;     
      case "?":
      return this._parent.otherTags;
      case "+":
      return this._parent.alphabeticalTags;
      default:
      return this._parent.alphabeticalTags.get(group);
   }
};

Tags.prototype.getGroup = function() {
   return decodeURIComponent(session.data[this.href("group")] || "*");
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

/*
Tags.prototype.getCollection__ = function(group) {
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
