/**
 * macro rendering title
 */
function title_macro(param) {
  if (param.as == "editor")
    renderInputText(this.createInputParam("title", param));
  else {
    if (param && param.linkto) {
      openLink(this.href(param.linkto));
      if (this.title && this.title.trim())
        res.write(stripTags(this.title));
      else
        res.write("<i>[untitled]</i>");
      closeLink();
    }
    else
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
 * macro rendering modifytime
 */
function modifytime_macro(param) {
   if (this.modifytime)
      res.write(formatTimestamp(this.modifytime,param.format));
   return;
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
    res.write(parseInt(this.discussions,10) ? "yes" : "no");
}


/**
 * macro rendering usercontrib-flag
 */
function usermaycontrib_macro(param) {
  if (param.as == "editor")
    renderInputCheckbox(this.createInputParam("usercontrib",param));
  else
    res.write(parseInt(this.usercontrib,10) ? "yes" : "no");
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
    res.write(parseInt(this.archive,10) ? "yes" : "no");
}


/**
 * macro rendering enableping-flag
 */
function enableping_macro(param) {
  if (param.as == "editor")
    renderInputCheckbox(this.createInputParam("enableping",param));
  else
    res.write(parseInt(this.enableping,10) ? "yes" : "no");
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
   var membership = this.isUserMember(session.user);
   if (!param["for"] || param["for"] == "contributors") {
      if (this.userMayContrib() || (membership && membership.level >= getContributorLvl()))
         this.renderSkin("contribnavigation");
   }
   if (!param["for"] || param["for"] == "admins") {
      if (membership && membership.level == getAdminLvl())
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
   if (!this.allstories.size() || !this.showArchive())
      return;
   // define variables needed in this function
   var calParam = new Object();
   calParam.calendar = "";
   var dayParam = new Object();
   var weekParam = new Object();
   // create new calendar-object and set day to first day of month
   var cal = new java.util.GregorianCalendar(this.getTimeZone(), this.getLocale());
   cal.set(java.util.Calendar.DATE,1);
   // check whether there's a day or a story in path
   // if so, use it to determine the month to render
   if (path.story)
      var today = path.story.day;
   else if (path.day)
      var today = path.day.groupname;
   if (today) {
      var todayDate = parseTimestamp(today,"yyyyMMdd");
      cal.set(java.util.Calendar.YEAR,todayDate.getFullYear());
      cal.set(java.util.Calendar.MONTH,todayDate.getMonth());
   }
   // cal is now a calendar object set to the first day of the month
   // we want to render

   // nr. of empty days in rendered calendar before the first day of month appears
   var pre = (7-cal.getFirstDayOfWeek()+cal.get(java.util.Calendar.DAY_OF_WEEK)) % 7;
   var days = cal.getActualMaximum(java.util.Calendar.DATE);
   var weeks = Math.ceil((pre + days) / 7);
   var daycnt = 1;

   calParam.month = formatTimestamp(cal.getTime(),"MMMM");

   calParam.year = cal.getTime().format("yyyy");
   // create link to previous month if needed
   calParam.back = this.renderLinkToPrevMonth(cal.clone());

   // render header-row of calendar
   weekParam.week = "";
   var calHead = cal.clone();
   var firstDayOfWeek = cal.getFirstDayOfWeek();
   for (var i=0;i<7;i++) {
      calHead.set(java.util.Calendar.DAY_OF_WEEK, firstDayOfWeek + i);
      dayParam.day = formatTimestamp(calHead.getTime(),"EE");
      weekParam.week += this.renderSkinAsString("calendardayheader",dayParam);
   }
   calParam.calendar += this.renderSkinAsString("calendarweek",weekParam);

   // pre-render the year and month so we only have to append the days as we loop
   var currMonth = formatTimestamp(cal.getTime(), "yyyyMM");
   // simply loop through days
   var currDay = 1;

   for (var i=0;i<weeks;i++) {
      weekParam.week = "";
      for (var j=0;j<7;j++) {
         dayParam.useskin = "calendarday";
         if ((i == 0 && j < pre) || daycnt > days)
            dayParam.day = "&nbsp;";
         else {
            var currGroupname = currMonth+currDay.format("00");
            dayParam.day = this.renderCalendarDay(currGroupname, currDay);
            if (currGroupname == today)
               dayParam.useskin = "calendarselday";
            currDay++;
            daycnt++;
         }
         weekParam.week += this.renderSkinAsString(dayParam.useskin, dayParam);
      }
      calParam.calendar += this.renderSkinAsString("calendarweek",weekParam);
   }
   // set day to last day of month and try to render next month
   // check what the last day of the month is
   cal.set(java.util.Calendar.DATE, cal.getActualMaximum(java.util.Calendar.DATE));
   calParam.forward = this.renderLinkToNextMonth(cal);
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
 * macro renders a list of recentyl added/updated stories/comments
 * of this site
 */
function history_macro(param) {
   if (this.isNotPublic(session.user) && !this.isUserMember(session.user))
      return;
   if (!param.show)
      param.show = 5;
   var cnt = 0;
   var i = 0;
   while (cnt < param.show && this.allcontent.get(i)) {
      var item = this.allcontent.get(i++);
      if (!item.story || (item.story.isOnline() && item.story.hasDiscussions())) {
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
  var str = "";
  var storyList = this.mostread.list();
  storyList.sort(this.sortMostReads);
  var len = storyList.length;
  var max = 25;
  var lim = Math.min(max, len); //len > max ? max : len;
  var param = new Object();
  for (var i=0; i<lim; i++) {
    var s = storyList[i];
    if (s.cache.reads > 0) {
      s.reads += s.cache.reads;
      s.cache.reads = 0;
    }
    param.reads = s.reads; // + s.cache.reads;
    param.rank = i+1;
    str += s.renderSkinAsString("mostread", param);
  }
  return(str);
}


/**
 * renders a list of referrers, ie. a link
 * to a url together with the read counter et al.
 */
function listReferrers_macro() {
  var str = "";
  var c = getDBConnection("antville");
  var dbError = c.getLastError();
  if (dbError)
    return (getMsg("error","database",dbError));
  // we're doing this with direct db access here
  // (there's no need to do it with prototypes):
  var d = new Date(new Date() - 1000 * 60 * 60 * 24); // 24 hours ago
  var query = "select *, count(*) as \"COUNT\" from AV_ACCESSLOG where ACCESSLOG_F_SITE = " + this._id + " and ACCESSLOG_DATE > '" + d.format("yyyy-MM-dd HH:mm:ss") + "' group by ACCESSLOG_REFERRER order by \"COUNT\" desc, ACCESSLOG_REFERRER asc;";
  var rows = c.executeRetrieval(query);
  var dbError = c.getLastError();
  if (dbError)
    return (getMsg("error","database",dbError));
  var param = new Object();
  while (rows.next()) {
    param.count = rows.getColumnItem("COUNT");
    // these two lines are necessary only for hsqldb connections:
    // 2002-06-08: but oops! this does NOT work with mysql, again...
    // (so i commented them out as i think hsqldb is abandoned, anyway)
    // if (param.count == 0);
    //    continue;
    param.referrer = rows.getColumnItem("ACCESSLOG_REFERRER");
    param.text = param.referrer.length > 50 ? param.referrer.substring(0, 50) + "..." : param.referrer;
    str += this.renderSkinAsString("referrerItem", param);
  }
  rows.release();
  return(str);
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
   if (!this.stories.size() || !this.showArchive())
      return;
   var size = param.limit ? Math.min(this.size(),param.limit) : this.size();
   for (var i=0;i<size;i++) {
      var curr = this.get(i);
      var next = this.get(i+1);
      if (!next || next.groupname.substring(0,6) < curr.groupname.substring(0,6)) {
         res.write(param.itemprefix);
         openLink(curr.href());
         res.write(parseTimestamp(curr.groupname.substring(0,6),"yyyyMM").format(param.format ? param.format : "MMMM yyyy"));
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