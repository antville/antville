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

defineConstants(Site, "getStatus", "default", "blocked", "trusted");
defineConstants(Site, "getModes", "closed", "private", "readonly", "public", "open");
defineConstants(Site, "getPageModes", "days", "stories");

this.handleMetadata("archiveMode");
this.handleMetadata("commentsMode");
this.handleMetadata("email");
this.handleMetadata("language");
this.handleMetadata("lastUpdate");
this.handleMetadata("longDateFormat");
this.handleMetadata("notifiedOfBlocking");
this.handleMetadata("notifiedOfDeletion");
this.handleMetadata("offlineSince");
this.handleMetadata("pageSize");
this.handleMetadata("pageMode");
this.handleMetadata("shortDateFormat");
this.handleMetadata("tagline");
this.handleMetadata("timeZone");
this.handleMetadata("title"),
this.handleMetadata("webHookEnabled");
this.handleMetadata("webHookLastUpdate");
this.handleMetadata("webHookUrl");

Site.prototype.constructor = function(name, title) {
   var now = new Date;
   var locale = root.getLocale();
   var user = session.user || new HopObject;

   this.map({
      name: name,
      title: title || name,
      created: now,
      creator: user,
      modified: now,
      modifier: user,
      status: user.status === User.TRUSTED ? "trusted" : "default",
      mode: Site.PRIVATE,
      tagline: "",
      webHookEnabled: false,
      commentMode: Comment.ONLINE,
      archiveMode: Site.ARCHIVE_ONLINE,
      pageMode: "days",
      pageSize: 3,
      language: locale.getLanguage(),
      country: locale.getCountry(),
      timeZone: root.getTimeZone().getID(),
      longDateFormat: "EEEE, dd. MMMM yyyy, h:mm a",
      shortDateFormat: "yyyy-MM-dd, HH:mm"
   });

   return this;
};

Site.prototype.onPersist = function() {
   writeln(">>>>>>>>>>>>>>>>>>>> onPersist: " + new Date);
   return;
};

Site.prototype.update = function(data) {
   this.map({
      title: stripTags(data.title),
      tagline: data.tagline,
      email: data.email,
      mode: data.mode || Site.PRIVATE,
      webHookUrl: data.webHookUrl,
      webHookEnabled: data.webHookEnabled ? true : false,
      pageMode: data.pageMode || 'days',
      pageSize: parseInt(data.pageSize, 10) || 3,
      commentsMode: data.commentsMode,
      archiveMode: data.archiveMode,
      timeZone: data.timeZone,
      longDateFormat: data.longDateFormat,
      shortDateFormat: data.shortDateFormat,
      language: data.language,
      layout: Layout.getById(data.layout)
   });
   
   this.touch();
   return;
};

Site.prototype.getPermission = function(action) {
   switch (action) {
      case "stories/create":
      case "stories":
      case "images":
      case "files":
      case "polls":
      return User.getPermission(User.PRIVILEGED) ||
            Membership.getPermission(Membership.CONTRIBUTOR) ||
            this.mode === Site.OPEN;

      case "edit":
      case "layouts":
      case "referrers":
      case "mostread":
      case "members":
      return User.getPermission(User.PRIVILEGED) ||
            Membership.getPermission(Membership.OWNER);
            
      case "subscribe":
      var mode = this.mode;
      return (mode === Site.PUBLIC || mode === Site.OPEN) &&
            !res.handlers.membership.role;

      case "unsubscribe":
      return this.getMembership().role !== Membership.OWNER;
   }
   return true;
};

Site.prototype.getMembership = function() {
   var membership;
   if (session.user) {
      membership = this.members.get(session.user.name);
   }
   return membership || new HopObject;
}

Site.prototype.main_action = function() {
   if (this.allstories.size() == 0) {
      res.data.body = this.renderSkinAsString("welcome");
      if (session.user) {
         if (session.user === this.creator)
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
   logAction();
   return;
};

Site.prototype.edit_action = function() {
   if (req.postParams.save) {
      try {
         this.update(req.postParams);
         res.message = gettext("The changes were saved successfully.");
         res.redirect(this.href(req.action));
      } catch (ex) {
         res.message = ex;
         app.log(ex);
         /*writeln("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
         var e = new Packages.org.mozilla.javascript.EvaluatorException(ex);
         e.fillInStackTrace();
         res.debug(e.getScriptStackTrace());
         res.debug(e.printStackTrace(java.lang.System.out));
         var trace = e.getStackTrace();
         writeln(trace.toString());
         for (var i in ex)
         app.log(i + ": " + ex[i]);*/
      }
   }

   res.data.action = this.href(req.action);
   res.data.title = gettext("Preferences of {0}", this.title);
   res.data.body = this.renderSkinAsString("edit");
   this.renderSkin("page");
   return;
};

Site.prototype.delete_action = function() {
   if (req.postParams.proceed) {
      try {
         Site.remove(this);
         res.message = gettext("The site {0} was removed successfully.",
               this.name);
         res.redirect(root.href());
      } catch(ex) {
         res.message = ex;
         app.log(ex);
      }
   }

   res.data.action = this.href(req.action);
   res.data.title = gettext("Delete site");
   res.data.body = this.renderSkinAsString("delete", {
      text: gettext('You are about to delete the site {0}', this.title) 
   });
   this.renderSkin("page");
   return;
};

Site.remove = function(site) {
   HopObject.remove(site.members);
   HopObject.remove(site.stories);
   HopObject.remove(site.images);
   HopObject.remove(site.files)
   // FIXME: HopObject.remove(site.layouts);
   site.remove();
   logAction("site", "removed");
   return;
};

Site.prototype.main_css_action = function() {
   res.dependsOn(this.modifytime);
   res.dependsOn(res.handlers.layout.modifytime);
   res.dependsOn(res.handlers.layout.skins.getSkinSource("Site", "style"));
   res.digest();
   res.contentType = "text/css";
   this.renderSkin("style");
   return;
};

Site.prototype.main_js_action = function() {
   res.dependsOn(this.modifytime);
   res.dependsOn(res.handlers.layout.modifytime);
   res.dependsOn(res.handlers.layout.skins.getSkinSource("Site", "javascript"));
   res.digest();
   res.contentType = "text/javascript";
   this.renderSkin("javascript");
   root.renderSkin("systemscripts");
   return;
};

Site.prototype.rss_xml_action = function() {
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
            title: story.getRenderedContentPart("title").stripTags(),
            text: story.getRenderedContentPart("text").stripTags(),
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
            if (!item.text )
               item.title = "...";
            else {
               var embody = item.text.embody(10, "...", "\\s");
               item.title = embody.head;
               item.text = embody.tail;
            }
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
};

Site.prototype.getfile_action = function() {
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
};

Site.prototype.mostread_action = function() {
   res.data.title = getMessage("Site.mostReadTitle", {siteTitle: this.title});
   res.data.body = this.renderSkinAsString("mostread");
   this.renderSkin("page");
   return;
};

Site.prototype.referrers_action = function() {
   if (req.data.permanent && session.user) {
      try {
         this.checkEdit(session.user, res.data.memberlevel);
      } catch (err) {
         res.message = err.toString();
         res.redirect(this.href());
         return;
      }
      var urls = req.data.permanent_array ?
                 req.data.permanent_array : [req.data.permanent];
      res.push();
      res.write(this.metadata.get("spamfilter"));
      for (var i in urls) {
         res.write("\n");
         res.write(urls[i].replace(/\?/g, "\\\\?"));
      }
      this.metadata.set("spamfilter", res.pop());
      res.redirect(this.href(req.action));
      return;
   }
   res.data.action = this.href("referrers");
   res.data.title = getMessage("Site.referrersReadTitle", {siteTitle: this.title});
   res.data.body = this.renderSkinAsString("referrers");
   this.renderSkin("page");
   return;
};

Site.prototype.search_action = function() {
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
};

Site.prototype.subscribe_action = function() {
   this.members.add(new Membership(session.user));
   res.message = gettext("You successfully subscribed to {0}", this.title);
   res.redirect(this.href());
   return;
};

Site.prototype.unsubscribe_action = function() {
   if (req.postParams.proceed) {
      try {
         Membership.remove(this.members.get(session.user.name));
         res.message = gettext("Successfully deleted the membership.");
         res.redirect(this.members.href("subscriptions"));
      } catch (err) {
         res.message = err.toString();
      }
   }

   res.data.title = gettext("Remove subscription to {0}", this.title);
   res.data.body = this.renderSkinAsString("delete", {
      text: gettext('You are about to remove the subscription to {0}', 
            this.title)
   });
   this.renderSkin("page");
   return;
};

Site.prototype.robots_txt_action = function() {
   res.contentType = "text/plain";
   this.renderSkin("robots");
   return;
};

Site.prototype.getMacroHandler = function(name) {
   switch (name) {
      default:
      return null;
   }
};

Site.prototype.getFormOptions = function(name) {
   var options = [];
   switch (name) {
      case "archiveMode":
      options = [{
         value: Site.ARCHIVE_ONLINE, 
         display: gettext("online")
      }, {
         value: Site.ARCHIVE_OFFLINE,
         display: gettext("offline")
      }]; break;
      
      case "commentsMode":
      options = [{
         value: Comment.ONLINE, 
         display: gettext("online")
      }, {
         value: Comment.OFFLINE,
         display: gettext("offline")
      }]; break;
      
      case "language":
      options = getLocales(); break;
      
      case "layout":
      options = this.getLayouts(); break;
      
      case "longDateFormat":
      options = getDateFormats("long"); break;
      
      case "mode":
      options = Site.getModes(); break;
      
      case "pageMode":
      options = Site.getPageModes(); break;
      
      case "status":
      options = Site.getStatus(); break;
      
      case "shortDateFormat":
      options = getDateFormats("short"); break;
      
      case "timeZone":
      options = getTimeZones(); break;
      
      default:
      return HopObject.prototype.getFormOptions.apply(this, arguments);
   }
   return options;
};

Site.prototype.loginstatus_macro = function(param) {
   if (session.user)
      this.members.renderSkin("statusloggedin");
   else if (req.action != "login")
      this.members.renderSkin("statusloggedout");
   return;
};

Site.prototype.moduleNavigation_macro = function(param) {
   if (!param.module)
      return;
   this.applyModuleMethod(app.modules[param.module],
                          "renderSiteNavigation", param);
   return;
};

Site.prototype.calendar_macro = function(param) {
   // do nothing if there is not a single story :-))
   // or if archive of this site is disabled
   if (!this.allstories.size() || !this.metadata.get("archive"))
      return;
   // define variables needed in this function
   var calParam = new Object();
   var dayParam = new Object();
   var weekParam = new Object();
   res.push();

   // create new calendar-object
   var cal = java.util.Calendar.getInstance(this.getTimeZone(), this.getLocale());
   var symbols = this.getDateSymbols();

   // render header-row of calendar
   var firstDayOfWeek = cal.getFirstDayOfWeek();
   var weekdays = symbols.getShortWeekdays();
   res.push();
   for (var i=0;i<7;i++) {
      dayParam.day = weekdays[(i+firstDayOfWeek-1)%7+1];
      this.renderSkin("calendardayheader", dayParam);
   }
   weekParam.week = res.pop();
   this.renderSkin("calendarweek", weekParam);

   cal.set(java.util.Calendar.DATE, 1);
   // check whether there's a day or a story in path
   // if so, use it to determine the month to render
   if (path.Story)
      var today = path.Story.day.toString();
   else if (path.Day && path.Day._prototype == "Day")
      var today = path.Day.groupname.toString();
   if (today) {
      // instead of using String.toDate
      // we do it manually here to avoid that a day like 20021001
      // would be changed to 20020930 in some cases
      cal.set(java.util.Calendar.YEAR, parseInt(today.substring(0, 4), 10));
      cal.set(java.util.Calendar.MONTH, parseInt(today.substring(4, 6), 10)-1);
   }
   // nr. of empty days in rendered calendar before the first day of month appears
   var pre = (7-firstDayOfWeek+cal.get(java.util.Calendar.DAY_OF_WEEK)) % 7;
   var days = cal.getActualMaximum(java.util.Calendar.DATE);
   var weeks = Math.ceil((pre + days) / 7);
   var daycnt = 1;

   var monthNames = symbols.getMonths();
   calParam.month = monthNames[cal.get(java.util.Calendar.MONTH)];
   calParam.year =  cal.get(java.util.Calendar.YEAR);

   // pre-render the year and month so we only have to append the days as we loop
   var currMonth = formatTimestamp(new Date(cal.getTime().getTime()), "yyyyMM");
   // remember the index of the first and last days within this month.
   // this is needed to optimize previous and next month links.
   var lastDayIndex = 9999999;
   var firstDayIndex = -1;

   for (var i=0;i<weeks;i++) {
      res.push();
      for (var j=0;j<7;j++) {
         dayParam.skin = "calendarday";
         if ((i == 0 && j < pre) || daycnt > days)
            dayParam.day = "&nbsp;";
         else {
            var currGroupname = currMonth+daycnt.format("00");
            var linkText = daycnt < 10 ? "&nbsp;" + daycnt + "&nbsp;" : daycnt.toString();
            var currGroup = this.get(currGroupname);
            if (currGroup) {
               var idx = this.contains(currGroup);
               if (idx > -1) {
                  if  (idx > firstDayIndex)
                     firstDayIndex = idx;
                  if (idx < lastDayIndex)
                     lastDayIndex = idx;
               }
               dayParam.day = Html.linkAsString({href: currGroup.href()}, linkText);
            } else {
               dayParam.day = linkText;
            }
            if (currGroupname == today)
               dayParam.skin = "calendarselday";
            daycnt++;
         }
         this.renderSkin(dayParam.skin, dayParam);
      }
      weekParam.week = res.pop();
      this.renderSkin("calendarweek", weekParam);
   }
   // set day to last day of month and try to render next month
   // check what the last day of the month is
   calParam.back = this.renderLinkToPrevMonth(firstDayIndex, currMonth + "01", monthNames);
   calParam.forward = this.renderLinkToNextMonth(lastDayIndex, currMonth + "31", monthNames);
   calParam.calendar = res.pop();
   this.renderSkin("calendar", calParam);
   return;
};

Site.prototype.age_macro = function(param) {
   res.write(Math.floor((new Date() - this.createtime) / ONEDAY));
   return;
};

Site.prototype.history_macro = function(param) {
   try {
      this.checkView(session.user, res.data.memberlevel);
   } catch (deny) {
      return;
   }
   var limit = param.limit ? parseInt(param.limit, 10) : 5;
   var cnt = i = 0;
   var size = this.lastmod.size();
   var discussions = this.metadata.get("discussions");
   while (cnt < limit && i < size) {
      if (i % limit == 0)
         this.lastmod.prefetchChildren(i, limit);
      var item = this.lastmod.get(i++);
      switch (item._prototype) {
         case "Story":
            if (param.show == "comments")
               continue;
            break;
         case "Comment":
            if (param.show == "stories" || !item.story.online ||
                  !item.story.discussions || !discussions)
               continue;
            break;
      }
      item.renderSkin("historyview");
      cnt++;
   }
   return;
};

Site.prototype.listMostRead_macro = function() {
   var param = new Object();
   var size = this.mostread.size();
   for (var i=0; i<size; i++) {
      var s = this.mostread.get(i);
      param.reads = s.reads;
      param.rank = i+1;
      s.renderSkin("mostread", param);
   }
   return;
};

Site.prototype.referrers_macro = function() {
   var date = new Date;
   date.setDate(date.getDate() - 1);
   var db = getDBConnection("antville");
   var query = "select text, count(*) as count from log " +
      "where type = 'request' and parent_type = 'Site' and parent_id = " + 
      this._id + " and created > {ts '" + date.format("yyyy-MM-dd HH:mm:ss") + 
      "'} group by text order by count desc, text asc;";
   var referrer;
   var rows = db.executeRetrieval(query);
   while (rows.next()) {
      referrer = rows.getColumnItem("text");
      this.renderSkin("referrerItem", {
         count: rows.getColumnItem("count"),
         referrer: encode(referrer),
         text: encode(referrer.clip(50))
      });
   }
   rows.release();
   return;
};

Site.prototype.xmlbutton_macro = function(param) {
   param.href = this.href("rss.xml");   
   Images.Default.render("xmlbutton", param);
   return;
};

/**
 * renders the searchbox
 */
Site.prototype.searchbox_macro = function(param) {
   this.renderSkin("searchbox");
   return;
};

/**
 * function renders the months of the archive
 */
Site.prototype.monthlist_macro = function(param) {
   if (!this.stories.size() || !this.metadata.get("archive"))
      return;
   var size = param.limit ? Math.min(this.size(), param.limit) : this.size();
   for (var i=0;i<size;i++) {
      var curr = this.get(i);
      var next = this.get(i+1);
      if (!next || next.groupname.substring(0, 6) < curr.groupname.substring(0, 6)) {
         res.write(param.itemprefix);
         Html.openLink({href: curr.href()});
         var ts = curr.groupname.substring(0, 6).toDate("yyyyMM", this.getTimeZone());
         res.write(formatTimestamp(ts, param.format ? param.format : "MMMM yyyy"));
         Html.closeLink();
         res.write(param.itemsuffix);
      }
   }
   return;
};

/**
 * macro rendering recipients for email notification
 * param.event: storycreate/commentcreate/textupdate/upload
 * please add some error message for undefined param.event
 */
Site.prototype.notify_macro = function(param) {
   var notifyContributors = param.notifyContributors ? 
      param.notifyContributors : getMessage("Site.notifyContributors");
   var notifyAdmins = param.notifyAdmins ? 
      param.notifyAdmins : getMessage("Site.notifyAdmins");
   var notifyNobody = param.notifyNobody ? 
      param.notifyNobody : getMessage("Site.notifyNobody");

   var pref = this.properties.get("notify_" + param.event);
   if (param.as == "editor") {
      var options = new Array(notifyNobody, notifyAdmins, notifyContributors);
      Html.dropDown({name: "notify_" + param.event}, options, pref);
   } else {
      switch (pref) {
         case 2:
            return notifyContributors;
         case 1:
            return notifyAdmins;
         default:
            return notifyNobody;
      }
   }
   return;
};

/**
 * macro rendering notification settings if enabled
 */
Site.prototype.notification_macro = function(param) {
   if (this.isNotificationEnabled())
      this.renderSkin("notification");
   return;
};

/**
 * render generic preference editor or value
 */
Site.prototype.preferences_macro = function(param) {
   if (param.as == "editor") {
      var inputParam = this.properties.createInputParam(param.name, param);
      delete inputParam.part;
      if (param.cols || param.rows)
         Html.textArea(inputParam);
      else
         Html.input(inputParam);
   } else
      res.write(this.properties.get(param.name));
   return;
};

/**
 * output spamfilter data appropriate
 * for client-side javascript code
 */
Site.prototype.spamfilter_macro = function(param) {
   var str = this.properties.get("spamfilter");
   if (!str)
      return;
   var items = str.replace(/\r/g, "").split("\n");
   for (var i in items) {
      res.write('"');
      res.write(items[i]);
      res.write('"');
      if (i < items.length-1)
         res.write(",");
   }
   return;
};

/**
 * macro returns the used disk space for this site
 */
Site.prototype.diskusage_macro = function(param) {
   res.write(this.getDiskUsage().format("###,###") + " KB");
   return;
};

/**
 * macro checks if there are any modules present
 * and if they need to be included in the system setup page
 */
Site.prototype.modulePreferences_macro = function(param) {
   for (var i in app.modules)
      this.applyModuleMethod(app.modules[i], "renderPreferences", param);
   return;
};

/**
 * catch some special needs before passing the 
 * macro call up to the HopObject prototype
 * FIXME: this is probably to hackish...
 */
Site.prototype.switch_macro = function(param) {
   if (param.name == "userMayEdit") {
      try {
         // FIXME: unfortunately, the check* methods are
         // not very handy, anymore... (need try/catch block)
         this.checkEdit(session.user, res.data.memberlevel);
         res.write(param.on);
      } catch (err) {
         res.write(param.off);
         return;
      }
   } else
      HopObject.switch_macro.apply(this, [param]);
   return;
};

/**   
 * returns the number of members of this site
 */   
Site.prototype.membercounter_macro = function(param) {
   return this.members.size();
};

/**
 * renders a dropdown containing the possible occurrences
 * of search terms in a content object
 */
Site.prototype.searchOccurrence_macro = function() {
   var options = [["", "anywhere"],
                  ["title", "in the title"],
                  ["text", "in the text"],
                  ["topic", "in the topic name"]];
   Html.dropDown({name: "o"}, options, req.data.o);
   return;
};

/**
 * renders a dropdown containing some reasonable
 * timespans for searching
 */
Site.prototype.searchCreatetime_macro = function() {
   var options = [["", "anytime"],
                  ["1", "the past month"],
                  ["2", "the past 2 months"],
                  ["4", "the past 4 months"],
                  ["6", "the past half year"],
                  ["12", "the past year"]];
   Html.dropDown({name: "ct"}, options, req.data.ct);
   return;
};

/** FIXME: to be removed!
 * function saves new properties of site
 * @param Obj Object containing the form values
 * @param Obj User-Object modifying this site
 * @throws Exception
 */
Site.prototype.evalPreferences = function(data, user) {
   res.debug(data);
  //res.abort();

return;


   this.title = stripTags(param.title);
   this.email = param.email;
   if (this.online && !param.online)
      this.lastoffline = new Date();
   this.online = param.online ? 1 : 0;
   this.enableping = param.enableping ? 1 : 0;

   // store new preferences
   var prefs = new HopObject();
   for (var i in param) {
      if (i.startsWith("properties_"))
         prefs[i.substring(12)] = param[i];
   }
   prefs.days = !isNaN(parseInt(param.properties_days, 10)) ? parseInt(param.properties_days, 10) : 3;
   prefs.discussions = param.properties_discussions ? 1 : 0;
   prefs.usercontrib = param.properties_usercontrib ? 1 : 0;
   prefs.archive = param.properties_archive ? 1 : 0;
   // store selected locale
   if (param.locale) {
      var loc = param.locale.split("_");
      prefs.language = loc[0];
      prefs.country = loc.length == 2 ? loc[1] : null;
   }
   prefs.timezone = param.timezone;
   prefs.longdateformat = param.longdateformat;
   prefs.shortdateformat = param.shortdateformat;

   // layout
   this.layout = param.layout ? this.layouts.get(param.layout) : null;

   // e-mail notification
   prefs.notify_create = parseInt(param.notify_create, 10) || null;
   prefs.notify_update = parseInt(param.notify_update, 10) || null;
   prefs.notify_upload = parseInt(param.notify_upload, 10) || null;

   // store preferences
   this.properties.setAll(prefs);
   // call the evalPreferences method of every module
   for (var i in app.modules)
      this.applyModuleMethod(app.modules[i], "evalPreferences", param);


   // reset cached locale, timezone and dateSymbols
   this.cache.locale = null;
   this.cache.timezone = null;
   this.cache.dateSymbols = null;

   this.modifytime = new Date();
   this.modifier = modifier;
};

Site.prototype.getLayouts = function() {
   var result = [];
   this.layouts.forEach(function() {
      var layout = this;
      result.push({
         value: layout._id,
         display: layout.title
      });
   });
   return result;
};

Site.prototype.getLocale = function() {
   var locale, language, country;
   if (locale = this.cache.locale) {
       return locale;
   }
   if (language = this.language) {
      if (country = this.country) {
         locale = new java.util.Locale(language, country);
      } else {
         locale = new java.util.Locale(language);
      }
   } else {
      locale = java.util.Locale.getDefault();
   }
   this.cache.locale = locale;
   return locale;
};

Site.prototype.getDateSymbols = function() {
   var symbols;
   if (symbols = this.cache.dateSymbols) {
      return symbols;
   }
   this.cache.dateSymbols = new java.text.DateFormatSymbols(this.getLocale());
   return this.cache.dateSymbols;
};

Site.prototype.getTimeZone = function() {
   var timeZone;
   if (timeZone = this.cache.timeZone) {
      return timeZone;
   }
   if (this.timeZone) {
       timeZone = java.util.TimeZone.getTimeZone(this.timeZone);
   } else {
       timeZone = java.util.TimeZone.getDefault();
   }
   this.cache.timezone = timeZone;
   return timeZone;
};

Site.prototype.deleteAll = function() {
   this.images.deleteAll();
   this.files.deleteAll();
   // FIXME: add deleting of all layouts!
   // this.layouts.deleteAll();
   this.stories.deleteAll();
   this.members.deleteAll();
   return true;
};

Site.prototype.ping = function() {
   var title = this.title ? this.title : this.alias;

   // we're doing it the xml-rpc way
   // (specs at http://newhome.weblogs.com/directory/11)
   var xr = new Remote("http://rpc.weblogs.com/RPC2");
   var ping = xr.weblogUpdates.ping(title, this.href());
   if (!ping.result)
      return;
   var result = new Object();
   result.error = ping.result.flerror;
   result.message = ping.result.message;

   if (result.error)
      app.log("Error when notifying weblogs.com for updated site \"" + this.alias + "\": " + result.message);

   // lastping is always set to now to prevent blogs
   // hanging in the scheduler if a fatal error occurs
   this.lastping = new Date();
   return result;
};

Site.prototype.processHref = function(href) {
   var vhost = app.properties["vhost." + this.alias];
   if (vhost)
      return vhost + href;
   else
      return app.properties.defaulthost + "/" + this.alias + href;
};

Site.prototype.isNotificationEnabled = function() {
   if (root.sys_allowEmails == 1 || root.sys_allowEmails == 2 && this.trusted)
      return true;
   return false;
};

Site.prototype.sendNotification = function(type, obj) {
   var notify = this.properties.get("notify_" + type);
   if (obj.online === 0 || !notify || notify == 0)
      return;
   var recipients = new Array();
   for (var i=0; i<this.members.size(); i++) {
      var m = this.members.get(i);
      if ((type != "update" && m.user == obj.creator) || (type == "update" && m.user == obj.modifier))
         continue;
      if (notify == 1 && m.level >= CONTENTMANAGER)
         recipients.push(m.user.email);
      else if (notify == 2 && m.level >= CONTRIBUTOR)
         recipients.push(m.user.email);
   }
   if (recipients.length > 0) {
      var param = {
         user: obj.modifier ? obj.modifier.name :
            (obj.creator ? obj.creator.name : null),
         url: obj.href()
      };
      var sender = root.sys_title + "<" + root.sys_email + ">";
      var subject = "[" + root.sys_title + "] " + getMessage("mail.notification");
      var body = this.renderSkinAsString("notificationMail", param);
      sendMail(sender, recipients, subject, body);
   }
   return;
};

Site.prototype.getLayout = function() {
   if (this.layout)
      return this.layout;
   return root.getLayout();
};

Site.prototype.getStaticDir = function(subdir) {
   var f = new Helma.File(this.getStaticPath(subdir));
   f.mkdir();
   return f;
};

Site.prototype.getDiskUsage = function() {
   if (this.diskusage == null) {
      this.diskusage = 0;
      for (var i=0; i<this.files.count(); i++)
         this.diskusage += this.files.get(i).filesize;
      for (var i=0; i<this.images.count(); i++) {
         if (this.images.get(i).filesize == null)
            this.images.get(i).filesize = this.images.get(i).getFile().getLength();
         this.diskusage += this.images.get(i).filesize;
      }
   }
   return Math.round(this.diskusage / 1024);
};

/**
 * function returns the disk quota in Kilobyte for this site
 */
Site.prototype.getDiskQuota = function() {
   if (this.trusted || !root.sys_diskQuota) 
      return Infinity;
   else 
      return root.sys_diskQuota;
};

/**
 * returns the corresponding Index object for a site
 * for performance reasons the Index object is cached
 */
Site.prototype.getIndex = function(force) {
   if (!this.cache.index || force) {
      var baseDir = new Helma.File(app.properties.indexPath);
      var index, analyzer;
      if (this.getLocale().getLanguage() == java.util.Locale.GERMAN)
         analyzer = Search.getAnalyzer(java.util.Locale.GERMAN);
      else
         analyzer = Search.getAnalyzer();
      // try to mount an existing index, if this fails create a new one
      try {
         index = Search.mountIndex(this.alias, baseDir, analyzer);
         app.log("[" + this.alias + "] mounted index " + index);
      } catch (e) {
         try {
            index = Search.createIndex(this.alias, baseDir, analyzer);
            app.log("[" + this.alias + "] created index " + index);
         } catch (e) {
            throw ("[" + this.alias + "] Error: unable to mount or create index");
            return;
         }
      }
      this.cache.index = index;
   }
   return this.cache.index;
};

/**
 * re-indexes all stories and comments of a site
 * @param Object instance of Search.Index
 * @return void
 */
Site.prototype.rebuildIndex = function() {
   /**
    * private method for constructing an index document
    * based on the data retrieved via direct db
    */
   function getIndexDocument() {
      var doc = new Search.Document();
      doc.addField("prototype", rows.getColumnItem("TEXT_PROTOTYPE"));
      switch (rows.getColumnItem("TEXT_PROTOTYPE")) {
         case "Comment":
            doc.addField("story", rows.getColumnItem("TEXT_F_TEXT_STORY"), {store: true, index: true, tokenize: false});
            if (parent = rows.getColumnItem("TEXT_F_TEXT_PARENT"))
               doc.addField("parent", parent, {store: true, index: true, tokenize: false});
            break;
         default:
            doc.addField("day", rows.getColumnItem("TEXT_DAY"), {store: true, index: true, tokenize: false});
            if (topic = rows.getColumnItem("TEXT_TOPIC"))
               doc.addField("topic", topic, {store: true, index: true, tokenize: true});
            break;
      }
   
      doc.addField("online", rows.getColumnItem("TEXT_ISONLINE"), {store: true, index: true, tokenize: false});
      doc.addField("site", self._id, {store: true, index: true, tokenize: false});
      doc.addField("id", rows.getColumnItem("TEXT_ID"), {store: true, index: true, tokenize: false});
      var content = Xml.readFromString(rows.getColumnItem("TEXT_CONTENT"));
      for (var propName in content) {
         doc.addField((propName == "title") ? "title" : "text",
                      stripTags(content[propName]),
                      {store: false, index: true, tokenize: true});
      }
      if (creator = rows.getColumnItem("USER_NAME")) {
         doc.addField("creator", creator, {store: false, index: true, tokenize: false});
         doc.addField("createtime", (new Date(rows.getColumnItem("TEXT_CREATETIME").getTime())).format("yyyyMMdd", locale, timeZone),
                      {store: false, index: true, tokenize: false});
      }
      return doc;
   }

   var parent, topic, title, text, creator;
   // lock the index queue to prevent it
   // from being flushed by the IndexManager
   var queue = app.data.indexManager.getQueue(this);
   queue.lock();
   var index = this.getIndex();
   index.clear();

   var buf = new java.util.Vector(500, 500);
   var cnt = 0;
   var now = new Date();
   var start = new Date();
   var locale = this.getLocale();
   var timeZone = this.getTimeZone();
   var dbCon = getDBConnection("antville");
   var rows = dbCon.executeRetrieval("select TEXT_ID, TEXT_PROTOTYPE, TEXT_DAY, TEXT_TOPIC, TEXT_ALIAS, TEXT_F_TEXT_STORY, TEXT_F_TEXT_PARENT, TEXT_PROTOTYPE, TEXT_ISONLINE, TEXT_CONTENT, USER_NAME, TEXT_CREATETIME from AV_TEXT, AV_USER where TEXT_F_SITE = " + this._id + " and TEXT_F_USER_CREATOR = USER_ID");
   app.log("[" + this.alias + "] retrieved indexable contents in " + ((new Date()).diff(now)) + " ms");
   if (dbCon.lastError != null) {
      app.log("[" + this.alias + "] unable to retrieve indexable contents, reason: " + dbCon.lastError);
   } else {
      var self = this;
      while (rows.next()) {
         try {
            buf.add(getIndexDocument());
            if (cnt > 0 && cnt % 2000 == 0) {
               index.addDocument(buf);
               buf.clear();
               app.log("[" + this.alias + "] added " + cnt + " documents to index (last 1000 in " + ((new Date()).diff(now)) + " ms)");
               now = new Date();
            }
         } catch (e) {
            app.log("[" + this.alias + "] Error: unable to add document " + cnt + " to index. Reason: " + e.toString());
         }
         cnt++;
      }
      rows.release();
      index.addDocument(buf);
      app.log("[" + this.alias + "] finished adding " + cnt + " documents to index in " + ((new Date()).diff(start)) + " ms");
      index.optimize();
   }

   // unlock the queue again
   queue.unlock();
   return cnt;
};

/**
 * check if there are any stories in the previous month
 */
Site.prototype.renderLinkToPrevMonth = function(firstDayIndex, currentMonth, monthNames) {
   var l = this.size();
   if (l == 0 || l <= firstDayIndex)
      return "&nbsp;";

   var prevDay = this.get(firstDayIndex + 1);
   if (prevDay && prevDay.groupname < currentMonth) {
      var month = prevDay.groupName.toString().substring(4, 6) - 1;
      return Html.linkAsString({href: prevDay.href()}, monthNames[month]);
   } else {
      return "&nbsp;";
   }
};

/**
 * check if there are any stories in the previous month
 */
Site.prototype.renderLinkToNextMonth = function(lastDayIndex, currentMonth, monthNames) {
   var l = this.size();
   if (l == 0 || lastDayIndex == 0)
      return "&nbsp;";

   var nextDay = this.get(lastDayIndex - 1);
   if (nextDay && nextDay.groupname > currentMonth) {
      var month = nextDay.groupName.toString().substring(4, 6) - 1;
      return Html.linkAsString({href: nextDay.href()}, monthNames[month]);
   } else {
      return "&nbsp;";
   }
};

/**
 * function renders the list of stories for site-(front-)pages
 * and assigns the rendered list to res.data.storylist
 * scrollnavigation-links to previous and next page(s) are also
 * assigned to res.data (res.data.prevpage, res.data.nextpage)
 * using this separate renderFunction instead of doing the stuff
 * in storylist_macro() was necessary for completely independent
 * placement of the prevpage- and nextpage-links
 * @param Int Index-position to start with
 */
Site.prototype.renderStorylist = function(day) {
   var size = this.size();
   var idx = 0;

   // if no day is specified, start with today. we may need 
   // to search for today's entries (or the latest entry 
   // before today) because there may be stories posted for 
   // future days. (HW)
   var startdayString = day;
   if (!startdayString)
      startdayString = formatDate(new Date, "yyyyMMdd");

   var startday = this.get(startdayString);
   if (startday && startday.size()>0) {
      idx = this.contains(startday);
   } else {
      // loop through days until we find a day less or equal than 
      // the one we're looking for.
      for (var i=0; i<size; i++) {
         if (startdayString >= this.get(i).groupname) {
            this.get(i).prefetchChildren();
            idx = i;
            break;
         }
      }
   }
   var days = this.metadata.get("days") ? this.metadata.get("days") : 2;
   days = Math.min (days, 14);  // render 14 days max
   this.prefetchChildren(idx, days);

   // only display "newer stories" if we are actually browsing the archive, 
   // and the day parameter has been explicitly specified, 
   // i.e. suppress the link if we are on the home page and there are 
   // stories on future days. (HW)
   if (idx > 0 && day) {
      var sp = new Object();
      var prev = this.get (Math.max(0, idx-days));
      sp.url = this.href() + "?day=" + prev.groupname;
      sp.text = getMessage("Story.newerStories");
      res.data.prevpage = renderSkinAsString("prevpagelink", sp);
   }
   days = Math.min(idx + days++, this.size());
   res.push();
   while (idx < days) {
      var day = this.get(idx);
      day.get(0).renderSkin("dayheader");
      for (var i=0;i<day.size();i++) {
         day.get(i).renderSkin("preview");
      }
      idx += 1;
   }
   res.data.storylist = res.pop();
   if (idx < size) {
      var sp = new Object();
      var next = this.get (idx);
      sp.url = this.href() + "?day=" + next.groupname;
      sp.text = getMessage("Story.olderStories");
      res.data.nextpage = renderSkinAsString("nextpagelink", sp);
   }
   return;
};

/**
 * permission check (called by hopobject.onRequest())
 * @param String name of action
 * @param Obj User object
 * @param Int Membership level
 * @return Obj Exception object or null
 */
Site.prototype.checkAccess = function(action, usr, level) {
   var url = this.members.href("login");
   try {
      switch (action) {
         case "main" :
            if (!this.online)
               checkIfLoggedIn();
            url = root.href();
            this.checkView(usr, level);
            break;
         case "edit" :
            checkIfLoggedIn();
            url = this.href();
            this.checkEdit(usr, level);
            break;
         case "delete" :
            checkIfLoggedIn();
            url = this.href();
            this.checkDelete(usr, level);
            break;
         case "getfile" :
            if (!this.online)
               checkIfLoggedIn();
            url = root.href();
            this.checkView(usr, level);
            break;
         case "mostread" :
            if (!this.online)
               checkIfLoggedIn();
            url = root.href();
            this.checkView(usr, level);
            break;
         case "referrers" :
            if (!this.online)
               checkIfLoggedIn();
            url = root.href();
            this.checkView(usr, level);
            break;
         case "search" :
            if (!this.online)
               checkIfLoggedIn();
            url = root.href();
            this.checkView(usr, level);
            break;
         case "subscribe" :
            checkIfLoggedIn();
            this.checkSubscribe(usr, level);
            break;
         case "unsubscribe" :
            checkIfLoggedIn();
            this.checkUnsubscribe(usr, level);
            break;
      }
   } catch (deny) {
      res.message = deny.toString();
      res.redirect(url);
   }
   return;
};

/**
 * check if a user is allowed to view a site
 * @param Obj Userobject
 * @param Int Permission-Level
 */
Site.prototype.checkView = function(usr, level) {
   if (!this.online) {
      // if not logged in or not logged in with sufficient permissions
      if (!usr || (level < CONTRIBUTOR && !usr.sysadmin))
         throw new DenyException("siteView");
   }
   return;
};

/**
 * check if user is allowed to edit the preferences of this site
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */
Site.prototype.checkEdit = function(usr, level) {
   if (!usr.sysadmin && (level & MAY_EDIT_PREFS) == 0)
      throw new DenyException("siteEdit");
   return null;
};

/**
 * check if user is allowed to delete the site
 * (only SysAdmins or the creator of a site are allowed to delete it!)
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */
Site.prototype.checkDelete = function(usr) {
   if (!usr.sysadmin && usr != this.creator)
      throw new DenyException("siteDelete");
   return;
};

/**
 * function checks if user is allowed to sign up
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */
Site.prototype.checkSubscribe = function(usr, level) {
   if (level != null)
      throw new Exception("subscriptionExist");
   else if (!this.online)
      throw new DenyException("siteView");
   return;
};

/**
 * check if user is allowed to unsubscribe
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */
Site.prototype.checkUnsubscribe = function(usr, level) {
   if (level == null)
      throw new Exception("subscriptionNoExist");
   else if (level == ADMIN) {
      // Admins are not allowed to remove a subscription
      throw new DenyException("unsubscribe");
   }
   return;
};

Site.prototype.getTags = function(type, group) {
   var handler;
   type = type.toLowerCase();
   switch (type) {
      case "story":
      case "tags":
      handler = this.stories;
      type = "tags";
      break;
      case "image":
      case "galleries":
      handler = this.images;
      type = "galleries";
      break;
   }
   switch (group) {
      case Tags.ALL:
      return handler[type];     
      case Tags.OTHER:
      case Tags.ALPHABETICAL:
      return handler[group + type.titleize()];
      default:
      return handler["alphabetical" + type.titleize()].get(group);
   }
   return null;
};

Site.prototype.getAdminHeader = function(name) {
   switch (name) {
      case "tags":
      case "galleries":
      return ["#", "Name", "Items"];
   }
   return [];
};

Site.ARCHIVE_ONLINE = "online";
Site.ARCHIVE_OFFLINE = "offline";
