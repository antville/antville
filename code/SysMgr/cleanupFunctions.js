/**
 * function determines if it's time to start
 * automatic cleanup
 */

function autoCleanUp() {
   var cleanup = getProperty("enableAutoCleanUp");
   if (cleanup && eval(cleanup)) {
      var startAtHour = parseInt(getProperty("startAtHour"),10);
      var nextCleanup = new Date();
      nextCleanup.setDate(nextCleanup.getDate() + 1);
      nextCleanup.setHours((!isNaN(startAtHour) ? startAtHour : 0),0,0,0);
      // check if it's time to run autocleanup
      if (!app.nextCleanup) {
         app.nextCleanup = nextCleanup;
         this.add (new syslog("system",null,"next cleanup scheduled for " + app.nextCleanup.format("EEEE, dd.MM.yyyy HH:mm"),null));
      } else if (new Date() >= app.nextCleanup) {
         this.syslogs.add (new syslog("system",null,"starting automatic cleanup ...",null));
         app.nextCleanup = nextCleanup;
         // now start the auto-cleanup-functions
         // this.blockPrivateWeblogs();
         // this.deleteInactiveWeblogs();
         this.add (new syslog("system",null,"next cleanup scheduled for " + app.nextCleanup.format("EEEE, dd.MM.yyyy HH:mm"),null));
      }
   }
}


/**
 * function blocks private weblogs that are offline for too long
 * if enabled and configured properly in app.properties
 */

function blockPrivateWeblogs() {
   var enable = getProperty("blockPrivateWeblogs");
   var blockWarnAfter = parseInt(getProperty("blockWarningAfter"),10);
   var blockAfterWarn = parseInt(getProperty("blockAfterWarning"),10);
   if (!enable || !eval(enable)) {
      // blocking of private weblogs is disabled
      return;
   } else if (isNaN(blockWarnAfter) || isNaN(blockAfterWarn)) {
      // something is fishy with blocking properties
      this.syslogs.add (new syslog("system",null,"blocking of private weblogs cancelled - check app.properties",null));
      return;
   }
   var size = this.privateWeblogs.size();
   this.syslogs.add (new syslog("system",null,"checking " + size + " private weblog(s) ...",null));

   // get thresholds in millis
   warnThreshold = blockWarnAfter*1000*60*60*24;
   blockThreshold = blockAfterWarn*1000*60*60*24;

   for (var i=0;i<size;i++) {
      var weblog = this.privateWeblogs.get(i);
      // if weblog is trusted, we do nothing
      if (weblog.isTrusted())
         continue;

      var privateFor = new Date() - weblog.lastoffline;
      var timeSinceWarning = new Date() - weblog.lastblockwarn;
      if (privateFor >= warnThreshold) {
         // check if weblog-admins have been warned already
         var alreadyWarned = false;
         if (weblog.lastblockwarn > weblog.lastoffline)
            alreadyWarned = true;
         // check whether warn admins or block weblog
         if (!alreadyWarned) {
            // admins of weblog haven't been warned about upcoming block, so do it now
            var warning = new Mail;
            var recipient = weblog.email ? weblog.email : weblog.creator.email;
            warning.addTo(recipient);
            warning.setFrom(getProperty("adminEmail"));
            warning.setSubject("Attention! Your weblog \"" + weblog.title + "\" will soon be blocked!");
            var sp = new Object();
            sp.weblog = weblog.alias;
            sp.url = weblog.href();
            sp.privatetime = blockWarnAfter;
            sp.daysleft = blockAfterWarn;
            sp.contact = getProperty("adminEmail");
            warning.addText(this.renderSkinAsString("blockwarnmail",sp));
            warning.send();
            this.syslogs.add (new syslog("weblog",weblog.alias,"weblog is private for more than " + blockWarnAfter + " days, sent warning to " + recipient,null));
            weblog.lastblockwarn = new Date();
         } else if (timeSinceWarning >= blockThreshold) {
            // weblog is offline for too long, so block it
            weblog.blocked = 1;
            this.syslogs.add (new syslog("weblog",weblog.alias,"blocked weblog",null));
         }
      } else
         break;
   }   
   this.syslogs.add (new syslog("system",null,"finished checking for private weblogs",null));
   return true;
}


/**
 * function disposes weblogs that are inactive for too long
 * FUNCTION DISABLED!
 */

function deleteInactiveWeblogs() {
   
   return;

   var enable = getProperty("deleteInactiveWeblogs");
   var delWarnAfter = parseInt(getProperty("deleteWarningAfter"),10);
   var delAfterWarn = parseInt(getProperty("deleteAfterWarning"),10);
   if (!enable || !eval(enable)) {
      // blocking of private weblogs is disabled
      return;
   } else if (isNaN(delWarnAfter) || isNaN(delAfterWarn)) {
      // something is fishy with properties
      this.syslogs.add (new syslog("system",null,"cleanup of weblogs cancelled - check app.properties",null));
      return;
   }
   var size = root.size();
   this.syslogs.add (new syslog("system",null,"checking " + size + " weblogs for inactivity ...",null));

   // get thresholds in millis
   warnThreshold = delWarnAfter*1000*60*60*24;
   delThreshold = delAfterWarn*1000*60*60*24;

   for (var i=size;i>0;i--) {
      var weblog = root.get(i-1);
      // if weblog is trusted, we do nothing
      if (weblog.isTrusted())
         continue;

      var idleFor = new Date() - weblog.lastupdate;
      var timeSinceWarning = new Date() - weblog.lastdelwarn;
      if (idleFor >= warnThreshold) {
         // check if weblog-admins have been warned already
         var alreadyWarned = false;
         if (weblog.lastdelwarn > weblog.lastupdate)
            alreadyWarned = true;
         // check whether warn admins or block weblog
         if (!alreadyWarned) {
            // admins of weblog haven't been warned about upcoming block, so do it now
            var warning = new Mail();
            var recipient = weblog.email ? weblog.email : weblog.creator.email;
            warning.addTo(recipient);
            warning.setFrom(getProperty("adminEmail"));
            warning.setSubject("Attention! Your weblog \"" + weblog.title + "\" will soon be deleted!");
            var sp = new Object();
            sp.weblog = weblog.alias;
            sp.url = weblog.href();
            sp.inactivity = delWarnAfter;
            sp.daysleft = delAfterWarn;
            sp.contact = getProperty("adminEmail");
            warning.addText(this.renderSkinAsString("deletewarnmail",sp));
            warning.send();
            this.syslogs.add (new syslog("weblog",weblog.alias,"weblog was inactive for more than " + delWarnAfter + " days, sent warning to " + recipient,null));
            weblog.lastdelwarn = new Date();
         } else if (timeSinceWarning >= blockThreshold) {
            // weblog is inactive for too long, so delete it
            root.deleteWeblog(weblog);
         }
      } else
         break;
   }   
   this.syslogs.add (new syslog("system",null,"finished checking for inactive weblogs",null));
   return true;
}

