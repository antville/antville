/**
 * action to convert all sites that do not use the xml encoded
 * preferences
 */
function convertSites_action() {
   var size = this.size();
   for (var i=0;i<size;i++) {
      var s = this.get(i);
      var prefs = new HopObject();
      prefs.tagline = s.tagline;
      prefs.discussions = s.discussions;
      prefs.usercontrib = s.usercontrib;
      prefs.archive = s.archive;
      prefs.bgcolor = s.bgcolor;
      prefs.textfont = s.textfont;
      prefs.textsize = s.textsize;
      prefs.textcolor = s.textcolor;
      prefs.linkcolor = s.linkcolor;
      prefs.alinkcolor = s.alinkcolor;
      prefs.vlinkcolor = s.vlinkcolor;
      prefs.titlefont = s.titlefont;
      prefs.titlesize = s.titlesize;
      prefs.titlecolor = s.titlecolor;
      prefs.smallfont = s.smallfont;
      prefs.smallsize = s.smallsize;
      prefs.smallcolor = s.smallcolor;
      prefs.days = s.days;
      prefs.language = s.language;
      prefs.country = s.country;
      prefs.timezone = s.timezone;
      prefs.longdateformat = s.longdateformat;
      prefs.shortdateformat = s.shortdateformat;
      s.preferences.setAll(prefs);
      res.writeln("converted " + s.alias);
   }
   app.clearCache();
   return;
}