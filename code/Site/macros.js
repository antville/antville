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
         res.write(this.title);
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
   res.write(param.prefix)
   if (param.as == "editor")
      this.renderInputText(this.createInputParam("tagline",param));
   else
      res.write(this.tagline);
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
 * macro rendering usersignup-flag of weblog
 */

function usermaysignup_macro(param) {
   res.write(param.prefix)
   if (param.as == "editor")
      this.renderInputCheckbox(this.createInputParam("usersignup",param));
   else
      res.write(parseInt(this.usersignup,10) ? "yes" : "no");
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
 * macro rendering language of weblog
 */

function language_macro(param) {
   res.write(param.prefix)
   if (param.as == "editor")
      this.renderInputText(this.createInputParam("language",param));
   else
      res.write(this.language);
   res.write(param.suffix);
}

/**
 * macro rendering country of weblog
 */

function country_macro(param) {
   res.write(param.prefix)
   if (param.as == "editor")
      this.renderInputText(this.createInputParam("country",param));
   else
      res.write(this.country);
   res.write(param.suffix);
}

/**
 * macro rendering default dateformat of weblog
 */

function dateformat_macro(param) {
   res.write(param.prefix)
   if (param.as == "editor")
      this.renderInputText(this.createInputParam("dateformat",param));
   else
      res.write(this.dateformat);
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
   if (this.isUserAdmin())
      this.renderSkin("adminnavigation");
   else if (this.isUserContributor())
      this.renderSkin("contribnavigation");
   else
      this.renderSkin("usernavigation");
}


/**
 * macro rendering storylist, but checks if story is online ...
 */

function storylist_macro() {
   if (this.size() > 0) {
      var days = parseInt(this.days,10) ? parseInt(this.days,10) : 2;
      if (days > this.size())
         days = this.size();
      for (var i=0;i<days;i++) {
         for (var j=0;j<this.get(i).size();j++) {
            var currStory = this.get(i).get(j);
            if (currStory.isOnline())
               currStory.renderSkin("preview");
         }
      }
   } else
      this.renderSkin("welcome");
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
   if (path.day) {
      var reqYear = parseInt(path.day.groupname.substring(0,4),10);
      var reqMonth = parseInt(path.day.groupname.substring(4,6),10) - 1;
      cal.set(java.util.Calendar.YEAR,reqYear);
      cal.set(java.util.Calendar.MONTH,reqMonth);
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
            if (path.day && currGroupname == path.day.groupname)
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
 * macro renders the list of all members of this weblog
 */

function memberlist_macro(param) {
   res.write(param.prefix)
   for (var i=0;i<this.members.size();i++)
      this.members.get(i).renderSkin("preview");
   res.write(param.suffix);
}


/**
 * macro renders a list of recentyl added/updated stories/comments
 * of this weblog
 */

function history_macro(param) {
   res.write(param.prefix);
   var x = new Array(nr);
   var len1 = this.allstories.count();
   var len2 = this.allcomments.count();
   var nr = parseInt(param.show,10) ? parseInt(param.show,10) : 5;
   if (nr > len1+len2) nr = len1+len2;
   var c1 = 0;
   var c2 = 0;
   var cnt = 0;
   while (cnt < nr) {
      if (c1 >= this.allstories.count())
         x[cnt] = this.allcomments.get(c2++);
      else if (c2 >= this.allcomments.count())
         x[cnt] = this.allstories.get(c1++);
      else {
         var s = this.allstories.get(c1);
         var c = this.allcomments.get(c2);
         var t1 = (s.modifytime) ? s.modifytime : s.createtime;
         var t2 = (c.modifytime) ? c.modifytime : c.createtime;
         if (t2 > t1)
            x[cnt] = this.allcomments.get(c2++);
         else
            x[cnt] = this.allstories.get(c1++);
      }
      if (x[cnt].isOnline())
         cnt++;
   }
   for (var j in x)
      x[j].renderSkin("historyview");
   res.write(param.suffix);
}


/**
 * macro checks if this weblog is online or offline
 */

function onlinestatus_macro(param) {
   res.write(param.prefix);
   if (!this.isOnline())
      res.write("private");
   else
      res.write("public");
   res.write(param.suffix);
}

/**
 * macro renders a link to signup if user is not member of this weblog
 * if user is member, it displays the level of membership
 */

function membership_macro(param) {
   res.write(param.prefix);
   var ms = this.members.get(user.name);
   if (ms) {
      res.write("You&nbsp;are&nbsp;");
      ms.renderLvl();
      res.write("&nbsp;of " + this.title);
   } else {
      var linkParam = new Object();
      linkParam.to = "signup";
      this.openLink(linkParam);
      res.write("sign up");
      this.closeLink();
      res.write("&nbsp;to&nbsp;" + this.title);
   }
   res.write(param.suffix);
}

/**
 * renders a list of most read pages, ie. a link
 * to a story followed by the read counter.
 */

function listMostRead_macro() {
  var str = "";
  var len = this.mostread.size();
  var max = 25;
  var lim = len > max ? max : len;
  for (var i=0; i<lim; i++) {
    var s = this.mostread.get(i);
    str += s.renderSkinAsString("mostread");
  }
  return(str);
}
