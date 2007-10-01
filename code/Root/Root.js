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

defineConstants(Root, "getScopes", markgettext("every site"), 
      markgettext("public sites"), markgettext("trusted sites"), 
      markgettext("no site"));

this.handleMetadata("notificationScope");
this.handleMetadata("quota");
this.handleMetadata("creationScope");
this.handleMetadata("creationDelay");
this.handleMetadata("qualifyingPeriod");
this.handleMetadata("qualifyingDate");
this.handleMetadata("autoCleanupEnabled");
this.handleMetadata("autoCleanupStartTime");
this.handleMetadata("phaseOutPrivateSites");
this.handleMetadata("phaseOutInactiveSites");
this.handleMetadata("phaseOutNotificationPeriod");
this.handleMetadata("phaseOutGracePeriod");

Root.prototype.getChildElement = function(name) {
   return this.sites.get(name) || this[name];
};

Root.prototype.getPermission = function(action) {
   if (action.contains("admin")) {
      return User.require(User.PRIVILEGED);
   }
   switch (action) {
      case "create":
      return this.getCreationPermission();
   }
   return Site.prototype.getPermission.apply(this, arguments);
}

Root.prototype._main_action = function() {
   //log();
   flushLog();
   res.debug(root.admin.log.cache.size());
   return;

/* FIXME: setup routine needs to be rewritten
   // check if this installation is already configured
   // if not, we display the welcome-page as frontpage
   if (!root.sys_issetup) {
      if (!root.users.size()) {
         res.data.body = this.renderSkinAsString("welcome");
         root.renderSkin("page");
         return;
      } else
         res.redirect(this.manage.href("setup"));
   } else if (!root.size())
      res.redirect(this.href("new"));
*/

   res.data.body = root.renderSkinAsString("main");
   root.renderSkin("page");
   return;
};

Root.prototype.getFormOptions = function(name) {
   switch (name) {
      case "notificationScope":
      return Root.getScopes();
      case "creationScope":
      return User.getScopes();
      case "autoCleanupStartTime":
      return Admin.getHours();
      return;
   }
   return Site.prototype.getFormOptions.apply(this, arguments);
};

Root.prototype.error_action = function() {
   res.data.title = root.getTitle() + " - Error";
   res.data.body = root.renderSkinAsString("sysError");
   res.data.body += "<p>"+res.error+"</p>";
   (path.Site && path.Site.online ? path.Site : root).renderSkin("page");
   return;
};

Root.prototype.notfound_action = function() {
   res.data.title = root.title + " - 404 - not found";
   req.data.path = req.path;
   res.data.body = root.renderSkinAsString("notfound");
   (path.Site && path.Site.online ? path.Site : root).renderSkin("page");
   return;
};

Root.prototype.create_action = function() {
   if (!session.user || req.postParams.cancel) {
      res.redirect(root.href());
   }
   
   if (req.postParams.create) {
      try {
         var site = this.addSite(req.postParams);
         res.message = gettext("Successfully created your site.");   
         res.redirect(site.href());
      } catch (ex) {
         res.message = ex;
         app.log(ex);
      }
   }

   res.data.action = this.href(req.action);
   res.data.title = gettext("Create a new site");
   res.data.body = this.renderSkinAsString("new");
   root.renderSkin("page");
   return;
};

Root.prototype.list_action = function() {
   // preparing res.data.sitelist and prev/next links
   // ("all" shows all sites, "yes" is for scrolling)
   this.renderSitelist(25, "all", "yes");
   res.data.title = getMessage("SysMgr.listTitle", {serverTitle: root.getTitle()});
   res.data.body = this.renderSkinAsString("list");
   root.renderSkin("page");
   return;
};

Root.prototype.rss_xml_action = function() {
   var now = new Date();
   var systitle = root.getTitle();
   var sdf = new java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'");
   sdf.setTimeZone(new java.util.SimpleTimeZone(0, "UTC"));

   var size = this.size();
   var max = req.data.max ? parseInt(req.data.max) : 25;
   max = Math.min(max, size, 50);

   var param = new Object();
   var items = new java.lang.StringBuffer();
   var resources = new java.lang.StringBuffer();

   for (var i=0; i<max; i++) {
      var site = this.get(i);
      if (site.online && site.lastupdate) {
         param.title = site.title ? site.title : site.alias;
         param.publisher = systitle;
         param.creator = site.creator.name;
         param.email = "";
         if (site.email)
            param.email = site.email.entitize();
         else if (site.creator.publishemail)
            param.email = site.creator.email.entitize();
         param.isodate = sdf.format(site.lastupdate)
         param.date = site.properties.get("tagline") ? "" : param.isodate;
         param.year = site.lastupdate.getFullYear();
         items.append(site.renderSkinAsString("rssItem", param));
         resources.append(site.renderSkinAsString("rssResource", param));
      }
   }
   param = new Object();
   param.title = systitle;
   param.email = root.sys_email.entitize();
   param.year = now.getFullYear();
   param.lastupdate = sdf.format(now);
   param.items = items.toString();
   param.resources = resources.toString();
   this.renderSkin("rss", param);
   return;
};

Root.prototype.main_css_action = function() {
   res.dependsOn(res.handlers.layout.modifytime);
   res.dependsOn(res.handlers.layout.skins.getSkinSource("Root", "style"));
   res.digest();
   res.contentType = "text/css";
   this.renderSkin("style");
   return;
};

Root.prototype.main_js_action = function() {
   res.dependsOn(res.handlers.layout.modifytime);
   res.dependsOn(res.handlers.layout.skins.getSkinSource("Root", "javascript"));
   res.digest();
   res.contentType = "text/javascript";
   root.renderSkin("javascript");
   root.renderSkin("systemscripts");
   return;
};

Root.prototype.sitecounter_macro = function(param) {
   if (param.count == "all")
      var size = root.size();
   else
      var size = this.publicSites.size();
   if (size == 0)
      res.write(param.no ? param.no : size);
   else if (size == 1)
      res.write(param.one ? param.one : size);
   else
      res.write(size + (param.more ? param.more : ""));
   return;
};

Root.prototype.addSite = function(data) {
   if (!data.name) {
      throw Error(gettext("Please enter a name for your new site."));
   } else if (data.name.length > 30) {
      throw Error(gettext("Sorry, the name you chose is too long. Please enter a shorter one."));
   } else if (/(\/|\\)/.test(data.name)) {
      throw Error(gettext("Sorry, a site name may not contain any (back)slashes."));
   } else if (data.name !== root.getAccessName(data.name)) {
      throw Error(gettext("Sorry, there is already a site with this name."));
   }

   var site = new Site(data.name, data.title);
   this.sites.add(site);
   /* FIXME 
   var layout = new Layout(this, this.title, session.user);
   layout.alias = data.name;
   layout.setParentLayout(root.getLayout());
   site.layouts.add(layout);
   site.layouts.setDefaultLayout(layout.alias); 
   */
   site.members.add(new Membership(session.user, Membership.OWNER));
   logAction(site, "added");
   return site;
};

Root.prototype.getCreationPermission = function() {
   var user;
   if (!(user = session.user)) {
      return false;
   } if (User.require(User.PRIVILEGED)) {
      return true;
   }

   switch (root.creationScope) {
      case User.PRIVILEGEDUSERS:
      return false;
      
      case User.TRUSTEDUSERS:
      return User.require(User.TRUSTED);
      
      default:
      case User.ALLUSERS:
      if (root.qualifyingPeriod) {
         var days = Math.floor((new Date - user.created) / Date.ONEDAY);
         if (days < root.qualifyingPeriod) {
            //throw Error(gettext("Sorry, you have to be a member for at " +
            //      "least {0} days to create a new site.", 
            //      formatDate(root.qualifyingPeriod));
            return false;
         }
      } else if (root.qualifyingDate) {
         if (user.created > root.qualifyingDate) {
            //throw Error(gettext("Sorry, only members who have registered " +
            //      "before {0} are allowed to create a new site.", 
            //      formatDate(root.qualifyingDate));
            return false;
         }
      }
      if (user.sites.count() > 0) {
         var days = Math.floor((new Date - user.sites.get(0).created) /
               Date.ONEDAY);
         if (days < root.creationDelay) {
            //throw Error(gettext("Sorry, you still have to wait {0} days " +
            //      "before you can create another site.", 
            //      root.creationDelay - days));
            return false;
         }
      }
   }
   return true;
};

Root.prototype.searchSites  = function(query, sid) {
   // result array
   var result = new Array();

   // break up search string
   var unquote = new RegExp("\\\\", "g");
   query = query.replace(unquote, "\\\\");
   unquote = new RegExp("\'", "g");
   query = query.replace(unquote, "\'\'");
   var qarr = query.split(" ");

   // construct query
   var where = "select AV_TEXT.TEXT_ID, site.name from AV_TEXT, site "+
               "where AV_TEXT.TEXT_F_SITE = site.id " +
               "and AV_TEXT.TEXT_ISONLINE > 0 and ";
   for (var i in qarr) {
      where += "(AV_TEXT.TEXT_RAWCONTENT like '%" + qarr[i].toLowerCase() + 
            "%') ";
      if (i < qarr.length-1)
         where += "and ";
   }
   // search only in the specified site
   if (sid)
      where += "and site.id = " + sid + " ";
   else
      where += "and site.mode = 'online' ";
   where += "order by AV_TEXT.TEXT_CREATETIME desc";

   var dbcon = getDBConnection ("antville");
   var dbres = dbcon.executeRetrieval(where);
   if (dbres) {
      while (dbres.next()) {
         var item = new Object();
         item.sid = dbres.getColumnItem (1).toString();
         item.sitealias = dbres.getColumnItem (2);
         result[result.length] = item;
      }
   }
   dbres.release();
   return result;
};

Root.prototype.processHref = function(href) {
   return app.properties.defaulthost + href;
};

Root.prototype.renderSitelist = function(limit, show, scroll) {
   if (show && show == "all")
      var collection = root.publicSites;
   else
      var collection = root;

   var size = collection.size();
   if (!size)
      return;

   var idx = parseInt (req.data.start, 10);
   var scroll = (!scroll || scroll == "no" ? false : true);

   if (isNaN(idx) || idx > size-1 || idx < 0)
      idx = 0;
   if (scroll && idx > 0) {
      var sp = new Object();
      sp.url = root.href("list") + "?start=" + Math.max(0, idx-limit);
      sp.text = getMessage("Site.previousPage");
      res.data.prevpage = renderSkinAsString("prevpagelink", sp);
   }

   var cnt = 0;
   collection.prefetchChildren(idx, limit);
   res.push();
   while (cnt < limit && idx < size) {
      var s = collection.get(idx++);
      if (!s.blocked && s.online) {
         s.renderSkin("preview");
         cnt++;
      }
   }
   res.data.sitelist = res.pop();

   if (scroll && idx < size) {
      var sp = new Object();
      sp.url = root.href("list") + "?start=" + idx;
      sp.text = getMessage("Site.nextPage");
      res.data.nextpage = renderSkinAsString("nextpagelink", sp);
   }
   return;
};
