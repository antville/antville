/**
 * macro rendering title
 */
function title_macro(param) {
  if (param.as == "editor")
    renderInputText(this.createInputParam("title", param));
  else {
    if (param && param.linkto) {
      if (param.linkto == "main")
        param.linkto = "";
      openLink(this.href(param.linkto));
      if (this.title && this.title.trim())
        res.write(stripTags(this.title));
      else
        res.write("<i>[untitled]</i>");
      closeLink();
    } else
      res.write(this.title);
  }
}


/**
 * macro rendering alias
 */
function alias_macro(param) {
  if (param.as == "editor")
    renderInputText(this.createInputParam("alias",param));
  else
    res.write(this.alias);
}


/**
 * macro rendering tagline
 */
function tagline_macro(param) {
  if (!this.tagline && param.as != "editor")
    return;
  
  if (param.as == "editor")
    renderInputText(this.createInputParam("tagline",param));
  else if (this.tagline)
    res.write(stripTags(this.tagline));
}


/**
 * macro rendering email
 */
function email_macro(param) {
  if (param.as == "editor")
    renderInputText(this.createInputParam("email",param));
  else
    res.write(this.email);
}


/**
 * macro rendering bgcolor
 */
function bgcolor_macro(param) {
  if (param.as == "editor")
    renderInputText(this.createInputParam("bgcolor",param));
  else
    renderColor(this.bgcolor);
}


/**
 * macro rendering textfont
 */
function textfont_macro(param) {
  if (param.as == "editor")
    renderInputText(this.createInputParam("textfont",param));
  else
    res.write(this.textfont);
}


/**
 * macro rendering textsize
 */
function textsize_macro(param) {
  if (param.as == "editor")
    renderInputText(this.createInputParam("textsize",param));
  else
    res.write(this.textsize);
}


/**
 * macro rendering textcolor
 */
function textcolor_macro(param) {
  if (param.as == "editor")
    renderInputText(this.createInputParam("textcolor",param));
  else
    renderColor(this.textcolor);
}


/**
 * macro rendering linkcolor
 */
function linkcolor_macro(param) {
  if (param.as == "editor")
    renderInputText(this.createInputParam("linkcolor",param));
  else
    renderColor(this.linkcolor);
}


/**
 * macro rendering alinkcolor
 */
function alinkcolor_macro(param) {
  if (param.as == "editor")
    renderInputText(this.createInputParam("alinkcolor",param));
  else
    renderColor(this.alinkcolor);
}


/**
 * macro rendering vlinkcolor
 */
function vlinkcolor_macro(param) {
  if (param.as == "editor")
    renderInputText(this.createInputParam("vlinkcolor",param));
  else
    renderColor(this.vlinkcolor);
}


/**
 * macro rendering titlefont
 */
function titlefont_macro(param) {
  if (param.as == "editor")
    renderInputText(this.createInputParam("titlefont",param));
  else
    res.write(this.titlefont);
}


/**
 * macro rendering titlesize
 */
function titlesize_macro(param) {
  if (param.as == "editor")
    renderInputText(this.createInputParam("titlesize",param));
  else
    res.write(this.titlesize);
}


/**
 * macro rendering titlecolor
 */
function titlecolor_macro(param) {
  if (param.as == "editor")
    renderInputText(this.createInputParam("titlecolor",param));
  else
    renderColor(this.titlecolor);
}


/**
 * macro rendering smallfont
 */
function smallfont_macro(param) {
  if (param.as == "editor")
    renderInputText(this.createInputParam("smallfont",param));
  else
    res.write(this.smallfont);
}


/**
 * macro rendering smallfont-size
 */
function smallsize_macro(param) {
  if (param.as == "editor")
    renderInputText(this.createInputParam("smallsize",param));
  else
    res.write(this.smallsize);
}


/**
 * macro rendering smallfont-color
 */
function smallcolor_macro(param) {
  if (param.as == "editor")
    renderInputText(this.createInputParam("smallcolor",param));
  else
    renderColor(this.smallcolor);
}


/**
 * macro rendering lastupdate
 */
function lastupdate_macro(param) {
  if (!this.lastupdate) {
    res.write("no updates so far");
  }
  else
    res.write(formatTimestamp(this.lastupdate,param.format));
}


/**
 * macro rendering online-status
 */
function online_macro(param) {
  if (param.as == "editor")
    renderInputCheckbox(this.createInputParam("online",param));
  else
    res.write(this.online ? "yes" : "no");
}


/**
 * macro renders the url to this site
 */
function url_macro(param) {
  res.write(this.href());
}


/**
 * macro rendering discussion-flag
 */
function hasdiscussions_macro(param) {
  if (param.as == "editor")
    renderInputCheckbox(this.createInputParam("discussions",param));
  else
    res.write(this.discussions ? "yes" : "no");
}


/**
 * macro rendering usercontrib-flag
 */
function usermaycontrib_macro(param) {
  if (param.as == "editor")
    renderInputCheckbox(this.createInputParam("usercontrib",param));
  else
    res.write(this.usercontrib ? "yes" : "no");
}


/**
 * macro rendering nr. of days to show on site-fontpage
 */
function showdays_macro(param) {
  if (param.as == "editor")
    renderInputText(this.createInputParam("days",param));
  else
    res.write(this.days);
}


/**
 * macro rendering archive-flag
 */
function showarchive_macro(param) {
  if (param.as == "editor")
    renderInputCheckbox(this.createInputParam("archive",param));
  else
    res.write(this.archive ? "yes" : "no");
}


/**
 * macro rendering enableping-flag
 */
function enableping_macro(param) {
  if (param.as == "editor")
    renderInputCheckbox(this.createInputParam("enableping",param));
  else
    res.write(this.enableping ? "yes" : "no");
}


/**
 * macro rendering default longdateformat
 */
function longdateformat_macro(param) {
  if (param.as == "chooser")
    this.renderDateformatChooser("long");
  else if (param.as == "editor")
    renderInputText(this.createInputParam("longdateformat",param));
  else
    res.write(this.longdateformat);
}


/**
 * macro rendering default shortdateformat
 */
function shortdateformat_macro(param) {
  if (param.as == "chooser")
    this.renderDateformatChooser("short");
  else if (param.as == "editor")
    renderInputText(this.createInputParam("shortdateformat",param));
  else
    res.write(this.shortdateformat);
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
      if (this.usercontrib || req.data.memberlevel >= CONTRIBUTOR)
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
   if (!this.allstories.size() || !this.archive)
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
   calBuf.append(this.renderSkinAsString("calendarweek",weekParam));

   cal.set(java.util.Calendar.DATE,1);
   // check whether there's a day or a story in path
   // if so, use it to determine the month to render
   if (path.story)
      var today = path.story.day.toString();
   else if (path.day)
      var today = path.day.groupname.toString();
   if (today) {
      // instead of using the global parseTimestamp-function
      // we do it manually here to avoid that a day like 20021001
      // would be changed to 20020930 in some cases
      cal.set(java.util.Calendar.YEAR,parseInt(today.substring(0,4),10));
      cal.set(java.util.Calendar.MONTH,parseInt(today.substring(4,6),10)-1);
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
   var currMonth = formatTimestamp(cal.getTime(), "yyyyMM");
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
            var linkText = daycnt < 10 ? "&nbsp;"+daycnt+"&nbsp;" : daycnt;
            var currGroup = this.get(currGroupname);
            if (currGroup) {
               var idx = this.contains(currGroup);
               if (idx > -1) {
                  if  (idx > firstDayIndex)
                     firstDayIndex = idx;
                  if (idx < lastDayIndex)
                     lastDayIndex = idx;
               }
               dayParam.day =  "<a href=\"" + currGroup.href() + "\">" + linkText + "</a>";
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
      calBuf.append(this.renderSkinAsString("calendarweek",weekParam));
   }
   // set day to last day of month and try to render next month
   // check what the last day of the month is
   calParam.back = this.renderLinkToPrevMonth(firstDayIndex,currMonth+"01",monthNames);
   calParam.forward = this.renderLinkToNextMonth(lastDayIndex,currMonth+"31",monthNames);
   calParam.calendar = calBuf.toString();
   this.renderSkin("calendar",calParam);
}


/**
 * macro renders age
 */
function age_macro(param) {
   res.write(Math.floor((new Date() - this.createtime) / 86400000));
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
   if (this.isNotPublic(session.user,req.data.memberlevel))
      return;
   if (!param.show)
      param.show = 5;
   var cnt = 0;
   var i = 0;
   while (cnt < param.show && this.lastmod.get(i)) {
      var item = this.lastmod.get(i++);
      if (!item.story || (item.story.online && item.story.discussions)) {
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
   var zones = java.util.TimeZone.getAvailableIDs();
   var options = new Array();
   var format = new java.text.DecimalFormat ("-0;+0");
   var currentZone = this.getTimeZone();
   for (var i in zones) {
      var zone = java.util.TimeZone.getTimeZone (zones[i]);
      options[i] = "GMT"+(format.format(zone.getRawOffset()/3600000))+"  ("+zones[i]+")";
      if (zones[i] == currentZone.getID())
         var selectedIndex = i;
   }
   renderDropDownBox("timezone",options,selectedIndex);
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
      return (getMessage("error","database",dbError));
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
      return (getMessage("error","database",dbError));
   var skinParam = new Object();
   while (rows.next()) {
      skinParam.count = rows.getColumnItem("COUNT");
      skinParam.referrer = rows.getColumnItem("ACCESSLOG_REFERRER");
      skinParam.text = skinParam.referrer.length > 50 ? skinParam.referrer.substring(0, 50) + "..." : skinParam.referrer;
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
  openLink(this.href("rss"));
  renderImage(img, param);
  closeLink();
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
   if (!this.stories.size() || !this.archive)
      return;
   var size = param.limit ? Math.min(this.size(),param.limit) : this.size();
   for (var i=0;i<size;i++) {
      var curr = this.get(i);
      var next = this.get(i+1);
      if (!next || next.groupname.substring(0,6) < curr.groupname.substring(0,6)) {
         res.write(param.itemprefix);
         openLink(curr.href());
         var ts = parseTimestamp(curr.groupname.substring(0,6),"yyyyMM");
         res.write(formatTimestamp(ts,param.format ? param.format : "MMMM yyyy"));
         closeLink();
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
