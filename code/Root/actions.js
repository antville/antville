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
   res.data.title = "Sites of " + root.getTitle();
   res.data.body = this.renderSkinAsString("list");
   root.renderSkin("page");
}

/**
 * @DEPRECATED
 */

function safescripts_action() {
   res.contentType = "text/javascript";
   res.write("");
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
   res.data.title = root.getTitle() + " - 404 - blocked";
   res.data.body = "<p><b>Sorry!</b></p><p>This weblog was disabled.</p>";
   root.renderSkin("page");
}

/**
 * 404 action
 */
function notfound_action() {
   res.data.title = root.getTitle() + " - 404 - not found";
   res.data.body = "<p><b>Sorry!</b></p><p>URL /" + req.path + " was not found on this server!</p>";
   (path.site && path.site.online ? path.site : root).renderSkin("page");
}

/**
 * error action
 */
function sys_error_action() {
   res.data.title = root.getTitle() + " - Error";
   res.data.body = "<p><b>Sorry!</b></p><p>An error occurred while processing your request:</p>";
   res.data.body += "<p>"+res.error+"</p>";
   (path.site && path.site.online ? path.site : root).renderSkin("page");
}

/**
 * action to render external stylesheet
 */
function stylesheet_action() {
   res.dependsOn(res.handlers.layout.modifytime);
   res.dependsOn(res.handlers.layout.skins.getSkinSource("root", "style"));
   res.digest();
   res.contentType = "text/css";
   this.renderSkin("style");
   return;
}

/**
 * action to render external javascript
 */
function javascript_action() {
   res.dependsOn(res.handlers.layout.modifytime);
   res.dependsOn(res.handlers.layout.skins.getSkinSource("root", "javascript"));
   res.digest();
   res.contentType = "text/javascript";
   root.renderSkin("javascript");
   root.renderSkin("systemscripts");
   return;
}

