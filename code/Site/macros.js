/**
 * macro rendering title of weblog
 */

function title_macro(param) {
   res.write(param.prefix)
   if (param.as == "editor")
      this.renderInputText(this.createInputParam("title",param));
   else {
      if (param && param.linkto) {
         this.openLink(param);
         if (this.title)
            res.write(stripTags(this.title));
         else
            res.write("[untitled weblog]");
         this.closeLink(param);
      } else
         res.write(this.title);
   }
   res.write(param.suffix);
}

/**
 * macro rendering alias of weblog
 */

function alias_macro(param) {
   res.write(param.prefix)
   if (param.as == "editor")
      this.renderInputText(this.createInputParam("alias",param));
   else
      res.write(this.alias);
   res.write(param.suffix);
}

/**
 * macro rendering tagline of weblog
 */

function tagline_macro(param) {
   if (!this.tagline && param.as != "editor")
      return;
   res.write(param.prefix)
   if (param.as == "editor")
      this.renderInputText(this.createInputParam("tagline",param));
   else if (this.tagline)
      res.write(stripTags(this.tagline));
   res.write(param.suffix);
}

/**
 * macro rendering birthdate of weblog
 */

function birthdate_macro(param) {
   res.write(param.prefix)
   if (param.as == "editor")
      this.renderDateDropdown(this.createInputParam("birthdate",param));
   else if (param.format)
      res.write(this.birthdate.format(param.format));
   else
      res.write(this.birthdate.format("yyyy.MM.dd HH:mm"));
   res.write(param.suffix);
}

/**
 * macro rendering email of weblog
 */

function email_macro(param) {
   res.write(param.prefix)
   if (param.as == "editor")
      this.renderInputText(this.createInputParam("email",param));
   else
      res.write(this.email);
   res.write(param.suffix);
}

/**
 * macro rendering bgcolor of weblog
 */

function bgcolor_macro(param) {
   res.write(param.prefix)
   if (param.as == "editor")
      this.renderInputText(this.createInputParam("bgcolor",param));
   else
      renderColor(this.bgcolor);
   res.write(param.suffix);
}

/**
 * macro rendering textfont of weblog
 */

function textfont_macro(param) {
   res.write(param.prefix)
   if (param.as == "editor")
      this.renderInputText(this.createInputParam("textfont",param));
   else
      res.write(this.textfont);
   res.write(param.suffix);
}

/**
 * macro rendering textsize of weblog
 */

function textsize_macro(param) {
   res.write(param.prefix)
   if (param.as == "editor")
      this.renderInputText(this.createInputParam("textsize",param));
   else
      res.write(this.textsize);
   res.write(param.suffix);
}

/**
 * macro rendering textcolor of weblog
 */

function textcolor_macro(param) {
   res.write(param.prefix)
   if (param.as == "editor")
      this.renderInputText(this.createInputParam("textcolor",param));
   else
      renderColor(this.textcolor);
   res.write(param.suffix);
}

/**
 * macro rendering linkcolor of weblog
 */

function linkcolor_macro(param) {
   res.write(param.prefix)
   if (param.as == "editor")
      this.renderInputText(this.createInputParam("linkcolor",param));
   else
      renderColor(this.linkcolor);
   res.write(param.suffix);
}

/**
 * macro rendering alinkcolor of weblog
 */

function alinkcolor_macro(param) {
   res.write(param.prefix)
   if (param.as == "editor")
      this.renderInputText(this.createInputParam("alinkcolor",param));
   else
      renderColor(this.alinkcolor);
   res.write(param.suffix);
}

/**
 * macro rendering vlinkcolor of weblog
 */

function vlinkcolor_macro(param) {
   res.write(param.prefix)
   if (param.as == "editor")
      this.renderInputText(this.createInputParam("vlinkcolor",param));
   else
      renderColor(this.vlinkcolor);
   res.write(param.suffix);
}

/**
 * macro rendering titlefont of weblog
 */

function titlefont_macro(param) {
   res.write(param.prefix)
   if (param.as == "editor")
      this.renderInputText(this.createInputParam("titlefont",param));
   else
      res.write(this.titlefont);
   res.write(param.suffix);
}

/**
 * macro rendering titlesize of weblog
 */

function titlesize_macro(param) {
   res.write(param.prefix)
   if (param.as == "editor")
      this.renderInputText(this.createInputParam("titlesize",param));
   else
      res.write(this.titlesize);
   res.write(param.suffix);
}

/**
 * macro rendering titlecolor of weblog
 */

function titlecolor_macro(param) {
   res.write(param.prefix)
   if (param.as == "editor")
      this.renderInputText(this.createInputParam("titlecolor",param));
   else
      renderColor(this.titlecolor);
   res.write(param.suffix);
}

/**
 * macro rendering smallfont of weblog
 */

function smallfont_macro(param) {
   res.write(param.prefix)
   if (param.as == "editor")
      this.renderInputText(this.createInputParam("smallfont",param));
   else
      res.write(this.smallfont);
   res.write(param.suffix);
}

/**
 * macro rendering smallfont-size of weblog
 */

function smallsize_macro(param) {
   res.write(param.prefix)
   if (param.as == "editor")
      this.renderInputText(this.createInputParam("smallsize",param));
   else
      res.write(this.smallsize);
   res.write(param.suffix);
}

/**
 * macro rendering smallfont-color of weblog
 */

function smallcolor_macro(param) {
   res.write(param.prefix)
   if (param.as == "editor")
      this.renderInputText(this.createInputParam("smallcolor",param));
   else
      renderColor(this.smallcolor);
   res.write(param.suffix);
}

/**
 * macro rendering lastupdate of weblog
 */

function lastupdate_macro(param) {
   res.write(param.prefix)
   if (!this.lastupdate) {
      res.write("no updates so far");
   } else
      res.write(this.formatTimestamp(this.lastupdate,param));
   res.write(param.suffix);
}

/**
 * macro rendering createtime of weblog
 */

function createtime_macro(param) {
   res.write(param.prefix)
   res.write(this.formatTimestamp(this.createtime,param));
   res.write(param.suffix);
}

/**
 * macro rendering modifytime of weblog
 */

function modifytime_macro(param) {
   if (this.modifytime) {
      res.write(param.prefix)
      res.write(res.write(this.formatTimestamp(this.modifytime,param)));
      res.write(param.suffix);
   }
}

/**
 * macro rendering online-status of weblog
 */

function online_macro(param) {
   res.write(param.prefix)
   if (param.as == "editor")
      this.renderInputCheckbox(this.createInputParam("online",param));
   else
      res.write(this.online ? "yes" : "no");
   res.write(param.suffix);
}

/**
 * macro renders the url to this weblog
 */

function url_macro(param) {
   res.write(param.prefix);
   res.write(this.href());
   res.write(param.suffix);
}

/**
 * macro rendering discussion-flag of weblog
 */

function hasdiscussions_macro(param) {
   res.write(param.prefix)
   if (param.as == "editor")
      this.renderInputCheckbox(this.createInputParam("discussions",param));
   else
      res.write(parseInt(this.discussions,10) ? "yes" : "no");
   res.write(param.suffix);
}

/**
 * macro rendering usercontrib-flag of weblog
 */

function usermaycontrib_macro(param) {
   res.write(param.prefix)
   if (param.as == "editor")
      this.renderInputCheckbox(this.createInputParam("usercontrib",param));
   else
      res.write(parseInt(this.usercontrib,10) ? "yes" : "no");
   res.write(param.suffix);
}

/**
 * macro rendering nr. of days to show on weblog-fontpage
 */

function showdays_macro(param) {
   res.write(param.prefix)
   if (param.as == "editor")
      this.renderInputText(this.createInputParam("days",param));
   else
      res.write(this.days);
   res.write(param.suffix);
}

/**
 * macro rendering archive-flag of weblog
 */

function showarchive_macro(param) {
   res.write(param.prefix)
   if (param.as == "editor")
      this.renderInputCheckbox(this.createInputParam("archive",param));
   else
      res.write(parseInt(this.archive,10) ? "yes" : "no");
   res.write(param.suffix);
}

/**
 * macro rendering enableping-flag of weblog
 */

function enableping_macro(param) {
   res.write(param.prefix)
   if (param.as == "editor")
      this.renderInputCheckbox(this.createInputParam("enableping",param));
   else
      res.write(parseInt(this.enableping,10) ? "yes" : "no");
   res.write(param.suffix);
}

/**
 * macro rendering default longdateformat of weblog
 */

function longdateformat_macro(param) {
   res.write(param.prefix)
   if (param.as == "chooser")
      this.renderDateformatChooser("long");
   else if (param.as == "editor")
      this.renderInputText(this.createInputParam("longdateformat",param));
   else
      res.write(this.longdateformat);
   res.write(param.suffix);
}

/**
 * macro rendering default shortdateformat of weblog
 */

function shortdateformat_macro(param) {
   res.write(param.prefix)
   if (param.as == "chooser")
      this.renderDateformatChooser("short");
   else if (param.as == "editor")
      this.renderInputText(this.createInputParam("shortdateformat",param));
   else
      res.write(this.shortdateformat);
   res.write(param.suffix);
}

/**
 * macro rendering loginStatus of user
 * valid params:  -  loginSkin
 *                -  logoutSkin
 */

function loginstatus_macro(param) {
   if (user.uid)
      this.members.renderSkin("statusloggedin");
   else if (getActionName() != "login")
      this.members.renderSkin("statusloggedout");
}


/**
 * macro rendering two different navigation-skins
 * depending on user-status & rights
 */

function navigation_macro(param) {
   this.renderSkin("usernavigation");
   if (!user.uid)
      return;
   var membership = this.isUserMember(user);
   if (this.userMayContrib() || (membership && membership.level >= getContributorLvl()))
      this.renderSkin("contribnavigation");
   if (membership && membership.level == getAdminLvl())
      this.renderSkin("adminnavigation");
}


/**
 * macro writes storylist to response-object
 * kept for backwards-compatibility only
 */

function storylist_macro(param) {
   res.write(param.prefix)
   res.write(res.data.storylist);
   res.write(param.suffix)
   return;
}



/**
 * macro renders a calendar
 * version 2
 */

function calendar_macro(param) {
   // do nothing if there is not a single story :-))
   // or if archive of this weblog is disabled
   if (!this.size() || !this.showArchive())
      return;
   // define variables needed in this function
   var tsParam = new Object();
   var calParam = new Object();
   calParam.calendar = "";
   var dayParam = new Object();
   var weekParam = new Object();
   // create new calendar-object and set day to first day of month
   var cal = new java.util.GregorianCalendar(this.getLocale());
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

   tsParam.format = "MMMM";
   calParam.month = this.formatTimestamp(cal.getTime(),tsParam);

   calParam.year = cal.getTime().format("yyyy");
   // create link to previous month if needed
   calParam.back = this.renderLinkToPrevMonth(cal.clone());

   // render header-row of calendar
   weekParam.week = "";
   var calHead = cal.clone();
   // define the formatting of calendar
   tsParam.format = "EE";
   var firstDayOfWeek = cal.getFirstDayOfWeek();
   for (var i=0;i<7;i++) {
      calHead.set(java.util.Calendar.DAY_OF_WEEK, firstDayOfWeek + i);
      dayParam.day = this.formatTimestamp(calHead.getTime(),tsParam);
      weekParam.week += this.renderSkinAsString("calendardayheader",dayParam);
   }
   calParam.calendar += this.renderSkinAsString("calendarweek",weekParam);

   // pre-render the year and month so we only have to append the days as we loop
   var currMonth = cal.getTime().format("yyyyMM");
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
 * macro renders age of weblog
 */

function age_macro(param) {
   if (this.birthdate) {
      res.write(param.prefix)
      if (param && param.format)
         res.write(this.birthdate.format(param.format));
      else if (param && param.show.toLowerCase() == "days")
         res.write(Math.floor((new Date() - this.birthdate) / 86400000));
      else
         res.write(this.birthdate);
      res.write(param.suffix);
   }
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
 * macro renders the number of members of this weblog
 */

function membercounter_macro(param) {
   res.write(param.prefix)
   res.write(this.members.size());
   res.write(param.suffix);
}

/**
 * macro renders a list of recentyl added/updated stories/comments
 * of this weblog
 */

function history_macro(param) {
   if (this.isNotPublic(user) && !this.isUserMember(user))
      return;
   res.write(param.prefix);
   var max = parseInt(param.show,10) ? parseInt(param.show,10) : 5;
   max = Math.min(max,this.allcontent.size());
   for (var i=0;i<max;i++)
      this.allcontent.get(i).renderSkin("historyview");
   res.write(param.suffix);
}


/**
 * macro renders a list of available locales as dropdown
 */

function localechooser_macro(param) {
   res.write(param.prefix);
   var locs = java.util.Locale.getAvailableLocales();
   var options = new Array();
   // get the defined locale of this weblog for comparison
   var loc = this.getLocale();
   for (var i in locs) {
      options[i] = locs[i].getDisplayName();
      if (locs[i].equals(loc))
         var selectedIndex = i;
   }
   res.write(simpleDropDownBox("locale",options,selectedIndex));
   res.write(param.suffix);
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
	error = c.getLastError();
	if (error)
		return("Error establishing DB connection: " + error);

	// we're doing this with direct db access here
	// (there's no need to do it with prototypes):
  var d = new Date(new Date() - 1000 * 60 * 60 * 24); // 24 hours ago
	var query = "select *, count(*) as \"COUNT\" from ACCESS where WEBLOG_ID = " + this._id + " and DATE > '" + d.format("yyyy-MM-dd HH:mm:ss") + "' group by REFERRER order by \"COUNT\" desc, REFERRER asc;";
	var rows = c.executeRetrieval(query);
	error = c.getLastError();
	if (error)
		return("Error executing SQL query: " + error);
	
	var param = new Object();
	while (rows.next()) {
		param.count = rows.getColumnItem("COUNT");
    // these two lines are necessary only for hsqldb connections:
    if (param.count == 0);
      continue;
		param.referrer = rows.getColumnItem("REFERRER");
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

function xmlbutton_macro() {
	var param = new Object();
	param.to = this.href("rss10");
	param.name = "xmlbutton";
  var img = root.images.get(param.name);
	if (!img)
  	return;
	this.openLink(param);
	root.renderImage(img, param);
	this.closeLink();
}
