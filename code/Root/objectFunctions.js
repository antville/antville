/**
 * evaluating new site
 */

function evalSite(title,alias,creator) {
   var result;
   if (!alias)
      result = getError("siteAliasMissing");
   else if (this.get(alias))
      result = getError("siteAliasExisting");
   else if (!isClean(alias))
      result = getError("siteAliasNoSpecialChars");
   else {
      // check if alias is similar to an action-name (which is reserved)
      if (this[alias] || this[alias + "_action"])
         result = getError("siteAliasReserved");
   }
   if (!title)
      result = getError("siteTitleMissing");
   if (!result) {
      var newSite = this.createNewSite(title,alias,creator);
      if (!newSite)
         result = getError("siteCreate");
      else {
         result = getConfirm("siteCreate");
         result.site = newSite;
      }
   }
   return (result);
}


/**
 * create a new site
 */

function createNewSite(title,alias,creator) {
   var newSite = new site();
   newSite.title = title;
   newSite.alias = alias;
   newSite.creator = creator;
   newSite.createtime = newSite.lastoffline = new Date();
   newSite.email = creator.email;
   newSite.online = 0;
   newSite.discussions = 1;
   newSite.usercontrib = 0;
   newSite.usersignup = 1;
   newSite.archive = 1;
   newSite.blocked = 0;
   newSite.trusted = (creator.isTrusted() ? 1 : 0);
   newSite.bgcolor = "ffffff";
   newSite.textfont = "Verdana, Helvetica, Arial, sans-serif";
   newSite.textsize = "13px";
   newSite.textcolor = "000000";
   newSite.linkcolor = "ff3300";
   newSite.alinkcolor = "ff0000";
   newSite.vlinkcolor = "ff3300";
   newSite.titlefont = "Verdana, Helvetica, Arial, sans-serif";
   newSite.titlesize = "15px";
   newSite.titlecolor = "cc0000";
   newSite.smallfont = "Arial, Helvetica, sans-serif";
   newSite.smallsize = "12px";
   newSite.smallcolor = "666666";
   newSite.days = 3;
   // retrieve locale-object from root (either specified or default-locale from JVM)
   var loc = this.getLocale();
   newSite.language = loc.getLanguage();
   newSite.country = loc.getCountry();
   newSite.longdateformat = "EEEE, dd. MMMM yyyy, h:mm a";
   newSite.shortdateformat = "yyyy.MM.dd, HH:mm";
   newSite.enableping = 0;
   newSite.createImgDirectory()
   if (this.add(newSite)) {
      // create membership-object for connecting user <-> site with admin-rights
      newSite.members.addMembership(creator,getAdminLvl());
      return (newSite);
   } else
      return null;
}

/**
 * function removes a site completely
 * including stories, comments, members
 * @param Object site to remove
 */

function deleteSite(site) {
   site.deleteAll();
   this.remove(site);
   // add syslog-entry
   this.manage.syslogs.add(new syslog("site",site.alias,"removed site",session.user));
   return (getConfirm("siteDelete",site.alias));
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

    // reuse search result container if it already exists
    var result = result = new Array();

    // break up search string
    var unquote = new RegExp("\'");
    unquote.global = true;
    var qarr = query.replace(unquote, "''").split(" ");

    // construct query
    var where = "select AV_TEXT.TEXT_ID, AV_SITE.SITE_ALIAS from AV_TEXT, AV_SITE where "+
                "AV_TEXT.TEXT_F_SITE = AV_SITE.SITE_ID and "+
                "AV_TEXT.TEXT_ISONLINE > 0 and AV_SITE.SITE_ISONLINE > 0 and ";
    for (var i in qarr) {
        // where += "(LOWER(AV_TEXT.TEXT_TITLE) like '%"+qarr[i].toLowerCase()+
        //          "%' or LOWER(AV_TEXT.TEXT_TEXT) like '%"+qarr[i].toLowerCase()+"%') "
        where += "(AV_TEXT.TEXT_RAWCONTENT like '%"+qarr[i].toLowerCase()+"%') "
        if (i < qarr.length-1)
            where += "and ";
    }
    // search only in the specified site
    if (sid)
        where += "and AV_SITE.SITE_ID = "+sid+" ";
    where += "order by AV_TEXT.TEXT_CREATETIME desc";
    // writeln (where);
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
      locale = new java.util.Locale(this.sys_language,this.sys_country ? this.sys_country : "");
   else
      locale = java.util.Locale.getDefault();
   this.cache.locale =locale;
   return locale;
}

/**
 * function checks if the system title of this antville-installation
 * was defined in setup
 * if not, it returns "Antville"
 */

function getSysTitle() {
   if (!root.sys_title)
      return ("Antville");
   return (root.sys_title);
}

/**
 * function checks if the system url of this antville-installation
 * was defined in setup
 * if not, it returns "http://www.antville.org"
 */

function getSysUrl() {
   if (!root.sys_url)
      return ("http://www.antville.org");
   return (root.sys_url);
}
