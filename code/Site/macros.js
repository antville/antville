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
      Html.openLink(this.href(param.linkto));
      if (this.title && this.title.trim())
        res.write(stripTags(this.title));
      else
        res.write("<i>[untitled]</i>");
      Html.closeLink();
    } else
      res.write(this.title);
  }
}


/**
 * macro rendering alias
 */
function alias_macro(param) {
  if (param.as == "editor")
    Html.input(this.createInputParam("alias", param));
  else
    res.write(this.alias);
}


/**
 * macro rendering tagline
 */
function tagline_macro(param) {
   if (param.as == "editor")
      Html.input(this.preferences.createInputParam("tagline", param));
   else if (this.preferences.getProperty("tagline"))
      res.write(stripTags(this.preferences.getProperty("tagline")));
}


/**
 * macro rendering email
 */
function email_macro(param) {
  if (param.as == "editor")
    Html.input(this.createInputParam("email", param));
  else
    res.write(this.email);
}


/**
 * macro rendering bgcolor
 */
function bgcolor_macro(param) {
  if (param.as == "editor")
    Html.input(this.preferences.createInputParam("bgcolor", param));
  else
    renderColor(this.preferences.getProperty("bgcolor"));
}


/**
 * macro rendering textfont
 */
function textfont_macro(param) {
  if (param.as == "editor") {
    param.size = 40;
    Html.input(this.preferences.createInputParam("textfont", param));
  } else
    res.write(this.preferences.getProperty("textfont"));
}


/**
 * macro rendering textsize
 */
function textsize_macro(param) {
  if (param.as == "editor")
    Html.input(this.preferences.createInputParam("textsize", param));
  else
    res.write(this.preferences.getProperty("textsize"));
}


/**
 * macro rendering textcolor
 */
function textcolor_macro(param) {
  if (param.as == "editor")
    Html.input(this.preferences.createInputParam("textcolor", param));
  else
    renderColor(this.preferences.getProperty("textcolor"));
}


/**
 * macro rendering linkcolor
 */
function linkcolor_macro(param) {
  if (param.as == "editor")
    Html.input(this.preferences.createInputParam("linkcolor", param));
  else
    renderColor(this.preferences.getProperty("linkcolor"));
}


/**
 * macro rendering alinkcolor
 */
function alinkcolor_macro(param) {
  if (param.as == "editor")
    Html.input(this.preferences.createInputParam("alinkcolor", param));
  else
    renderColor(this.preferences.getProperty("alinkcolor"));
}


/**
 * macro rendering vlinkcolor
 */
function vlinkcolor_macro(param) {
  if (param.as == "editor")
    Html.input(this.preferences.createInputParam("vlinkcolor", param));
  else
    renderColor(this.preferences.getProperty("vlinkcolor"));
}


/**
 * macro rendering titlefont
 */
function titlefont_macro(param) {
  if (param.as == "editor") {
    param.size = 40;
    Html.input(this.preferences.createInputParam("titlefont", param));
  } else
    res.write(this.preferences.getProperty("titlefont"));
}


/**
 * macro rendering titlesize
 */
function titlesize_macro(param) {
  if (param.as == "editor")
    Html.input(this.preferences.createInputParam("titlesize", param));
  else
    res.write(this.preferences.getProperty("titlesize"));
}


/**
 * macro rendering titlecolor
 */
function titlecolor_macro(param) {
  if (param.as == "editor")
    Html.input(this.preferences.createInputParam("titlecolor", param));
  else
    renderColor(this.preferences.getProperty("titlecolor"));
}


/**
 * macro rendering smallfont
 */
function smallfont_macro(param) {
  if (param.as == "editor") {
    param.size = 40;
    Html.input(this.preferences.createInputParam("smallfont", param));
  } else
    res.write(this.preferences.getProperty("smallfont"));
}


/**
 * macro rendering smallfont-size
 */
function smallsize_macro(param) {
  if (param.as == "editor")
    Html.input(this.preferences.createInputParam("smallsize", param));
  else
    res.write(this.preferences.getProperty("smallsize"));
}


/**
 * macro rendering smallfont-color
 */
function smallcolor_macro(param) {
  if (param.as == "editor")
    Html.input(this.preferences.createInputParam("smallcolor", param));
  else
    renderColor(this.preferences.getProperty("smallcolor"));
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
      var inputParam = this.createInputParam("online", param);
      if ((req.data.save && req.data.online) || (!req.data.save && this.online))
         inputParam.checked = "checked";
      Html.checkBox(inputParam);
   } else if (this.online)
      res.write(param.yes ? param.yes : "yes");
   else
      res.write(param.no ? param.no : "no");
}


/**
 * macro rendering discussion-flag
 */
function hasdiscussions_macro(param) {
   if (param.as == "editor") {
      var inputParam = this.preferences.createInputParam("discussions", param);
      if ((req.data.save && req.data.discussions) ||
          (!req.data.save && this.preferences.getProperty("discussions")))
         inputParam.checked = "checked";
      Html.checkBox(inputParam);
   } else
      res.write(this.preferences.getProperty("discussions") ? "yes" : "no");
   return;
}


/**
 * macro rendering usercontrib-flag
 */
function usermaycontrib_macro(param) {
   if (param.as == "editor") {
      var inputParam = this.preferences.createInputParam("usercontrib", param);
      if ((req.data.save && req.data.usercontrib) ||
          (!req.data.save && this.preferences.getProperty("usercontrib")))
         inputParam.checked = "checked";
      Html.checkBox(inputParam);
   } else
      res.write(this.preferences.getProperty("usercontrib") ? "yes" : "no");
}


/**
 * macro rendering nr. of days to show on site-fontpage
 */
function showdays_macro(param) {
  if (param.as == "editor")
    Html.input(this.preferences.createInputParam("days", param));
  else
    res.write(this.preferences.getProperty("days"));
}


/**
 * macro rendering archive-flag
 */
function showarchive_macro(param) {
   if (param.as == "editor") {
      var inputParam = this.preferences.createInputParam("archive", param);
      if ((req.data.save && req.data.archive) ||
          (!req.data.save && this.preferences.getProperty("archive")))
         inputParam.checked = "checked";
      Html.checkBox(inputParam);
   } else
      res.write(this.preferences.getProperty("archive") ? "yes" : "no");
}


/**
 * macro rendering enableping-flag
 */
function enableping_macro(param) {
   if (param.as == "editor") {
      var inputParam = this.createInputParam("enableping", param);
      if ((req.data.save && req.data.enableping) || (!req.data.save && this.enableping))
         inputParam.checked = "checked";
      Html.checkBox(inputParam);
   } else
      res.write(this.enableping ? "yes" : "no");
}


/**
 * macro rendering default longdateformat
 */
function longdateformat_macro(param) {
  if (param.as == "chooser")
    renderDateformatChooser("longdateformat",
                            this.getLocale(),
                            this.preferences.getProperty("longdateformat"));
  else if (param.as == "editor")
    Html.input(this.preferences.createInputParam("longdateformat", param));
  else
    res.write(this.preferences.getProperty("longdateformat"));
}


/**
 * macro rendering default shortdateformat
 */
function shortdateformat_macro(param) {
  if (param.as == "chooser")
    renderDateformatChooser("shortdateformat",
                            this.getLocale(),
                            this.preferences.getProperty("shortdateformat"));
  else if (param.as == "editor")
    Html.input(this.preferences.createInputParam("shortdateformat", param));
  else
    res.write(this.preferences.getProperty("shortdateformat"));
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
}


/**
 * macro rendering two different navigation-skins
 * depending on user-status & rights
 */
function navigation_macro(param) {
   if (!param["for"] || param["for"] == "users") {
      this.renderSkin("usernavigation");
   }
   if (!session.user)
      return;
   if (!param["for"] || param["for"] == "contributors") {
      if (this.preferences.getProperty("usercontrib") || req.data.memberlevel >= CONTRIBUTOR)
         this.renderSkin("contribnavigation");
   }
   if (!param["for"] || param["for"] == "admins") {
      if (req.data.memberlevel >= ADMIN)
         this.renderSkin("adminnavigation");
   }
   return;
}


/**
 * macro writes storylist to response-object
 * kept for backwards-compatibility only
 */
function storylist_macro(param) {
   res.write(res.data.storylist);
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
   // init stringBuffers
   var weekBuf = new java.lang.StringBuffer();
   var calBuf = new java.lang.StringBuffer();

   // create new calendar-object
   var cal = java.util.Calendar.getInstance(this.getTimeZone(), this.getLocale());
   var symbols = this.getDateSymbols();

   // render header-row of calendar
   var firstDayOfWeek = cal.getFirstDayOfWeek();
   var weekdays = symbols.getShortWeekdays();
   for (var i=0;i<7;i++) {
      dayParam.day = weekdays[(i+firstDayOfWeek-1)%7+1];
      weekBuf.append(this.renderSkinAsString("calendardayheader", dayParam));
   }
   weekParam.week = weekBuf.toString();
   calBuf.append(this.renderSkinAsString("calendarweek", weekParam));

   cal.set(java.util.Calendar.DATE, 1);
   // check whether there's a day or a story in path
   // if so, use it to determine the month to render
   if (path.story)
      var today = path.story.day.toString();
   else if (path.day && this.contains(path.day) > -1)
      var today = path.day.groupname.toString();
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
      weekBuf = new java.lang.StringBuffer();
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
               dayParam.day = Html.linkAsString(currGroup.href(), linkText);
            } else {
               dayParam.day = linkText;
            }
            if (currGroupname == today)
               dayParam.skin = "calendarselday";
            daycnt++;
         }
         weekBuf.append(this.renderSkinAsString(dayParam.skin, dayParam));
      }
      weekParam.week = weekBuf.toString();
      calBuf.append(this.renderSkinAsString("calendarweek", weekParam));
   }
   // set day to last day of month and try to render next month
   // check what the last day of the month is
   calParam.back = this.renderLinkToPrevMonth(firstDayIndex, currMonth + "01", monthNames);
   calParam.forward = this.renderLinkToNextMonth(lastDayIndex, currMonth + "31", monthNames);
   calParam.calendar = calBuf.toString();
   this.renderSkin("calendar", calParam);
}


/**
 * macro renders age
 */
function age_macro(param) {
   res.write(Math.floor((new Date() - this.createtime) / ONEDAY));
}


/**
 * macro left for backwards-compatibility
 * calls global image_macro()
 */
function image_macro(param) {
   image_macro(param);
}


/**
 * macro left for backwards-compatibility
 * calls global thumbnail_macro()
 */
function thumbnail_macro(param) {
   thumbnail_macro(param);
}


/**
 * macro renders the number of members of this site
 */
function membercounter_macro(param) {
   res.write(this.members.size());
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
   if (!param.show)
      param.show = 5;
   var cnt = 0;
   var i = 0;
   this.lastmod.prefetchChildren(0, parseInt(param.show, 10));
   while (cnt < param.show && this.lastmod.get(i)) {
      var item = this.lastmod.get(i++);
      if (!item.story ||
          (item.story.online && item.story.discussions &&
           item.site.preferences.getProperty("discussions"))) {
         item.renderSkin("historyview");
         cnt++;
      }
   }
   return;
}


/**
 * macro renders a list of available locales as dropdown
 */
function localechooser_macro(param) {
   renderLocaleChooser(this.getLocale());
}



/**
 * macro renders a list of available time zones as dropdown
 */
function timezonechooser_macro(param) {
   renderTimeZoneChooser(this.getTimeZone());
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
  var img = root.images.get("xmlbutton");
  if (!img)
    return;
  Html.openLink(this.href("rss"));
  renderImage(img, param);
  Html.closeLink();
}


/**
 * renders the searchbox
 */
function searchbox_macro(param) {
   this.renderSkin("searchbox");
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
         Html.openLink(curr.href());
         var ts = curr.groupname.substring(0, 6).toDate("yyyyMM", this.getTimeZone());
         res.write(formatTimestamp(ts, param.format ? param.format : "MMMM yyyy"));
         Html.closeLink();
         res.write(param.itemsuffix);
      }
   }
   return;
}

/**
 * wrapper-macro for topiclist
 */
function topiclist_macro(param) {
   this.topics.topiclist_macro(param);
}

/**
 * wrapper-macro for imagelist
 */
function imagelist_macro(param) {
   this.images.imagelist_macro(param);
}

/**
 * proxy-macro for skinset chooser
 */
function skinsetchooser_macro(param) {
   param.selected = this.preferences.getProperty("skinset");
   this.skins.skinsetchooser_macro(param);
}

/**
 * macro rendering recipients for email notification
 * param.event: storycreate/commentcreate/textupdate/upload
 * please add some error message for undefined param.event
 */
function notify_macro(param) {
   if (param.as == "editor") {
      var options = new Array("Don't notify anyone", "Notify content managers", "Notify contributors");
      var pref = this.preferences.getProperty("notify_" + param.event);
      Html.dropDown("notify_" + param.event, options, pref);
   } else {
      if (pref == 2)
         res.write("Notify contributors");
      else if (pref == 1)
         res.write("Notify content managers");
      else
         res.write("Don't notify anyone");
   }
   return;
}

/**
 * macro rendering notification settings if enabled
 */
function notification_macro(param) {
   if (root.sys_allowEmails == 1 || root.sys_allowEmails == 2 && this.trusted )
      this.renderSkin("notification");
   return;
}

