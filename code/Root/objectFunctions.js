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
