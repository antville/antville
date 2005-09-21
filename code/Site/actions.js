/**
 * main action
 */
function main_action() {
   if (this.allstories.size() == 0) {
      res.data.body = this.renderSkinAsString("welcome");
      if (session.user) {
         if (session.user == this.creator)
            res.data.body += this.renderSkinAsString("welcomeowner");
         if (session.user.sysadmin)
            res.data.body += this.renderSkinAsString("welcomesysadmin");
      }
   } else {
      this.renderStorylist(req.data.day);
      res.data.body = this.renderSkinAsString("main");
   }
   res.data.title = this.title;
   this.renderSkin("page");
   logAccess();
   return;
}

/**
 * edit action
 */
function edit_action() {
   if (req.data.cancel) {
      res.redirect(this.href());
   } else if (req.data.rebuildIndex) {
      app.data.indexManager.queueForRebuilding(this.alias);
      res.message = new Message("rebuildIndex");
      res.redirect(this.href(req.action));
   } else if (req.data.save) {
      try {
         res.message = this.evalPreferences(req.data, session.user);
         res.redirect(this.href(req.action));
      } catch (err) {
         res.message = err.toString();
      }
   }

   res.data.action = this.href(req.action);
   res.data.title = getMessage("Site.preferencesTitle", {siteTitle: this.title});
   res.data.body = this.renderSkinAsString("edit");
   this.renderSkin("page");
   return;
}


/**
 * delete action
 */
function delete_action() {
   if (req.data.cancel)
      res.redirect(this.href());
   else if (req.data.remove) {
      try {
         res.message = root.deleteSite(this);
         res.redirect(root.href());
      } catch (err) {
         res.message = err.toString();
      }
   }

   res.data.action = this.href(req.action);
   res.data.title = getMessage("Site.deleteTitle");
   var skinParam = {
      description: getMessage("Site.deleteDescription"),
      detail: this.title
   };
   res.data.body = this.renderSkinAsString("delete", skinParam);
   this.renderSkin("page");
   return;
}


/**
 * wrapper to access colorpicker also from site
 */

function colorpicker_action() {
   res.handlers.site = this;
   root.colorpicker_action();
   return;
}


/**
 * wrapper to make style.skin public
 */
function main_css_action() {
   res.dependsOn(this.modifytime);
   res.dependsOn(res.handlers.layout.modifytime);
   res.dependsOn(res.handlers.layout.skins.getSkinSource("Site", "style"));
   res.digest();
   res.contentType = "text/css";
   this.renderSkin("style");
   return;
}

/**
 * wrapper to make javascript.skin public
 */
function main_js_action() {
   res.dependsOn(this.modifytime);
   res.dependsOn(res.handlers.layout.modifytime);
   res.dependsOn(res.handlers.layout.skins.getSkinSource("Site", "javascript"));
   res.digest();
   res.contentType = "text/javascript";
   this.renderSkin("javascript");
   root.renderSkin("systemscripts");
   return;
}

/**
 * wrapper for rss feed
 */
function rss_xml_action() {
   res.redirect(root.href("rss"));
   return;
}

/**
 * rss feed
 */
function rss_action() {
   res.contentType = "text/xml";
   res.dependsOn(this.lastupdate);
   res.digest();

   var now = new Date();
   var systitle = root.getTitle();
   var sdf = new java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'");
   sdf.setTimeZone(new java.util.SimpleTimeZone(0, "UTC"));

   var collection, subtitle;
   switch (true) {
      case (req.data.show == "all") :
         collection = this.allcontent;
         subtitle = "with comments";
         break;
      // FIXME: i don't think a day makes much sense as rss output [tobi]
      case (req.data.day != null) :
         collection = this.get(req.data.day);
         subtitle = req.data.day;
         break;
      case (req.data.topic != null) :
         collection = this.topics.get(req.data.topic);
         subtitle = req.data.topic;
         break;
      default :
         collection = this.allstories;
   }
   var size = (collection != null) ? collection.size() : 0;

   var max = req.data.max ? parseInt(req.data.max) : 7;
   max = Math.min(max, size);
   max = Math.min(max, 10);

   var item = {};
   if (max > 0 && this.online) {
      var items = new java.lang.StringBuffer();
      var resources = new java.lang.StringBuffer();
      collection.prefetchChildren(0, max);
      for (var i=0; i<max; i++) {
         var story = collection.get(i);
         var item = {
            url: story.href(),
            title: story.getRenderedContentPart("title").stripTags().clip(50),
            text: story.getRenderedContentPart("text").stripTags().clip(500),
            publisher: systitle,
            creator: story.creator.name,
            date: sdf.format(story.createtime),
            subject: story.topic ? story.topic : "",
            year: story.createtime.getFullYear()
         };
         if (story.creator.publishemail)
            item.email = story.creator.email.entitize();
         if (!item.title) {
            // shit happens: if a content part contains a markup
            // element only, String.clip() will return nothing...
            if (!item.text)
               item.title = "...";
            else
               item.title = story.getRenderedContentPart("text").stripTags().clip(25);
         }
         items.append(story.renderSkinAsString("rssItem", item));
         resources.append(story.renderSkinAsString("rssResource", item));
      }

      var site = {
         subtitle: subtitle,
         url: this.href(),
         title: systitle,
         creator: this.creator.name,
         year: now.getFullYear(),
         lastupdate: max > 0 ? sdf.format(this.lastUpdate): sdf.format(this.createtime),
         items: items.toString(),
         resources: resources.toString()
      };
      if (this.email)
         site.email = this.email.entitize();
      else if (this.creator.publishemail)
         site.email = this.creator.email.entitize();
      this.renderSkin("rss", site);
   }
   return;
}

/**
 * this action tries to get a file with the given name
 * if it finds it, it increases the request-counter of this file
 * sets the appropriate mimetype and redirects the browser to the file
 */
function getfile_action() {
   var f = this.files.get(req.data.name);
   if (f) {
      f.requestcnt++;
      res.contentType = f.mimetype;
      res.redirect(f.getUrl());
   } else {
      res.message = getMessage("error.fileNotFound", req.data.name);
      res.redirect(this.href());
   }
   return;
}

/**
 * most read stories of a site
 */
function mostread_action() {
   res.data.title = getMessage("Site.mostReadTitle", {siteTitle: this.title});
   res.data.body = this.renderSkinAsString("mostread");
   this.renderSkin("page");
   return;
}

/**
 * referrers of a site
 */
function referrers_action() {
   if (req.data.permanent && session.user) {
      try {
         // FIXME: unfortunately, the check* methods are
         // not very handy, anymore... (need try/catch block)
         this.checkEdit(session.user, req.data.memberlevel);
      } catch (err) {
         res.message = err.toString();
         res.redirect(this.href());
         return;
      }
      var urls = req.data.permanent_array ?
                 req.data.permanent_array : [req.data.permanent];
      res.push();
      res.write(this.preferences.getProperty("spamfilter"));
      for (var i in urls) {
         res.write("\n");
         res.write(urls[i]);
      }
      this.preferences.setProperty("spamfilter", res.pop());
      res.redirect(this.href(req.action));
      return;
   }
   res.data.action = this.href("referrers");
   res.data.title = getMessage("Site.referrersReadTitle", {siteTitle: this.title});
   res.data.body = this.renderSkinAsString("referrers");
   this.renderSkin("page");
   return;
}

/**
 * search action
 */
function search_action() {
   var self = this;

   /**
    * private method for rendering the results
    */
   var renderResult = function(hits, itemsPerPage, pageIdx) {
      var currIdx = 0;
      var size = hits.length();
      var validCnt = 0;
   
      var totalPages = Math.ceil(size/itemsPerPage);
      if (isNaN(pageIdx) || pageIdx > totalPages || pageIdx < 0)
         pageIdx = 0;
      var start = (pageIdx * itemsPerPage);
      stop = Math.min(start + itemsPerPage, size);
      res.push();
      while (currIdx < size && validCnt < stop) {
         var item = Story.getById(hits.doc(currIdx).get("id"));
         if (item) {
            var status = (item instanceof Comment) ? item.story.online : item.online;
            if (status > 0) {
               if (validCnt >= start) {
                  item.renderSkin("searchview", {score: Math.round(hits.score(currIdx) * 100)});
               }
               validCnt++;
            } else {
               // "correct" the number of hits since
               // the story/comment is offline
               total--;
            }
         }
         currIdx++;
      }
      return res.pop();
   }

   /**
    * main action body
    */
   if (req.isGet() && req.data.q != null) {
      var query = stripTags(req.data.q);
      var queryArr = ["q=" + query];

      // construct the filter query
      var fq = new Search.BooleanQuery();
      fq.addQuery(new Search.RangeQuery("online", 1, 2));
      // filter by creator
      if (req.data.c) {
         fq.addTerm("creator", req.data.c);
         queryArr.push("c=" + req.data.c);
      }
      // filter by createtime
      if (req.data.ct) {
         var then = new Date();
         var min = new Date(then.setMonth(then.getMonth() - parseInt(req.data.ct, 10)));
         min = min.format("yyyyMMdd", this.getLocale(), this.getTimeZone());
         fq.addQuery(new Search.RangeQuery("createtime", min));
         queryArr.push("ct=" + req.data.ct);
      }
      var filter = new Search.QueryFilter(fq);

      // construct the query itself
      var q = new Search.BooleanQuery();
      q.addTerm("site", this._id);
      // occurrence
      queryArr.push("o=" + req.data.o);
      switch (req.data.o) {
         case "topic":
            q.addTerm("topic", query);
            break;
         case "title":
            q.addTerm("title", query);
            break;
         case "text":
            q.addTerm("text", query);
            break;
         default:
            q.addTerm(["title", "text", "topic"], query);
            break;
      }

      var index = this.getIndex();
      if (!index) {
         res.message = getMessage("error.searchNothingFound", encodeForm(query));
      } else {
         var now = new Date();
         var searcher = new index.Searcher();
         var total = searcher.search(q, filter);
         res.data.resultlist = renderResult(searcher.hits, 10, req.data.page);
         switch(total) {
            case 0:
               res.message = getMessage("error.searchNothingFound", encodeForm(query));
               break;
            case 1:
               res.message = getMessage("confirm.resultOne", encodeForm(query));
               break;
            default:
               res.message = getMessage("confirm.resultMany", [encodeForm(query), total]);
               break;
         }
         res.data.pagenavigation = renderPageNavigation(total, this.href(req.action) + "?" + queryArr.join("&"), 10, req.data.page);
         searcher.close();
      }
      app.debug("[" + this.alias + "] search for " + q.toString() +
                ", filter: " + filter.toString() +
                " (" + (new Date()).diff(now) + "ms)");
   }

   res.data.action = this.href(req.action);
   res.data.title = this.title;
   res.data.body = this.renderSkinAsString("searchresult");
   this.renderSkin("page");
   return;
}


/**
 * subscribe action
 */
function subscribe_action() {
   // create a new member-object and add it to membership-mountpoint
   this.members.add(new Membership(session.user));
   res.message = new Message("subscriptionCreate", this.title);
   res.redirect(this.href());
   return;
}

/**
 * unsubscribe action
 */
function unsubscribe_action() {
   if (req.data.cancel)
      res.redirect(this.members.href("subscriptions"));
   else if (req.data.remove) {
      try {
         res.message = this.members.deleteMembership(this.members.get(session.user.name), session.user);
         res.redirect(this.members.href("subscriptions"));
      } catch (err) {
         res.message = err.toString();
      }
   }

   res.data.title = getMessage("Site.subscription.deleteTitle", {siteTitle: this.title});
   var skinParam = {
      description: getMessage("Site.subscription.deleteDescription"),
      details: this.title
   };
   res.data.body = this.renderSkinAsString("delete", skinParam);
   this.renderSkin("page");
   return;
}

/**
 * context menu extension
 */
function menuext_action() {
   this.renderSkin("menuext");
   return;
}

/**
 * context menu extension (accessible as /menuext.reg)
 */
function menuext_reg_action() {
   res.contentType = "text/plain";
   this.renderSkin("menuext.reg");
   return;
}

/**
 * robots.txt action
 */
function robots_txt_action() {
   res.contentType = "text/plain";
   this.renderSkin("robots");
   return;
}
