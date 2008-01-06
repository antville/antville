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

Site.getStatus = defineConstants(Site, "blocked", "regular", "trusted");
Site.getModes = defineConstants(Site, "closed", "restricted", "public", "open");
Site.getPageModes = defineConstants(Site, "days", "stories");
Site.getCommentModes = defineConstants(Site, "disabled", "enabled");
Site.getArchiveModes = defineConstants(Site, "closed", "public");
Site.getNotificationModes = defineConstants(Site, "Nobody", 
      "Owner", "Manager", "Contributor", "Subscriber" );
Site.getWebHookModes = defineConstants(Site, "disabled", "enabled");

this.handleMetadata("archiveMode");
this.handleMetadata("commentMode");
this.handleMetadata("email");
this.handleMetadata("lastUpdate");
this.handleMetadata("locale");
this.handleMetadata("longDateFormat");
this.handleMetadata("notificationMode");
this.handleMetadata("notifiedOfBlocking");
this.handleMetadata("notifiedOfDeletion");
this.handleMetadata("offlineSince");
this.handleMetadata("pageSize");
this.handleMetadata("pageMode");
this.handleMetadata("shortDateFormat");
this.handleMetadata("tagline");
this.handleMetadata("timeZone");
this.handleMetadata("title"),
this.handleMetadata("webHookMode");
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
      status: user.status === User.PRIVILEGED ? Site.TRUSTED : user.status,
      mode: Site.CLOSED,
      tagline: "",
      webHookEnabled: false,
      commentMode: Site.OPEN,
      archiveMode: Site.PUBLIC,
      notificationMode: Site.DISABLED,
      pageMode: Site.DAYS,
      pageSize: 3,
      locale: locale.toString(),
      timeZone: root.getTimeZone().getID(),
      longDateFormat: LONGDATEFORMAT,
      shortDateFormat: SHORTDATEFORMAT
   });

   return this;
};

Site.prototype.getPermission = function(action) {
   switch (action) {
      case "main.js":
      case "main.css":
      case "robots.txt":
      return true;
      case ".":
      case "main":
      case "rss.xml":
      case "rss.xsl":
      case "search":
      case "tags":
      return Site.require(Site.PUBLIC) ||
            (Site.require(Site.RESTRICTED) && 
            Membership.require(Membership.SUBSCRIBER)) ||
            (Site.require(Site.CLOSED) &&
            Membership.require(Membership.OWNER)) || 
            User.require(User.PRIVILEGED);
      case "edit":
      case "referrers":
      return (Membership.require(Membership.OWNER) ||
            User.require(User.PRIVILEGED));
      case "subscribe":
      return Site.require(Site.PUBLIC) &&
            !Membership.require(Membership.SUBSCRIBER);
      case "unsubscribe":
      var membership = this.members.get(session.user.name)
      return User.require(User.REGULAR) && 
            !membership.require(Membership.OWNER);
   }
   return false;
};

Site.prototype.main_action = function() {
   res.data.body = this.renderSkinAsString("Site#main");
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
   res.data.body = this.renderSkinAsString("Site#edit");
   this.renderSkin("page");
   return;
};

Site.prototype.getFormOptions = function(name) {
   switch (name) {
      case "archiveMode":
      return Site.getArchiveModes();
      case "commentMode":
      return Site.getCommentModes();
      case "locale":
      return getLocales();
      case "layout":
      return this.getLayouts();
      case "longDateFormat":
      return getDateFormats("long");
      case "mode":
      return Site.getModes();
      case "notificationMode":
      return Site.getNotificationModes();
      case "pageMode":
      return Site.getPageModes();
      case "status":
      return Site.getStatus();
      case "shortDateFormat":
      return getDateFormats("short");
      case "timeZone":
      return getTimeZones();
      case "webHookMode":
      return Site.getWebHookModes();
      default:
      return HopObject.prototype.getFormOptions.apply(this, arguments);
   }
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
      webHookMode: data.webHookMode || Site.DISABLED,
      pageMode: data.pageMode || Site.DAYS,
      pageSize: parseInt(data.pageSize, 10) || 3,
      commentMode: data.commentMode || Site.DISABLED,
      archiveMode: data.archiveMode || Site.CLOSED,
      notificationMode: data.notificationMode || Site.DISABLED,
      timeZone: data.timeZone,
      longDateFormat: data.longDateFormat,
      shortDateFormat: data.shortDateFormat,
      locale: data.locale,
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
   res.dependsOn(this.modified);
   res.dependsOn(Skin("Site", "values").getSource());
   res.dependsOn(Skin("Site", "stylesheet").getSource());
   res.digest();
   res.contentType = "text/css";
   this.renderSkin("Site#values");
   this.renderSkin("stylesheet");
   return;
};

Site.prototype.main_js_action = function() {
   res.dependsOn(this.modified);
   res.dependsOn(Skin("Site", "javascript").getSource());
   res.digest();
   res.contentType = "text/javascript";
   // FIXME: Find a better way to reliably include jQuery (via script tag?)
   var file = new helma.File(root.getStaticFile("jquery-1.1.3.1.pack.js"));
   res.writeln(file.readAll());
   this.renderSkin("javascript");
   file = new helma.File(root.getStaticFile("antville-1.2.js"));
   res.writeln(file.readAll());
   return;
};

Site.prototype.rss_xml_action = function() {
   res.dependsOn(this.lastUpdate);
   res.digest();
   res.contentType = "text/xml";
   res.write(this.getXml());
   return;
};

Site.prototype.getXml = function() {
   var now = new Date;
   var feed = new rome.SyndFeedImpl();   
   feed.setFeedType("rss_2.0");
   feed.setLink(this.href());
   feed.setTitle(this.title);
   feed.setDescription(this.tagline);
   feed.setLanguage(this.locale.replace("_", "-"));
   feed.setPublishedDate(now);

   /*
   var feedInfo = new rome.FeedInformationImpl();
   var feedModules = new java.util.ArrayList();
   feedModules.add(feedInfo);
   feed.setModules(feedModules);
   //feedInfo.setImage(new java.net.URL(this.getProperty("imageUrl")));
   feedInfo.setSubtitle(this.tagline);
   feedInfo.setSummary(this.description);
   feedInfo.setAuthor(this.creator.name);
   feedInfo.setOwnerName(this.creator.name);
   //feedInfo.setOwnerEmailAddress(this.getProperty("email"));
   */

   var entry, entryInfo, entryModules;
   var enclosure, enclosures, keywords;
   var entries = new java.util.ArrayList();
   var description;

   for each (var story in this.stories.recent.list(0, 25)) {
      entry = new rome.SyndEntryImpl();
      entry.setTitle(story.getTitle());
      entry.setLink(story.href());
      entry.setAuthor(story.creator.name);
      entry.setPublishedDate(story.created);

      description = new rome.SyndContentImpl();
      description.setType("text/plain");
      description.setValue(story.text);
      entry.setDescription(description);
      entries.add(entry);
      
      /*
      entryInfo = new rome.EntryInformationImpl();
      entryModules = new java.util.ArrayList();
      entryModules.add(entryInfo);
      entry.setModules(entryModules);

      enclosure = new rome.SyndEnclosureImpl();
      enclosure.setUrl(episode.getProperty("fileUrl"));
      enclosure.setType(episode.getProperty("contentType"));
      enclosure.setLength(episode.getProperty("filesize") || 0);
      enclosures = new java.util.ArrayList();
      enclosures.add(enclosure);
      entry.setEnclosures(enclosures);

      entryInfo.setAuthor(entry.getAuthor());
      entryInfo.setBlock(false);
      entryInfo.setDuration(new rome.Duration(episode.getProperty("length") || 0));
      entryInfo.setExplicit(false);
      entryInfo.setKeywords(episode.getProperty("keywords"));
      entryInfo.setSubtitle(episode.getProperty("subtitle"));
      entryInfo.setSummary(episode.getProperty("description"));
      */
   }
   feed.setEntries(entries);
   
   var output = new rome.SyndFeedOutput();
   //output.output(feed, res.servletResponse.writer); return;
   var xml = output.outputString(feed);
   return injectXslDeclaration(xml);
};

Site.prototype.rss_xsl_action = function() {
   res.charset = "UTF-8";
   res.contentType = "text/xml";
   renderSkin("Global#xslStylesheet");
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
   var search;
   if (!req.postParams.q || 
         !(search = req.postParams.q = stripTags(req.postParams.q))) {
      res.message = gettext("Please enter a query in the search form.");
   } else {
      var db = getDBConnection("antville");
      var query = 'select id from content where site_id = ' + this._id +
            " and prototype = 'Story' and status <> 'closed' and " +
            " (metadata like '%title:\"%" + search + "%\"%' or " +
            " metadata like '%text:\"%" + search + "%\"%') " +
            " order by created desc limit 25";
      var rows = db.executeRetrieval(query);
      var ref, counter = 0;
      res.push();
      while (rows.next()) {
         ref = Story.getById(rows.getColumnItem("id"));
         ref.renderSkin("Story#preview");
         counter += 1;
      }
      rows.release();
      res.message = ngettext("Found {0} result.", "Found {0} results.", counter);
      res.data.body = res.pop();
   }
   res.data.title = gettext('Search results for "{0}" in site "{1}"', 
         search, this.title);
   this.renderSkin("page");
   return;
};

Site.prototype.subscribe_action = function() {
   var membership = new Membership(session.user, Membership.SUBSCRIBER);
   this.members.add(membership);
   res.message = gettext('You successfully subscribed to the site "{0}".', 
         this.title);
   res.redirect(this.href());
   return;
};

Site.prototype.unsubscribe_action = function() {
   if (req.postParams.proceed) {
      //try {
         Membership.remove(this.members.get(session.user.name));
         res.message = gettext("Successfully unsubscribed the membership.");
         res.redirect(this.href());
      /*} catch (err) {
         res.message = err.toString();
      }*/
   }

   res.data.title = gettext("Remove subscription to {0}", this.title);
   res.data.body = this.renderSkinAsString("HopObject#delete", {
      text: gettext('You are about to remove the subscription to the site "{0}".', 
            this.title)
   });
   this.renderSkin("page");
   return;
};

Site.prototype.robots_txt_action = function() {
   res.contentType = "text/plain";
   this.renderSkin("Site#robots");
   return;
};

Site.prototype.getMacroHandler = function(name) {
   switch (name) {
      case "archive":
      case "files":
      case "images":
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
      if (this.stories.featured.size() < 1) {
         this.renderSkin("Site#welcome");
         if (session.user) {
            if (session.user === this.creator) {
               this.renderSkin("User#welcome");
            }
            if (User.require(User.PRIVILEGED)) {
               this.renderSkin("Admin#welcome");
            }
         }
      } else {
         this.archive.renderSkin("Archive#main");
      }
   }
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
   res.write(Math.floor((new Date() - this.created) / Date.ONEDAY));
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
   var locale;
   if (locale = this.cache.locale) {
      return locale;
   } else if (this.locale) {
      var parts = this.locale.split("_");
      locale = new java.util.Locale(parts[0] || String.EMPTY, 
            parts[1] || String.EMPTY, parts.splice(2).join("_"));
   } else {
      locale = java.util.Locale.getDefault();
   }
   return this.cache.locale = locale;
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

Site.prototype.hitchWebHook = function(ref) {
   ref || (ref = this);
   var now = new Date;
   if (this.webHookMode === Site.ENABLED && this.webHookUrl) {
      if (this.webHookLastUpdate && 
            now - this.webHookLastUpdate < Date.ONEMINUTE) {
         return;
      }
      app.log("Hitching web hook " + this.webHookUrl + " for " + ref);
      var http = helma.Http();
      try {
         http.setTimeout(100);
         http.setReadTimeout(100);
         http.setMethod("POST");
         http.setContent({
            url: ref.href(),
            type: ref.constructor.name,
            id: ref.name || ref._id,
            user: ref.modifier.name,
            date: ref.modified,
            content: ref.toString()
         });
         http.getUrl(this.webHookUrl);
      } catch (ex) {
         app.debug("Hitching web hook " + this.webHookUrl + " failed: " + ex);
      }
      this.webHookLastUpdate = now;
   }
   return;
};

Site.prototype.processHref = function(href) {
   var vhost = app.getProperty("vhost." + this.name, 
         app.properties.defaultHost + "/" + this.name);
   return vhost + href;
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
