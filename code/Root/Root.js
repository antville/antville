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

/**
 * main action
 */
function main_action() {
   res.data.title = root.getTitle();
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

   if (res.handlers.site) {
      res.handlers.site.main_action();
   } else {
      res.data.body = root.renderSkinAsString("main");
      root.renderSkin("page");
      logAccess();
   }
   return;
}

/**
 * action for creating a new Site
 */
function new_action() {
   if (req.data.cancel)
      res.redirect(root.href());
   else if (req.data.create) {
      try {
         var result = this.evalNewSite(req.data.title, req.data.alias, session.user);
         res.message = result.toString();
         if (!result.error)
            res.redirect(result.obj.href());
      } catch (err) {
         res.message = err.toString();
      }
   }

   res.data.action = this.href(req.action);
   res.data.title = getMessage("SysMgr.createSiteTitle");
   res.data.body = this.renderSkinAsString("new");
   root.renderSkin("page");
   return;
}

/**
 * action for listing public sites
 */
function list_action() {
   // preparing res.data.sitelist and prev/next links
   // ("all" shows all sites, "yes" is for scrolling)
   this.renderSitelist(25, "all", "yes");
   res.data.title = getMessage("SysMgr.listTitle", {serverTitle: root.getTitle()});
   res.data.body = this.renderSkinAsString("list");
   root.renderSkin("page");
   return;
}

/**
 * wrapper to access colorpicker
 */
function colorpicker_action() {
   if (!req.data.skin)
      req.data.skin = "colorpicker";
   renderSkin(req.data.skin);
   return;
}


/**
 * wrapper for rss action
 */
function rss_xml_action() {
   res.redirect(root.href("rss"));
   return;
}

/**
 * rss action
 */
function rss_action() {
   res.contentType = "text/xml";

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
         param.date = site.preferences.getProperty("tagline") ? "" : param.isodate;
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
}

/**
 * action called when a site has been blocked
 */
function blocked_action() {
   res.data.title = root.getTitle() + " - 404 - blocked";
   res.data.body = root.renderSkinAsString("blocked");
   root.renderSkin("page");
   return;
}

/**
 * 404 action
 */
function notfound_action() {
   res.data.title = root.getTitle() + " - 404 - not found";
   req.data.path = req.path;
   res.data.body = root.renderSkinAsString("notfound");
   (path.Site && path.Site.online ? path.Site : root).renderSkin("page");
   return;
}

/**
 * error action
 */
function sys_error_action() {
   res.data.title = root.getTitle() + " - Error";
   res.data.body = root.renderSkinAsString("sysError");
   res.data.body += "<p>"+res.error+"</p>";
   (path.Site && path.Site.online ? path.Site : root).renderSkin("page");
   return;
}

/**
 * action to render external stylesheet
 */
function main_css_action() {
   res.dependsOn(res.handlers.layout.modifytime);
   res.dependsOn(res.handlers.layout.skins.getSkinSource("Root", "style"));
   res.digest();
   res.contentType = "text/css";
   this.renderSkin("style");
   return;
}

/**
 * action to render external javascript
 */
function main_js_action() {
   res.dependsOn(res.handlers.layout.modifytime);
   res.dependsOn(res.handlers.layout.skins.getSkinSource("Root", "javascript"));
   res.digest();
   res.contentType = "text/javascript";
   root.renderSkin("javascript");
   root.renderSkin("systemscripts");
   return;
}

/**
 * macro rendering loginStatus of user
 * valid params:  -  loginSkin
 *                -  logoutSkin
 */
function loginstatus_macro(param) {
   if (session.user)
      this.members.renderSkin("statusloggedin");
   else if (req.action != "login")
      this.members.renderSkin("statusloggedout");
   return;
}

/**
 * macro renders the number of site (either all or just the public ones)
 */
function sitecounter_macro(param) {
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
}

/**
 * render the system title of this antville installation
 */
function title_macro() {
   res.write(this.getTitle());
   return;
}

/**
 * render the system-url of this antville installation
 */
function url_macro(param) {
   res.write(this.getUrl());
   return;
}

/**
 * render the system manager navigation if user is a system manager
 */
function sysmgrnavigation_macro(param) {
   if (session.user && session.user.sysadmin)
      this.renderSkin("sysmgrnavigation");
   return;
}

/**
 * proxy macro for LayoutMgr.layoutchooser
 */
function layoutchooser_macro(param) {
   if (root.sys_layout)
      param.selected = root.sys_layout.alias;
   root.layouts.layoutchooser_macro(param);
   return;
}

/**
 * evaluating new Site
 */
function evalNewSite(title, alias, creator) {
   // check alias
   if (!alias)
      throw new Exception("siteAliasMissing");
   else if (this.get(alias))
      throw new Exception("siteAliasExisting");
   else if (!alias.isClean())
      throw new Exception("siteAliasNoSpecialChars");
   else if (alias.length > 30)
      throw new Exception("siteAliasTooLong");
   else if (this[alias] || this[alias + "_action"])
      throw new Exception("siteAliasReserved");
   // check if title is missing
   if (!title)
      throw new Exception("siteTitleMissing");
   // create new Site
   var newSite = new Site(title, alias, creator);
   // create an initial layout object that is a child layout
   // of the currently active root layout
   var initLayout = new Layout(newSite, newSite.title, creator);
   initLayout.alias = newSite.alias;
   initLayout.setParentLayout(root.getLayout());
   if (!this.add(newSite))
      throw new Exception("siteCreate");
   newSite.layouts.add(initLayout);
   newSite.layouts.setDefaultLayout(initLayout.alias);
   // add the creator to the admins of the new Site
   newSite.members.add(new Membership(creator, ADMIN));
   root.manage.syslogs.add(new SysLog("site", newSite.alias, "added site", creator));
   return new Message("siteCreate", null, newSite);
}


/**
 * function removes a site completely
 * including stories, comments, members
 * @param Object site to remove
 */
function deleteSite(site) {
   site.deleteAll();
   site.remove();
   // add syslog-entry
   this.manage.syslogs.add(new SysLog("site", site.alias, "removed site", session.user));
   return new Message("siteDelete", site.alias);
}

/**
 *  Search one or more (public) sites. Returns an array containing site-aliases and
 *  story ids of matching items.
 *
 * @param query The unprocessed query string
 * @param sid ID of site in which to search, null searches all
 * @return The result array
 */
function searchSites (query, sid) {
   // result array
   var result = new Array();

   // break up search string
   var unquote = new RegExp("\\\\", "g");
   query = query.replace(unquote, "\\\\");
   unquote = new RegExp("\'", "g");
   query = query.replace(unquote, "\'\'");
   var qarr = query.split(" ");

   // construct query
   var where = "select AV_TEXT.TEXT_ID, AV_SITE.SITE_ALIAS from AV_TEXT, AV_SITE where "+
               "AV_TEXT.TEXT_F_SITE = AV_SITE.SITE_ID and "+
               "AV_TEXT.TEXT_ISONLINE > 0 and ";
   for (var i in qarr) {
      where += "(AV_TEXT.TEXT_RAWCONTENT like '%"+qarr[i].toLowerCase()+"%') "
      if (i < qarr.length-1)
         where += "and ";
   }
   // search only in the specified site
   if (sid)
      where += "and AV_SITE.SITE_ID = "+sid+" ";
   else
      where += "and AV_SITE.SITE_ISONLINE > 0 ";
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
}

/**
 * function checks if language and country were specified
 * for root. if so, it returns the specified Locale-object
 * otherwise it returns the default locale of the JVM
 */
function getLocale() {
   var locale = this.cache.locale;
   if (locale)
       return locale;
   if (this.sys_language)
      locale = new java.util.Locale(this.sys_language, this.sys_country ? this.sys_country : "");
   else
      locale = java.util.Locale.getDefault();
   this.cache.locale = locale;
   return locale;
}

/**
 * function checks if the system title of this antville-installation
 * was defined in setup
 * if not, it returns "Antville"
 */
function getTitle() {
   if (!root.sys_title)
      return "antville";
   return root.sys_title;
}

/**
 * function checks if the system url of this antville-installation
 * was defined in setup and returns it.
 * if not set, root.href() is returned.
 */
function getUrl() {
   if (!root.sys_url)
      return root.href();
   return root.sys_url;
}

/**
 *  href URL postprocessor. If a virtual host mapping is defined
 *  for this site's alias, use it. Otherwise, use normal site URL.
 */
function processHref(href) {
   return app.properties.defaulthost + href;
}

/**
 * function returns the (already cached) TimeZone-Object
 */
function getTimeZone() {
   if (this.cache.timezone)
       return this.cache.timezone;
   if (this.sys_timezone)
       this.cache.timezone = java.util.TimeZone.getTimeZone(this.sys_timezone);
   else
       this.cache.timezone = java.util.TimeZone.getDefault();
   return this.cache.timezone;
}

/**
 * return the root layout
 * if no layout is activated, check if the default
 * layout is existing, otherwise return a transient
 * layout object
 * @return Object layout object
 */
function getLayout() {
   if (!this.sys_layout) {
      // no layout defined, so try to get default
      // layout. if that doesn't exist either
      // return a newly created layout object
      var defLayout = root.layouts.get("default");
      if (!defLayout)
         return new Layout();
      return defLayout;
   }
   return root.sys_layout;
}

/**
 * permission check (called by hopobject.onRequest())
 * @param String name of action
 * @param Obj User object
 * @param Int Membership level
 * @return Obj Exception object or null
 */
function checkAccess(action, usr, level) {
   try {
      switch (action) {
         case "new" :
            checkIfLoggedIn(this.href("new"));
            this.checkAdd(usr, level);
            break;
      }
   } catch (deny) {
      res.message = deny.toString();
      res.redirect(this.href());
   }
   return;
}

/**
 * function checks if user is allowed to create a new Site
 * @param Obj User-Object
 */
function checkAdd(usr) {
   // sysAdmins aren't restricted
   if (session.user.sysadmin)
      return null;

   switch (root.sys_limitNewSites) {
      case 2:
         if (!usr.sysadmin)
            throw new DenyException("siteCreateOnlyAdmins");
      case 1:
         if (!usr.trusted)
            throw new DenyException("siteCreateNotAllowed");
      default:
         if (root.sys_minMemberAge) {
            // check if user has been a registered member for long enough
            var regTime = Math.floor((new Date() - session.user.registered)/ONEDAY);
            if (regTime < root.sys_minMemberAge)
               throw new DenyException("siteCreateMinMemberAge", [regTime, root.sys_minMemberAge]);
         } else if (root.sys_minMemberSince) {
            // check if user has registered before the defined timestamp
            if (session.user.registered > root.sys_minMemberSince)
               throw new DenyException("siteCreateMinMemberSince", formatTimestamp(root.sys_minMemberSince));
         }
         if (usr.sites.count()) {
            // check if user has to wait some more time before creating a new Site
            var lastCreation = Math.floor((new Date() - usr.sites.get(0).createtime)/ONEDAY);
            if (lastCreation < root.sys_waitAfterNewSite)
               throw new DenyException("siteCreateWait", [root.sys_waitAfterNewSite, root.sys_waitAfterNewSite - lastCreation]);
         }
   }
   return;
}

/**
 * this function renders a list of sites
 * but first checks which collection to use
 * @param limit maximum amount of sites to be displayed
 * @param show set this to "all" to display all sites
 * @param scroll set this to "no" to hide prev/back links
 */
function renderSitelist(limit, show, scroll) {
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
}

