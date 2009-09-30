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

this.handleMetadata("archiveMode");
this.handleMetadata("commentMode");
this.handleMetadata("configured");
this.handleMetadata("locale");
this.handleMetadata("longDateFormat");
this.handleMetadata("notificationMode");
this.handleMetadata("notifiedOfBlocking");
this.handleMetadata("notifiedOfDeletion");
this.handleMetadata("closed");
this.handleMetadata("pageSize");
this.handleMetadata("pageMode");
this.handleMetadata("shortDateFormat");
this.handleMetadata("tagline");
this.handleMetadata("timeZone");
this.handleMetadata("title"),
this.handleMetadata("callbackMode");
this.handleMetadata("callbackUrl");
this.handleMetadata("spamfilter");

Site.getStatus = defineConstants(Site, "blocked", "regular", "trusted");
Site.getModes = defineConstants(Site, "closed", "restricted", "public", "open");
Site.getPageModes = defineConstants(Site, "stories"); //, "days");
Site.getCommentModes = defineConstants(Site, "disabled", "enabled");
Site.getArchiveModes = defineConstants(Site, "closed", "public");
Site.getNotificationModes = defineConstants(Site, "Nobody", 
      "Owner", "Manager", "Contributor", "Subscriber" );
Site.getCallbackModes = defineConstants(Site, "disabled", "enabled");

Site.remove = function(site) {
   HopObject.remove(site.members);
   HopObject.remove(site.stories);
   HopObject.remove(site.images);
   HopObject.remove(site.files)
   site.layout.remove();
   site.remove();
   root.admin.log(site, "Removed site");
   return;
}

Site.getByName = function(name) {
   return root.get(name);
}

Site.require = function(mode) {
   var modes = [Site.CLOSED, Site.RESTRICTED, Site.PUBLIC, Site.OPEN];
   return modes.indexOf(res.handlers.site.mode) >= modes.indexOf(mode);
}

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
      tagline: String.EMPTY,
      callbackEnabled: false,
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
}

Site.prototype.getPermission = function(action) {
   switch (action) {
      case "backup.js":
      case "main.js":
      case "main.css":
      case "error":
      case "notfound":
      case "robots.txt":
      case "search":
      case "search.xml":
      case "user.js":
      return true;

      case ".":
      case "main":
      case "comments.xml":
      case "rss.xml":
      case "rss.xsl":
      case "stories.xml":
      return Site.require(Site.PUBLIC) ||
            (Site.require(Site.RESTRICTED) && 
            Membership.require(Membership.CONTRIBUTOR)) ||
            (Site.require(Site.CLOSED) &&
            Membership.require(Membership.OWNER)) ||
            User.require(User.PRIVILEGED);

      case "edit":
      case "export":
      case "referrers":
      return Membership.require(Membership.OWNER) ||
            User.require(User.PRIVILEGED);

      case "subscribe":
      return Site.require(Site.PUBLIC) &&
            !Membership.require(Membership.SUBSCRIBER);

      case "unsubscribe":
      if (Membership.require(Membership.SUBSCRIBER)) {
         var membership = Membership.getByName(session.user.name);
         return User.require(User.REGULAR) && membership && 
               !membership.require(Membership.OWNER);
      }
   }
   return false;
}

Site.prototype.main_action = function() {
   res.data.body = this.renderSkinAsString("Site#main");
   res.data.title = this.title;
   this.renderSkin("Site#page");
   this.log();
   return;
}

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
   res.data.body = this.renderSkinAsString("$Site#edit");
   this.renderSkin("Site#page");
   return;
}

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
      case "callbackMode":
      return Site.getCallbackModes();
      default:
      return HopObject.prototype.getFormOptions.apply(this, arguments);
   }
}

Site.prototype.update = function(data) {
   if (this.isTransient()) {
      if (!data.name) {
         throw Error(gettext("Please enter a name for your new site."));
      } else if (data.name.length > 30) {
         throw Error(gettext("The chosen name is too long. Please enter a shorter one."));
      } else if (/(\/|\\)/.test(data.name)) {
         throw Error(gettext("A site name may not contain any (back)slashes."));
      } else if (data.name !== root.getAccessName(data.name)) {
         throw Error(gettext("There already is a site with this name."));
      }
      this.layout = new Layout(this);
      this.name = data.name;
      this.title = data.title || data.name;
      return;
   }

   this.map({
      title: stripTags(data.title) || this.name,
      tagline: data.tagline,
      mode: data.mode || Site.PRIVATE,
      callbackUrl: data.callbackUrl,
      callbackMode: data.callbackMode || Site.DISABLED,
      pageMode: data.pageMode || Site.DAYS,
      pageSize: parseInt(data.pageSize, 10) || this.pageSize || 3,
      commentMode: data.commentMode || Site.DISABLED,
      archiveMode: data.archiveMode || Site.CLOSED,
      notificationMode: data.notificationMode || Site.DISABLED,
      timeZone: data.timeZone,
      longDateFormat: data.longDateFormat,
      shortDateFormat: data.shortDateFormat,
      locale: data.locale,
      spamfilter: data.spamfilter
   });

   this.configured = new Date;
   this.modifier = session.user;
   this.clearCache();
   return;
}

Site.prototype.main_css_action = function() {
   res.dependsOn(this.modified);
   res.dependsOn(Skin("Site", "values").getSource());
   res.dependsOn(Skin("Site", "stylesheet").getSource());
   res.digest();
   res.contentType = "text/css";
   this.renderSkin("Site#stylesheet");
   return;
}

Site.prototype.main_js_action = function() {
   res.contentType = "text/javascript";
   for each (script in ["jquery-1.2.3.min.js", "antville-1.2.js"]) {
      this.renderSkin("$Site#include", {href: root.getStaticUrl(script)});
   }
   this.renderSkin("$Site#include", {href: this.href("user.js")});
   return;
}

Site.prototype.user_js_action = function() {
   res.contentType = "text/javascript";
   res.dependsOn(this.modified);
   res.dependsOn(Skin("Site", "javascript").getSource());
   res.digest();
   this.renderSkin("Site#javascript");
   return;  
}

Site.prototype.backup_js_action = function() {
   if (req.isPost()) {
      session.data.backup = {};
      for (var key in req.postParams) {
         session.data.backup[key] = req.postParams[key];
      }
   }
   return;
}

Site.prototype.rss_xml_action = function() {
   res.dependsOn(this.modified);
   res.digest();
   res.contentType = "text/xml";
   res.write(this.getXml(this.stories.union));
   return;
}

Site.prototype.stories_xml_action = function() {
   res.dependsOn(this.modified);
   res.digest();
   res.contentType = "text/xml";
   res.write(this.getXml(this.stories.recent));
   return;
}

Site.prototype.comments_xml_action = function() {
   res.dependsOn(this.modified);
   res.digest();
   res.contentType = "text/xml";
   res.write(this.getXml(this.stories.comments));
   return;
}

Site.prototype.search_xml_action = function() {
   return; // FIXME
   res.contentType = "application/opensearchdescription+xml";
   res.write(<OpenSearchDescription xmlns="http://antville.org/">
      	<ShortName>Antville Search</ShortName>
      	<Description>Search on Antville</Description>
      	<Tags>antville search</Tags>
      	<Image height="16" width="16" type="image/vnd.microsoft.icon">http://www.youtube.com/favicon.ico</Image>
      	<Url type="text/html" template="http://antville.org/search?q={searchTerms}" />
      	<Query role="example" searchTerms="cat" />
         </OpenSearchDescription>);
   return;   
}

Site.prototype.getXml = function(collection) {
   collection || (collection = this.stories.recent);
   var now = new Date;
   var feed = new rome.SyndFeedImpl();   
   feed.setFeedType("rss_2.0");
   feed.setLink(this.href());
   feed.setTitle(this.title);
   feed.setDescription(this.tagline || String.EMPTY);
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

   var list = collection.constructor === Array ? 
         collection : collection.list(0, 25);
   for each (var item in list) {
      entry = new rome.SyndEntryImpl();
      item.title && entry.setTitle(item.title);
      entry.setLink(item.href());
      entry.setAuthor(item.creator.name);
      entry.setPublishedDate(item.created);
      if (item.text) {
         // FIXME: Work-around for "story" handlers in comment skins
         // (Obsolete as soon as "story" handlers are replaced with "this")
         //res.handlers.story = item;
         description = new rome.SyndContentImpl();
         //description.setType("text/plain");
         description.setValue(item.renderSkinAsString("Story#rss"));
         entry.setDescription(description);
      }
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
   // FIXME: Ugly hack for adding PubSubHubbub and rssCloud elements to XML
   xml = xml.replace("<rss", '<rss xmlns:atom="http://www.w3.org/2005/Atom"');
   xml = xml.replace("<channel>", '<channel>\n    <cloud domain="rpc.rsscloud.org" port="5337" path="/rsscloud/pleaseNotify" registerProcedure="" protocol="http-post" />');
   xml = xml.replace("<channel>", '<channel>\n    <atom:link rel="hub" href="' + getProperty("parss.hub") + '"/>'); 
   return xml; //injectXslDeclaration(xml);
}

Site.prototype.rss_xsl_action = function() {
   res.charset = "UTF-8";
   res.contentType = "text/xml";
   renderSkin("Global#xslStylesheet");
   return;
}

Site.prototype.referrers_action = function() {
   if (req.data.permanent && this.getPermission("edit"))  {
      var urls = req.data.permanent_array;
      res.write(this.metadata.get("spamfilter"));
      for (var i in urls) {
         res.write("\n");
         res.write(urls[i].replace(/\?/g, "\\\\?"));
      }
      this.metadata.set("spamfilter", res.pop());
      res.redirect(this.href(req.action));
      return;
   }
   res.data.action = this.href(req.action);
   res.data.title = gettext("Referrers in the last 24 hours of {0}", this.title);
   res.data.body = this.renderSkinAsString("$Site#referrers");
   this.renderSkin("Site#page");
   return;
}

Site.prototype.search_action = function() {
   var search;
   if (!(search = req.data.q) || !stripTags(search)) {
      res.message = gettext("Please enter a query in the search form.");
      res.data.body = this.renderSkinAsString("Site#search");
   } else {
      // Prepare search string for metadata: Get source and remove 
      // '(new String("..."))' wrapper; finally, double all backslashes
      search = String(search).toSource().slice(13, -3).replace(/(\\)/g, "$1$1");
      var title = '%title:"%' + search + '%"%';
      var text = '%text:"%' + search + '%"%';
      var sql = new Sql();
      sql.retrieve("select id from content where site_id = $0 and " +
            "prototype = $1 and status <> $2 and (metadata like $3 or " +
            "metadata like $4) order by created desc limit $5", 
            this._id, "Story", Story.CLOSED, text, title, 25);
      res.push();
      var counter = 0;
      sql.traverse(function() {
         var story = Story.getById(this.id);
         story.renderSkin("Story#result");
         counter += 1;
      });
      res.message = ngettext("Found {0} result.", 
            "Found {0} results.", counter);
      res.data.body = res.pop();
   }
   
   res.data.title = gettext('Search results for "{0}" in site "{1}"', 
         search, this.title);
   this.renderSkin("Site#page");
   return;
}

Site.prototype.subscribe_action = function() {
   try {
      var membership = new Membership(session.user, Membership.SUBSCRIBER);
      this.members.add(membership);
      res.message = gettext('Successfully subscribed to site {0}.', 
            this.title);
   } catch (ex) {
      app.log(ex);
      res.message = ex.toString();
   }
   res.redirect(this.href());
   return;
}

Site.prototype.unsubscribe_action = function() {
   if (req.postParams.proceed) {
      try {
         Membership.remove(Membership.getByName(session.user.name));
         res.message = gettext("Successfully unsubscribed from site {0}.",
               this.title);
         res.redirect(User.getLocation() || this.href());
      } catch (ex) {
         app.log(ex)
         res.message = ex.toString();
      }
   }

   User.setLocation();
   res.data.title = gettext("Remove subscription to {0}", this.title);
   res.data.body = this.renderSkinAsString("$HopObject#confirm", {
      text: gettext('You are about to unsubscribe from site {0}.', this.title)
   });
   this.renderSkin("Site#page");
   return;
}

Site.prototype.export_action = function() {
   var fname = this.name + "-export.zip";
   var zip = new helma.File(this.getStaticFile(fname));
   if (req.postParams.submit === "export") {
      if (Exporter.add(this)) {
         res.message = "Site is queued for export";
         zip.remove();
      } else {
         res.message = "Site is already being exported";
      }
      res.redirect(this.href(req.action));
   }
   var param = {
      fileName: zip.getName(),
      fileUrl: zip.exists() ? this.getStaticUrl(zip.getName()) : null,
      fileDate: new Date(zip.lastModified())
   }
   res.data.body = this.renderSkinAsString("$Site#export", param);
   this.renderSkin("Site#page");
   return;
}

Site.prototype.robots_txt_ction = function() {
   res.contentType = "text/plain";
   this.renderSkin("Site#robots");
   return;
}

Site.prototype.getMacroHandler = function(name) {
   switch (name) {
      case "archive":
      case "files":
      case "galleries":
      case "images":
      case "layout":
      case "members":
      case "polls":
      case "stories":
      case "tags":
      return this[name];
      default:
      return null;
   }
}

Site.prototype.stories_macro = function() {
   if (this.stories.featured.size() < 1) {
      this.renderSkin("Site#welcome");
      if (session.user) {
         if (session.user === this.creator) {
            session.user.renderSkin("$User#welcome");
         }
         if (this === root && User.require(User.PRIVILEGED)) {
            this.admin.renderSkin("$Admin#welcome");
         }
      }
   } else {
      this.archive.renderSkin("Archive#main");
   }
   return;
}

Site.prototype.calendar_macro = function(param) {
   if (this.archiveMode !== Site.PUBLIC) {
      return;
   }
   var calendar = new jala.Date.Calendar(this.archive);
   //calendar.setAccessNameFormat("yyyy/MM/dd");
   calendar.setHrefFormat("/yyyy/MM/dd/");
   calendar.setLocale(this.getLocale());
   calendar.setTimeZone(this.getTimeZone());
   calendar.render(this.archive.getDate());
   return;
}

Site.prototype.age_macro = function(param) {
   res.write(Math.floor((new Date() - this.created) / Date.ONEDAY));
   return;
}

Site.prototype.referrers_macro = function() {
   var self = this;
   var sql = new Sql();
   sql.retrieve("select referrer, count(*) as requests from " +
         "log where context_type = 'Site' and context_id = $0 and action = " +
         "'main' and created > date_add(now(), interval -1 day) group " +
         "by referrer order by requests desc, referrer asc", this._id);
   sql.traverse(function() {
      if (this.requests && this.referrer) {
         this.text = encode(this.referrer.head(50));
         this.referrer = encode(this.referrer);
         self.renderSkin("$Site#referrer", this);
      }
   });
   return;
}

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
}

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
}

Site.prototype.processHref = function(href) {
   var vhost = getProperty("vhost." + this.name, 
         app.properties.defaultHost + "/" + this.name);
   return vhost + href;
}

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
}

Site.prototype.getStaticFile = function(tail) {
   res.push();
   res.write(app.properties.staticPath);
   res.write(this.name);
   res.write("/");
   tail && res.write(tail);
   return new helma.File(res.pop());
}

Site.prototype.getStaticUrl = function(tail) {
   res.push();
   res.write(app.properties.staticUrl);
   res.write(this.name);
   res.write("/");
   tail && res.write(tail);
   return encodeURI(res.pop());
}

Site.prototype.callback = function(ref) {
    if (this.callbackMode === Site.ENABLED && this.callbackUrl) {
      app.data.callbacks.push({
         site: this._id,
         handler: ref.constructor,
         id: ref._id
      });
   }
   return;
}

Site.prototype.getAdminHeader = function(name) {
   switch (name) {
      case "tags":
      case "galleries":
      return ["#", "Name", "Items"];
   }
   return [];
}
