/**
 * main action
 */
function main_action() {
   res.data.title = root.getSysTitle();
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
}

/**
 * action for creating a new site
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
   res.data.title = "Create a new weblog";
   res.data.body = this.renderSkinAsString("new");
   root.renderSkin("page");
}

/**
 * action for listing public sites
 */
function list_action() {
   // preparing res.data.sitelist and prev/next links
   // ("all" shows all sites, "yes" is for scrolling)
   this.renderSitelist(25, "all", "yes");
   res.data.title = "Sites of " + root.getSysTitle();
   res.data.body = this.renderSkinAsString("list");
   root.renderSkin("page");
}

/**
 * wrapper to make safejs.skin public
 * (contains js code safe from the user)
 */

function safescripts_action() {
   res.digest();
   res.contentType = "text/javascript";
   var param = new Object();
   // this is needed to enable sites with virtual domain hosting
   // using the colorpicker to circumvent domain-based script security:
   param.cpHost = path.site ? path.site.href() : root.href();
   root.renderSkin("safescripts", param);
   return;
}


/**
 * wrapper to access colorpicker
 */

function colorpicker_action() {
   renderSkin("colorpicker");
   return;
}


/**
 * redirect requests for rss10 to rss
 */

function rss10_action() {
   res.redirect(this.href("rss"));
   return;
}

/**
 * rss action
 */
function rss_action() {
   res.contentType = "text/xml";
   
   var now = new Date();
   var systitle = root.getSysTitle();
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
         param.year = site.lastupdate.getYear();
         items.append(site.renderSkinAsString("rssItem", param));
         resources.append(site.renderSkinAsString("rssResource", param));
      }
   }
   param = new Object();
   param.title = systitle;
   param.email = root.sys_email.entitize();
   param.year = now.getYear();
   param.lastupdate = sdf.format(now);
   param.items = items.toString();
   param.resources = resources.toString();
   this.renderSkin("rss", param);
}

/**
 * action called when a site has been blocked
 */
function blocked_action() {
   res.data.title = root.getSysTitle() + " - 404 - blocked";
   res.data.body = "<p><b>Sorry!</b></p><p>This weblog was disabled.</p>";
   root.renderSkin("page");
}

/**
 * 404 action
 */
function notfound_action() {
   res.data.title = root.getSysTitle() + " - 404 - not found";
   res.data.body = "<p><b>Sorry!</b></p><p>URL /" + req.path + " was not found on this server!</p>";
   (path.site && path.site.online ? path.site : root).renderSkin("page");
}