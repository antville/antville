/**
 * action to convert the preferences of all sites
 * to the new xml encoded version
 */
function convertSites_action() {
   var dbCon = getDBConnection("antville");
   var query = "select SITE_ALIAS, SITE_TAGLINE, SITE_BGCOLOR, SITE_TEXTFONT, SITE_TEXTCOLOR, SITE_TEXTSIZE, SITE_LINKCOLOR, SITE_ALINKCOLOR, SITE_VLINKCOLOR, SITE_TITLEFONT, SITE_TITLECOLOR, SITE_TITLESIZE, SITE_SMALLFONT, SITE_SMALLCOLOR, SITE_SMALLSIZE, SITE_HASDISCUSSIONS, SITE_USERMAYCONTRIB, SITE_SHOWDAYS, SITE_SHOWARCHIVE, SITE_LANGUAGE, SITE_COUNTRY, SITE_TIMEZONE, SITE_LONGDATEFORMAT, SITE_SHORTDATEFORMAT from AV_SITE";
   var sites = dbCon.executeRetrieval(query);
   while (sites.next()) {
      var s = root.get(sites.getColumnItem("SITE_ALIAS"));
      res.write("converting site '" + s.alias + "' ...");
      var prefs = new HopObject();
      prefs.tagline = sites.getColumnItem("SITE_TAGLINE");
      prefs.bgcolor = sites.getColumnItem("SITE_BGCOLOR");
      prefs.textfont = sites.getColumnItem("SITE_TEXTFONT");
      prefs.textcolor = sites.getColumnItem("SITE_TEXTCOLOR");
      prefs.textsize = sites.getColumnItem("SITE_TEXTSIZE");
      prefs.linkcolor = sites.getColumnItem("SITE_LINKCOLOR");
      prefs.alinkcolor = sites.getColumnItem("SITE_ALINKCOLOR");
      prefs.vlinkcolor = sites.getColumnItem("SITE_VLINKCOLOR");
      prefs.titlefont = sites.getColumnItem("SITE_TITLEFONT");
      prefs.titlesize = sites.getColumnItem("SITE_TITLESIZE");
      prefs.titlecolor = sites.getColumnItem("SITE_TITLECOLOR");
      prefs.smallfont = sites.getColumnItem("SITE_SMALLFONT");
      prefs.smallsize = sites.getColumnItem("SITE_SMALLSIZE");
      prefs.smallcolor = sites.getColumnItem("SITE_SMALLCOLOR");
      prefs.discussions = sites.getColumnItem("SITE_HASDISCUSSIONS");
      prefs.usercontrib = sites.getColumnItem("SITE_USERMAYCONTRIB");
      prefs.archive = sites.getColumnItem("SITE_SHOWARCHIVE");
      prefs.days = sites.getColumnItem("SITE_SHOWDAYS");
      prefs.language = sites.getColumnItem("SITE_LANGUAGE");
      prefs.country = sites.getColumnItem("SITE_COUNTRY");
      prefs.timezone = sites.getColumnItem("SITE_TIMEZONE");
      prefs.longdateformat = sites.getColumnItem("SITE_LONGDATEFORMAT");
      prefs.shortdateformat = sites.getColumnItem("SITE_SHORTDATEFORMAT");
      s.preferences.setAll(prefs);
      res.writeln(" done");
   }
   sites.release();
}