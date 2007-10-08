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

defineConstants(Site, "getStatus", "blocked", "regular", "trusted");
defineConstants(Site, "getModes", "closed", "restricted", "public", "open");
defineConstants(Site, "getPageModes", "days", "stories");
defineConstants(Site, "getCommentsModes", "disabled", "enabled");
defineConstants(Site, "getArchiveModes", "closed", "public");

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
      status: user.status,
      mode: Site.CLOSED,
      tagline: "",
      webHookEnabled: false,
      commentsMode: Site.OPEN,
      archiveMode: Site.PUBLIC,
      pageMode: Site.DAYS,
      pageSize: 3,
      language: locale.getLanguage(),
      country: locale.getCountry(),
      timeZone: root.getTimeZone().getID(),
      longDateFormat: LONGDATEFORMAT,
      shortDateFormat: SHORTDATEFORMAT
   });

   return this;
};

Site.prototype.getPermission = function(action) {
   switch (action) {
      case "robots.txt":
      return true;
      case ".":
      case "main":
      case "main.js":
      case "main.css":
      case "rss.xml":
      case "tags":
      return this.status !== Site.BLOCKED &&
            User.require(User.REGULAR) && 
            Site.require(Site.PUBLIC) ||
            Site.require(Site.RESTRICTED) && 
            Membership.require(Membership.SUBSCRIBER) ||
            Site.require(Site.CLOSED) &&
            Membership.require(Membership.OWNER) || 
            User.require(User.PRIVILEGED);
      case "edit":
      case "referrers":
      return this.status !== Site.BLOCKED && 
            User.require(User.REGULAR) && 
            Membership.require(Membership.OWNER) ||
            User.require(User.PRIVILEGED);
      case "subscribe":
      return this.status !== Site.BLOCKED &&
            User.require(User.REGULAR) && 
            Site.require(Site.PUBLIC) &&
            !Membership.require(Membership.SUBSCRIBER);
      case "unsubscribe":
      return User.require(User.REGULAR) && 
            !Membership.require(Membership.OWNER);
   }
   return false;
};

Site.prototype.main_action = function() {
   res.data.body = this.renderSkinAsString("main");
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

Site.prototype.getFormOptions = function(name) {
   var options = [];
   switch (name) {
      case "archiveMode":
      options = Site.getArchiveModes(); break;
      case "commentsMode":
      options = Site.getCommentsModes(); break;
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

Site.prototype.update = function(data) {
   if (this.isTransient()) {
      if (!data.name) {
         throw Error(gettext("Please enter a name for your new site."));
      } else if (data.name.length > 30) {
         throw Error(gettext("Sorry, the name you chose is too long. Please enter a shorter one."));
      } else if (/(\/|\\)/.test(data.name)) {
         throw Error(gettext("Sorry, a site name may not contain any (back)slashes."));
      } else if (data.name !== root.getAccessName(data.name)) {
         throw Error(gettext("Sorry, there is already a site with this name."));
      }
      this.name = data.name;
      this.title = data.title || data.name;
      return;
   }

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
   this.clearCache();
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
         collection = this.stories.all;
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

Site.prototype.referrers_action = function() {
   if (req.postParams.permanent && (User.require(User.PRIVILEGED) ||
         Membership.require(Member.OWNER)))  {
      var urls = req.postParams.permanent_array;
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
   res.data.title = gettext("Referrers in the last 24 hours of {0}", this.title);
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
      case "files":
      case "images":
      case "layouts":
      case "members":
      case "polls":
      case "stories":
      case "tags":
      return this[name];
      default:
      return null;
   }
};

Site.prototype.list_macro = function(param, type) {
   switch (type) {
      case "stories":
      if (this.stories["public"].size() < 1) {
         this.renderSkin("welcome");
         if (session.user) {
            if (session.user === this.creator) {
               this.renderSkin("welcomeowner");
            }
            if (User.require(User.PRIVILEGED)) {
               this.renderSkin("welcomesysadmin");
            }
         }
      } else {
         this.archive.renderSkin("main");
      }
   }
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
   var calendar = new jala.Date.Calendar(this.archive);
   //calendar.setAccessNameFormat("yyyy/MM/dd");
   calendar.setHrefFormat("yyyy/MM/dd/");
   calendar.setLocale(this.getLocale());
   calendar.setTimeZone(this.getTimeZone());
   calendar.render(this.archive.getDate() || new Date);
   return;
};

Site.prototype.age_macro = function(param) {
   if (!this.createtime) {
      this.createtime = new Date;
   }
   //res.write(this.createtime.getAge());
   res.write(Math.floor((new Date() - this.createtime) / Date.ONEDAY));
   return;
};

Site.prototype.history_macro = function(param, type) {
   param.limit = Math.min(param.limit || 10, 20);
   type || (type = param.show);
   var stories = this.stories.recent;
   var size = stories.size();
   var counter = i = 0;
   var item;
   while (counter < param.limit && i < size) {
      if (i % param.limit === 0) {
         stories.prefetchChildren(i, param.limit);
      }
      item = stories.get(i);
      i += 1;
      switch (item.constructor) {
         case Story:
         if (type === "comments") {
            continue;
         }
         break;
         case Comment:
         if (type === "stories" || item.story.mode === Story.PRIVATE ||
               item.story.commentsMode === Story.CLOSED || 
               this.commentsMode === Site.CLOSED) {
            continue;
         }
         break;
      }
      item.renderSkin("Story#history");
      counter += 1;
   }
   return;
};

Site.prototype.referrers_macro = function() {
   var date = new Date;
   date.setDate(date.getDate() - 1);
   var db = getDBConnection("antville");
   var query = "select referrer, count(*) as requests from log " +
      "where action = 'main' and context_type = 'Site' and context_id = " + 
      this._id + " and created > {ts '" + date.format("yyyy-MM-dd HH:mm:ss") + 
      "'} group by referrer order by requests desc, referrer asc;";
   var rows = db.executeRetrieval(query);
   var referrer;
   while (rows.next()) {
      if (!(referrer = rows.getColumnItem("referrer"))) {
         continue;
      }
      this.renderSkin("referrerItem", {
         requests: rows.getColumnItem("requests"),
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
   var str = this.metadata.get("spamfilter");
   if (!str) {
      return;
   }
   var items = str.replace(/\r/g, "").split("\n");
   for (var i in items) {
      res.write('"');
      res.write(items[i]);
      res.write('"');
      if (i < items.length-1) {
         res.write(",");
      }
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
   return this.cache.locale = locale;
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

Site.prototype.getDiskQuota = function() {
   if (this.trusted || !root.sys_diskQuota) 
      return Infinity;
   else 
      return root.sys_diskQuota;
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

Site.prototype.getStaticFile = function(fpath) {
   res.push();
   res.write(app.properties.staticPath);
   res.write(this.name);
   res.write("/");
   fpath && res.write(fpath);
   return new helma.File(res.pop());
};

Site.prototype.getStaticUrl = function(fpath) {
   res.push();
   res.write(app.properties.staticUrl);
   res.write(this.name);
   res.write("/");
   fpath && res.write(fpath);
   return res.pop();
};

Site.prototype.getAdminHeader = function(name) {
   switch (name) {
      case "tags":
      case "galleries":
      return ["#", "Name", "Items"];
   }
   return [];
};

Site.require = function(mode) {
   var modes = [Site.CLOSED, Site.RESTRICTED, Site.PUBLIC, Site.OPEN];
   return modes.indexOf(res.handlers.site.mode) >= modes.indexOf(mode);
};
