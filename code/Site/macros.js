/**
 * macro rendering title
 */
function title_macro(param) {
   if (param.as == "editor")
      Html.input(this.createInputParam("title", param));
   else {
      if (param && param.linkto) {
         if (param.linkto == "main")
            param.linkto = "";
         Html.openLink({href: this.href(param.linkto)});
         if (this.title && this.title.trim())
            res.write(stripTags(this.title));
         else
            res.write("<em>[untitled]</em>");
         Html.closeLink();
      } else
         res.write(this.title);
   }
   return;
}


/**
 * macro rendering alias
 */
function alias_macro(param) {
   if (param.as == "editor")
      Html.input(this.createInputParam("alias", param));
   else
      res.write(this.alias);
   return;
}


/**
 * macro rendering tagline
 */
function tagline_macro(param) {
   if (param.as == "editor")
      Html.input(this.preferences.createInputParam("tagline", param));
   else if (this.preferences.getProperty("tagline"))
      res.write(stripTags(this.preferences.getProperty("tagline")));
   return;
}


/**
 * macro rendering email
 */
function email_macro(param) {
   if (param.as == "editor")
      Html.input(this.createInputParam("email", param));
   else
      res.write(this.email);
   return;
}


/**
 * macro rendering lastupdate
 */
function lastupdate_macro(param) {
   if (this.lastupdate)
      res.write(formatTimestamp(this.lastupdate, param.format));
   return;
}


/**
 * macro rendering online-status
 */
function online_macro(param) {
   if (param.as == "editor") {
      var inputParam = this.createCheckBoxParam("online", param);
      if (req.data.save && !req.data.online)
         delete inputParam.checked;
      Html.checkBox(inputParam);
   } else if (this.online)
      res.write(param.yes ? param.yes : getMessage("generic.yes"));
   else
      res.write(param.no ? param.no : getMessage("generic.no"));
   return;
}


/**
 * macro rendering discussion-flag
 */
function hasdiscussions_macro(param) {
   if (param.as == "editor") {
      var inputParam = this.preferences.createCheckBoxParam("discussions", param);
      if (req.data.save && !req.data.preferences_discussions)
         delete inputParam.checked;
      Html.checkBox(inputParam);
   } else
      res.write(this.preferences.getProperty("discussions") ? 
                getMessage("generic.yes") : getMessage("generic.no"));
   return;
}


/**
 * macro rendering usercontrib-flag
 */
function usermaycontrib_macro(param) {
   if (param.as == "editor") {
      var inputParam = this.preferences.createCheckBoxParam("usercontrib", param);
      if (req.data.save && !req.data.preferences_usercontrib)
         delete inputParam.checked;
      Html.checkBox(inputParam);
   } else
      res.write(this.preferences.getProperty("usercontrib") ? 
                getMessage("generic.yes") : getMessage("generic.no"));
   return;
}


/**
 * macro rendering nr. of days to show on site-fontpage
 */
function showdays_macro(param) {
   if (param.as == "editor")
      Html.input(this.preferences.createInputParam("days", param));
   else
      res.write(this.preferences.getProperty("days"));
   return;
}


/**
 * macro rendering archive-flag
 */
function showarchive_macro(param) {
   if (param.as == "editor") {
      var inputParam = this.preferences.createCheckBoxParam("archive", param);
      if (req.data.save && !req.data.preferences_archive)
         delete inputParam.checked;
      Html.checkBox(inputParam);
   } else
      res.write(this.preferences.getProperty("archive") ? 
                getMessage("generic.yes") : getMessage("generic.no"));
   return;
}


/**
 * macro rendering enableping-flag
 */
function enableping_macro(param) {
   if (param.as == "editor") {
      var inputParam = this.createCheckBoxParam("enableping", param);
      if (req.data.save && !req.data.enableping)
         delete inputParam.checked;
      Html.checkBox(inputParam);
   } else
      res.write(this.enableping ? getMessage("generic.yes") : getMessage("generic.no"));
   return;
}


/**
 * macro rendering default longdateformat
 */
function longdateformat_macro(param) {
   if (param.as == "chooser")
      renderDateformatChooser("longdateformat", this.getLocale(),
                              this.preferences.getProperty("longdateformat"));
   else if (param.as == "editor")
      Html.input(this.preferences.createInputParam("longdateformat", param));
   else
      res.write(this.preferences.getProperty("longdateformat"));
   return;
}


/**
 * macro rendering default shortdateformat
 */
function shortdateformat_macro(param) {
   if (param.as == "chooser")
      renderDateformatChooser("shortdateformat", this.getLocale(),
                              this.preferences.getProperty("shortdateformat"));
   else if (param.as == "editor")
      Html.input(this.preferences.createInputParam("shortdateformat", param));
   else
      res.write(this.preferences.getProperty("shortdateformat"));
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
 * macro rendering two different navigation-skins
 * depending on user-status & rights
 */
function navigation_macro(param) {
   if (param["for"] == "users" && !param.modules) {
      // FIXME: this is left for backwards-compatibility
      // sometime in the future we'll get rid of the usernavigation.skin
      res.write("...&nbsp;");
      Html.link({href: "http://project.antville.org/project/stories/146"}, "<strong>README</strong>");
      Html.tag("br");
      Html.tag("br");
      this.renderSkin("usernavigation");
   }
   if (!session.user)
      return;
   switch (param["for"]) {
      case "contributors" :
         if (session.user.sysadmin ||
             this.preferences.getProperty("usercontrib") ||
             req.data.memberlevel >= CONTRIBUTOR)
            this.renderSkin("contribnavigation");
         break;
      case "admins" :
         if (session.user.sysadmin || req.data.memberlevel >= ADMIN)
            this.renderSkin("adminnavigation");
         break;
   }
   if (param.modules != null) {
      var mods = param.modules.split(",");
      if (mods.length == 1 && mods[0] == "all") {
         for (var i in app.modules)
            this.applyModuleMethod(app.modules[i], "renderSiteNavigation", param);
      } else {
         for (var i in mods)
            this.applyModuleMethod(app.modules[mods[i]], "renderSiteNavigation", param);
      }
   }
   return;
}


/**
 * call the site navigation render method
 * of a module
 */
function moduleNavigation_macro(param) {
   if (!param.module)
      return;
   this.applyModuleMethod(app.modules[param.module],
                          "renderSiteNavigation", param);
   return;
}


/**
 * macro renders a calendar
 * version 2
 */
function calendar_macro(param) {
   // do nothing if there is not a single story :-))
   // or if archive of this site is disabled
   if (!this.allstories.size() || !this.preferences.getProperty("archive"))
      return;
   // define variables needed in this function
   var calParam = new Object();
   var dayParam = new Object();
   var weekParam = new Object();
   res.push();

   // create new calendar-object
   var cal = java.util.Calendar.getInstance(this.getTimeZone(), this.getLocale());
   var symbols = this.getDateSymbols();

   // render header-row of calendar
   var firstDayOfWeek = cal.getFirstDayOfWeek();
   var weekdays = symbols.getShortWeekdays();
   res.push();
   for (var i=0;i<7;i++) {
      dayParam.day = weekdays[(i+firstDayOfWeek-1)%7+1];
      this.renderSkin("calendardayheader", dayParam);
   }
   weekParam.week = res.pop();
   this.renderSkin("calendarweek", weekParam);

   cal.set(java.util.Calendar.DATE, 1);
   // check whether there's a day or a story in path
   // if so, use it to determine the month to render
   if (path.Story)
      var today = path.Story.day.toString();
   else if (path.Day && path.Day._prototype == "Day")
      var today = path.Day.groupname.toString();
   if (today) {
      // instead of using String.toDate
      // we do it manually here to avoid that a day like 20021001
      // would be changed to 20020930 in some cases
      cal.set(java.util.Calendar.YEAR, parseInt(today.substring(0, 4), 10));
      cal.set(java.util.Calendar.MONTH, parseInt(today.substring(4, 6), 10)-1);
   }
   // nr. of empty days in rendered calendar before the first day of month appears
   var pre = (7-firstDayOfWeek+cal.get(java.util.Calendar.DAY_OF_WEEK)) % 7;
   var days = cal.getActualMaximum(java.util.Calendar.DATE);
   var weeks = Math.ceil((pre + days) / 7);
   var daycnt = 1;

   var monthNames = symbols.getMonths();
   calParam.month = monthNames[cal.get(java.util.Calendar.MONTH)];
   calParam.year =  cal.get(java.util.Calendar.YEAR);

   // pre-render the year and month so we only have to append the days as we loop
   var currMonth = formatTimestamp(new Date(cal.getTime().getTime()), "yyyyMM");
   // remember the index of the first and last days within this month.
   // this is needed to optimize previous and next month links.
   var lastDayIndex = 9999999;
   var firstDayIndex = -1;

   for (var i=0;i<weeks;i++) {
      res.push();
      for (var j=0;j<7;j++) {
         dayParam.skin = "calendarday";
         if ((i == 0 && j < pre) || daycnt > days)
            dayParam.day = "&nbsp;";
         else {
            var currGroupname = currMonth+daycnt.format("00");
            var linkText = daycnt < 10 ? "&nbsp;" + daycnt + "&nbsp;" : daycnt.toString();
            var currGroup = this.get(currGroupname);
            if (currGroup) {
               var idx = this.contains(currGroup);
               if (idx > -1) {
                  if  (idx > firstDayIndex)
                     firstDayIndex = idx;
                  if (idx < lastDayIndex)
                     lastDayIndex = idx;
               }
               dayParam.day = Html.linkAsString({href: currGroup.href()}, linkText);
            } else {
               dayParam.day = linkText;
            }
            if (currGroupname == today)
               dayParam.skin = "calendarselday";
            daycnt++;
         }
         this.renderSkin(dayParam.skin, dayParam);
      }
      weekParam.week = res.pop();
      this.renderSkin("calendarweek", weekParam);
   }
   // set day to last day of month and try to render next month
   // check what the last day of the month is
   calParam.back = this.renderLinkToPrevMonth(firstDayIndex, currMonth + "01", monthNames);
   calParam.forward = this.renderLinkToNextMonth(lastDayIndex, currMonth + "31", monthNames);
   calParam.calendar = res.pop();
   this.renderSkin("calendar", calParam);
   return;
}


/**
 * macro renders age
 */
function age_macro(param) {
   res.write(Math.floor((new Date() - this.createtime) / ONEDAY));
   return;
}


/**
 * macro renders a list of recently added/updated stories/comments
 * of this site
 */
function history_macro(param) {
   try {
      this.checkView(session.user, req.data.memberlevel);
   } catch (deny) {
      return;
   }
   var limit = param.limit ? parseInt(param.limit, 10) : 5;
   var cnt = i = 0;
   var size = this.lastmod.size();
   var discussions = this.preferences.getProperty("discussions");
   while (cnt < limit && i < size) {
      if (i % limit == 0)
         this.lastmod.prefetchChildren(i, limit);
      var item = this.lastmod.get(i++);
      switch (item._prototype) {
         case "Story":
            if (param.show == "comments")
               continue;
            break;
         case "Comment":
            if (param.show == "stories" || !item.story.online ||
                  !item.story.discussions || !discussions)
               continue;
            break;
      }
      item.renderSkin("historyview");
      cnt++;
   }
   return;
}


/**
 * macro renders a list of available locales as dropdown
 */
function localechooser_macro(param) {
   renderLocaleChooser(this.getLocale());
   return;
}



/**
 * macro renders a list of available time zones as dropdown
 */
function timezonechooser_macro(param) {
   renderTimeZoneChooser(this.getTimeZone());
   return;
}


/**
 * renders a list of most read pages, ie. a link
 * to a story together with the read counter et al.
 */
function listMostRead_macro() {
   var param = new Object();
   var size = this.mostread.size();
   for (var i=0; i<size; i++) {
      var s = this.mostread.get(i);
      param.reads = s.reads;
      param.rank = i+1;
      s.renderSkin("mostread", param);
   }
   return;
}


/**
 * renders a list of referrers, ie. a link
 * to a url together with the read counter et al.
 */
function listReferrers_macro() {
   var c = getDBConnection("antville");
   var dbError = c.getLastError();
   if (dbError)
      return getMessage("error.database", dbError);
   // we're doing this with direct db access here
   // (there's no need to do it with prototypes):
   var d = new Date();
   d.setDate(d.getDate()-1); // 24 hours ago
   var query = "select ACCESSLOG_REFERRER, count(*) as \"COUNT\" from AV_ACCESSLOG " +
      "where ACCESSLOG_F_SITE = " + this._id + " and ACCESSLOG_DATE > {ts '" +
      d.format("yyyy-MM-dd HH:mm:ss") + "'} group by ACCESSLOG_REFERRER "+
      "order by \"COUNT\" desc, ACCESSLOG_REFERRER asc;";
   var rows = c.executeRetrieval(query);
   var dbError = c.getLastError();
   if (dbError)
      return getMessage("error.database", dbError);
   var skinParam = new Object();
   var referrer;
   while (rows.next()) {
      skinParam.count = rows.getColumnItem("COUNT");
      referrer = rows.getColumnItem("ACCESSLOG_REFERRER");
      skinParam.referrer = encode(referrer);
      skinParam.text = encode(referrer.length > 50 ? referrer.substring(0, 50) + "..." : referrer);
      this.renderSkin("referrerItem", skinParam);
   }
   rows.release();
   return;
}


/**
 * renders the xml button for use
 * when referring to an rss feed
 */
function xmlbutton_macro(param) {
   param.linkto = this.href("rss");   
   DefaultImages.render("xmlbutton", param);
   return;
}


/**
 * renders the searchbox
 */
function searchbox_macro(param) {
   this.renderSkin("searchbox");
   return;
}


/**
 * function renders the months of the archive
 */
function monthlist_macro(param) {
   if (!this.stories.size() || !this.preferences.getProperty("archive"))
      return;
   var size = param.limit ? Math.min(this.size(), param.limit) : this.size();
   for (var i=0;i<size;i++) {
      var curr = this.get(i);
      var next = this.get(i+1);
      if (!next || next.groupname.substring(0, 6) < curr.groupname.substring(0, 6)) {
         res.write(param.itemprefix);
         Html.openLink({href: curr.href()});
         var ts = curr.groupname.substring(0, 6).toDate("yyyyMM", this.getTimeZone());
         res.write(formatTimestamp(ts, param.format ? param.format : "MMMM yyyy"));
         Html.closeLink();
         res.write(param.itemsuffix);
      }
   }
   return;
}

/**
 * proxy-macro for layout chooser
 */
function layoutchooser_macro(param) {
   if (this.layout)
      param.selected = this.layout.alias;
   this.layouts.layoutchooser_macro(param);
   return;
}

/**
 * macro rendering recipients for email notification
 * param.event: storycreate/commentcreate/textupdate/upload
 * please add some error message for undefined param.event
 */
function notify_macro(param) {
   var notifyContributors = param.notifyContributors ? 
      param.notifyContributors : getMessage("Site.notifyContributors");
   var notifyAdmins = param.notifyAdmins ? 
      param.notifyAdmins : getMessage("Site.notifyAdmins");
   var notifyNobody = param.notifyNobody ? 
      param.notifyNobody : getMessage("Site.notifyNobody");

   var pref = this.preferences.getProperty("notify_" + param.event);
   if (param.as == "editor") {
      var options = new Array(notifyNobody, notifyAdmins, notifyContributors);
      Html.dropDown({name: "notify_" + param.event}, options, pref);
   } else {
      switch (pref) {
         case 2:
            return notifyContributors;
         case 1:
            return notifyAdmins;
         default:
            return notifyNobody;
      }
   }
   return;
}

/**
 * macro rendering notification settings if enabled
 */
function notification_macro(param) {
   if (this.isNotificationEnabled())
      this.renderSkin("notification");
   return;
}


/**
 * render generic preference editor or value
 */
function preferences_macro(param) {
   if (param.as == "editor") {
      var inputParam = this.preferences.createInputParam(param.name, param);
      delete inputParam.part;
      if (param.cols || param.rows)
         Html.textArea(inputParam);
      else
         Html.input(inputParam);
   } else
      res.write(this.preferences.getProperty(param.name));
   return;
}


/**
 * output spamfilter data appropriate
 * for client-side javascript code
 */
function spamfilter_macro(param) {
   var str = this.preferences.getProperty("spamfilter");
   if (!str)
      return;
   var items = str.replace(/\r/g, "").split("\n");
   for (var i in items) {
      res.write('"');
      res.write(items[i]);
      res.write('"');
      if (i < items.length-1)
         res.write(",");
   }
   return;
}


/**
 * macro returns the used disk space for this site
 */
function diskusage_macro(param) {
   res.write(this.getDiskUsage().format("###,###") + " KB");
   return;
}

/**
 * macro checks if there are any modules present
 * and if they need to be included in the system setup page
 */
function modulePreferences_macro(param) {
   for (var i in app.modules)
      this.applyModuleMethod(app.modules[i], "renderPreferences", param);
   return;
}


/**
 * catch some special needs before passing the 
 * macro call up to the HopObject prototype
 * FIXME: this is probably to hackish...
 */
function switch_macro(param) {
   if (param.name == "userMayEdit") {
      try {
         // FIXME: unfortunately, the check* methods are
         // not very handy, anymore... (need try/catch block)
         this.checkEdit(session.user, req.data.memberlevel);
         res.write(param.on);
      } catch (err) {
         res.write(param.off);
         return;
      }
   } else
      HopObject.switch_macro.apply(this, [param]);
   return;
}

/**   
 * returns the number of members of this site
 */   
function membercounter_macro(param) {
   return this.members.size();
} 
