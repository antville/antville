/**
 * function determines if it's time to start
 * automatic cleanup
 */

function autoCleanUp() {
   if (root.sys_enableAutoCleanup) {
      var startAtHour = root.sys_startAtHour;
      var nextCleanup = new Date();
      nextCleanup.setDate(nextCleanup.getDate() + 1);
      nextCleanup.setHours((!isNaN(startAtHour) ? startAtHour : 0),0,0,0);
      // check if it's time to run autocleanup
      if (!app.data.nextCleanup) {
         app.data.nextCleanup = nextCleanup;
         this.add (new syslog("system",null,"next cleanup scheduled for " + app.data.nextCleanup.format("EEEE, dd.MM.yyyy HH:mm"),null));
      } else if (new Date() >= app.data.nextCleanup) {
         this.syslogs.add (new syslog("system",null,"starting automatic cleanup ...",null));
         app.data.nextCleanup = nextCleanup;
         // now start the auto-cleanup-functions
         this.cleanupAccesslog();
         this.blockPrivateSites();
         // this.deleteInactiveSites();
         this.add (new syslog("system",null,"next cleanup scheduled for " + app.data.nextCleanup.format("EEEE, dd.MM.yyyy HH:mm"),null));
      }
   }
}


/**
 * function blocks private sites that are offline for too long
 * if enabled and configured properly in app.properties
 */

function blockPrivateSites() {
   var enable = root.sys_blockPrivateSites;
   var blockWarningAfter = root.sys_blockWarningAfter;
   var blockAfterWarning = root.sys_blockAfterWarning;
   if (!enable) {
      // blocking of private sites is disabled
      return;
   } else if (!blockWarningAfter || !blockAfterWarning) {
      // something is fishy with blocking properties
      this.syslogs.add (new syslog("system",null,"blocking of private sites cancelled",null));
      return;
   }
   var size = this.privateSites.size();
   this.syslogs.add (new syslog("system",null,"checking " + size + " private site(s) ...",null));

   // get thresholds in millis
   warnThreshold = blockWarningAfter*1000*60*60*24;
   blockThreshold = blockAfterWarning*1000*60*60*24;

   for (var i=0;i<size;i++) {
      var site = this.privateSites.get(i);
      // if site is trusted, we do nothing
      if (site.isTrusted())
         continue;

      var privateFor = new Date() - site.lastoffline;
      var timeSinceWarning = new Date() - site.lastblockwarn;
      if (privateFor >= warnThreshold) {
         // check if site-admins have been warned already
         var alreadyWarned = false;
         if (site.lastblockwarn > site.lastoffline)
            alreadyWarned = true;
         // check whether warn admins or block site
         if (!alreadyWarned) {
            // admins of site haven't been warned about upcoming block, so do it now
            var warning = new Mail;
            var recipient = site.email ? site.email : site.creator.email;
            warning.addTo(recipient);
            warning.setFrom(root.sys_email);
            warning.setSubject(getMsg("mailsubject","blockWarning",site.title));
            var sp = new Object();
            sp.site = site.alias;
            sp.url = site.href();
            sp.privatetime = blockWarningAfter;
            sp.daysleft = blockAfterWarning;
            sp.contact = root.sys_email;
            warning.addText(this.renderSkinAsString("blockwarnmail",sp));
            warning.send();
            this.syslogs.add (new syslog("site",site.alias,"site is private for more than " + blockWarningAfter + " days, sent warning to " + recipient,null));
            site.lastblockwarn = new Date();
         } else if (timeSinceWarning >= blockThreshold) {
            // site is offline for too long, so block it
            site.blocked = 1;
            this.syslogs.add (new syslog("site",site.alias,"blocked site",null));
         }
      } else
         break;
   }   
   this.syslogs.add (new syslog("system",null,"finished checking for private sites",null));
   return true;
}


/**
 * function disposes sites that are inactive for too long
 * FUNCTION DISABLED!
 */

function deleteInactiveSites() {
   
   return;

   var enable = root.sys_deleteInactiveSites;
   var delWarningAfter = root.sys_deleteWarningAfter;
   var delAfterWarning = root.sys_deleteAfterWarning;
   if (!enable) {
      // blocking of private sites is disabled
      return;
   } else if (!delWarningAfter || !delAfterWarning) {
      // something is fishy with properties
      this.syslogs.add (new syslog("system",null,"cleanup of sites cancelled",null));
      return;
   }
   var size = root.size();
   this.syslogs.add (new syslog("system",null,"checking " + size + " sites for inactivity ...",null));

   // get thresholds in millis
   warnThreshold = delWarningAfter*1000*60*60*24;
   delThreshold = delAfterWarning*1000*60*60*24;

   for (var i=size;i>0;i--) {
      var site = root.get(i-1);
      // if site is trusted, we do nothing
      if (site.isTrusted())
         continue;

      var idleFor = new Date() - site.lastupdate;
      var timeSinceWarning = new Date() - site.lastdelwarn;
      if (idleFor >= warnThreshold) {
         // check if site-admins have been warned already
         var alreadyWarned = false;
         if (site.lastdelwarn > site.lastupdate)
            alreadyWarned = true;
         // check whether warn admins or block site
         if (!alreadyWarned) {
            // admins of site haven't been warned about upcoming block, so do it now
            var warning = new Mail();
            var recipient = site.email ? site.email : site.creator.email;
            warning.addTo(recipient);
            warning.setFrom(root.sys_email);
            warning.setSubject(getMsg("mailsubject","deleteWarning",site.title));
            var sp = new Object();
            sp.site = site.alias;
            sp.url = site.href();
            sp.inactivity = delWarningAfter;
            sp.daysleft = delAfterWarning;
            sp.contact = root.sys_email;
            warning.addText(this.renderSkinAsString("deletewarnmail",sp));
            warning.send();
            this.syslogs.add (new syslog("site",site.alias,"site was inactive for more than " + delWarningAfter + " days, sent warning to " + recipient,null));
            site.lastdelwarn = new Date();
         } else if (timeSinceWarning >= blockThreshold) {
            // site is inactive for too long, so delete it
            root.deleteSite(site);
         }
      } else
         break;
   }   
   this.syslogs.add (new syslog("system",null,"finished checking for inactive sites",null));
   return true;
}


/**
 * function deletes all accesslog-records older than 48 hours
 * and with story-id = null
 */
function cleanupAccesslog() {
	var dbConn = getDBConnection("antville");
	var dbError = dbConn.getLastError();
	if (dbError) {
      this.syslogs.add (new syslog("system",null,"failed to clean up accesslog-table!",null));
      return;
   }
   var threshold = new Date();
   threshold.setDate(threshold.getDate() -2);
	var query = "delete from AV_ACCESSLOG where ACCESSLOG_F_TEXT is null and ACCESSLOG_DATE < '" + threshold.format("yyyy-MM-dd HH:mm:ss") + "'";
   var delRows = dbConn.executeCommand(query);
   if (delRows)
      this.syslogs.add (new syslog("system",null,"removed " + delRows + " records from accesslog-table",null));
   return;
}
