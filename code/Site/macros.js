/**
 * macro rendering title of weblog
 */

function title_macro(param) {
   renderPrefix(param);
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
   renderSuffix(param);
}

/**
 * macro rendering alias of weblog
 */

function alias_macro(param) {
   renderPrefix(param);
   if (param.as == "editor")
      this.renderInputText(this.createInputParam("alias",param));
   else
      res.write(this.alias);
   renderSuffix(param);
}

/**
 * macro rendering tagline of weblog
 */

function tagline_macro(param) {
   renderPrefix(param);
   if (param.as == "editor")
      this.renderInputText(this.createInputParam("tagline",param));
   else
      res.write(this.tagline);
   renderSuffix(param);
}

/**
 * macro rendering birthdate of weblog
 */

function birthdate_macro(param) {
   renderPrefix(param);
   if (param.as == "editor")
      this.renderDateDropdown(this.createInputParam("birthdate",param));
   else if (param.format)
      res.write(this.birthdate.format(param.format));
   else
      res.write(this.birthdate.format("yyyy.MM.dd HH:mm"));
   renderSuffix(param);
}

/**
 * macro rendering bgcolor of weblog
 */

function bgcolor_macro(param) {
   renderPrefix(param);
   if (param.as == "editor")
      this.renderInputText(this.createInputParam("bgcolor",param));
   else
      res.write(this.bgcolor);
   renderSuffix(param);
}

/**
 * macro rendering textfont of weblog
 */

function textfont_macro(param) {
   renderPrefix(param);
   if (param.as == "editor")
      this.renderInputText(this.createInputParam("textfont",param));
   else
      res.write(this.textfont);
   renderSuffix(param);
}

/**
 * macro rendering textsize of weblog
 */

function textsize_macro(param) {
   renderPrefix(param);
   if (param.as == "editor")
      this.renderInputText(this.createInputParam("textsize",param));
   else
      res.write(this.textsize);
   renderSuffix(param);
}

/**
 * macro rendering textcolor of weblog
 */

function textcolor_macro(param) {
   renderPrefix(param);
   if (param.as == "editor")
      this.renderInputText(this.createInputParam("textcolor",param));
   else
      res.write(this.textcolor);
   renderSuffix(param);
}

/**
 * macro rendering linkcolor of weblog
 */

function linkcolor_macro(param) {
   renderPrefix(param);
   if (param.as == "editor")
      this.renderInputText(this.createInputParam("linkcolor",param));
   else
      res.write(this.linkcolor);
   renderSuffix(param);
}

/**
 * macro rendering alinkcolor of weblog
 */

function alinkcolor_macro(param) {
   renderPrefix(param);
   if (param.as == "editor")
      this.renderInputText(this.createInputParam("alinkcolor",param));
   else
      res.write(this.alinkcolor);
   renderSuffix(param);
}

/**
 * macro rendering vlinkcolor of weblog
 */

function vlinkcolor_macro(param) {
   renderPrefix(param);
   if (param.as == "editor")
      this.renderInputText(this.createInputParam("vlinkcolor",param));
   else
      res.write(this.vlinkcolor);
   renderSuffix(param);
}

/**
 * macro rendering titlefont of weblog
 */

function titlefont_macro(param) {
   renderPrefix(param);
   if (param.as == "editor")
      this.renderInputText(this.createInputParam("titlefont",param));
   else
      res.write(this.titlefont);
   renderSuffix(param);
}

/**
 * macro rendering titlesize of weblog
 */

function titlesize_macro(param) {
   renderPrefix(param);
   if (param.as == "editor")
      this.renderInputText(this.createInputParam("titlesize",param));
   else
      res.write(this.titlesize);
   renderSuffix(param);
}

/**
 * macro rendering titlecolor of weblog
 */

function titlecolor_macro(param) {
   renderPrefix(param);
   if (param.as == "editor")
      this.renderInputText(this.createInputParam("titlecolor",param));
   else
      res.write(this.titlecolor);
   renderSuffix(param);
}

/**
 * macro rendering lastupdate of weblog
 */

function lastupdate_macro(param) {
   if (this.lastUpdate) {
      renderPrefix(param);
      if (param.format)
         res.write(this.lastupdate.format(param.format));
      else
         res.write(this.lastupdate.format("yyyy.MM.dd HH:mm"));
      renderSuffix(param);
   }
}

/**
 * macro rendering online-status of weblog
 */

function online_macro(param) {
   renderPrefix(param);
   if (param.as == "editor")
      this.renderInputCheckbox(this.createInputParam("online",param));
   else
      res.write(this.online ? "yes" : "no");
   renderSuffix(param);
}

/**
 * macro rendering discussion-flag of weblog
 */

function hasdiscussions_macro(param) {
   renderPrefix(param);
   if (param.as == "editor")
      this.renderInputCheckbox(this.createInputParam("discussions",param));
   else
      res.write(parseInt(this.discussions,10) ? "yes" : "no");
   renderSuffix(param);
}

/**
 * macro rendering nr. of days to show on weblog-fontpage
 */

function showdays_macro(param) {
   renderPrefix(param);
   if (param.as == "editor")
      this.renderInputText(this.createInputParam("days",param));
   else
      res.write(this.days);
   renderSuffix(param);
}

/**
 * macro rendering archive-flag of weblog
 */

function showarchive_macro(param) {
   renderPrefix(param);
   if (param.as == "editor")
      this.renderInputCheckbox(this.createInputParam("archive",param));
   else
      res.write(parseInt(this.archive,10) ? "yes" : "no");
   renderSuffix(param);
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
   if (this.owner == user) {
      // hey, this is the admin, so give him the admin-navigation
      this.renderSkin("adminnavigation");
   } else {
      // normal user, so we take the normal navigation
      this.renderSkin("usernavigation");
   }
}


/**
 * macro rendering storylist
 * but check if story is online ...
 * if not, we only display it when owner is viewing
 */

function storylist_macro() {
   if (this.size() > 0) {
      var idx = 0;
      var days = parseInt(this.days) ? parseInt(this.days) : 2;
      if (req.data.show) {
         var currGroup = this.get(req.data.show);
         if (currGroup) {
            idx = this.contains(currGroup);
            days = 1;
         }
      }
      for (var i=idx;i<idx + days;i++) {
         var currDay = this.get(i);
         if (currDay) {
            for (var j=0;j<currDay.size();j++) {
               var currStory = currDay.get(j);
               currStory.setParent(currDay);
               if (currStory.isOnline() || currStory.author == user)
                  currStory.renderSkin("preview");
            }
         }
      }
   } else
      this.renderSkin("welcome");
}



/**
 * macro renders a calendar
 */

function calendar_macro() {
   // define variables needed in this function
   var now = new Date();
   var calParam = new HopObject();
   calParam.calendar = "";
   var dayParam = new HopObject();
   var weekParam = new HopObject();
   
   // create new calendar-object
   var cal = new java.util.GregorianCalendar();
   cal.set(java.util.Calendar.DATE,1);
   if (req.data.show) {
      var reqYear = parseInt(req.data.show.substring(0,4),10);
      var reqMonth = parseInt(req.data.show.substring(4,6),10) - 1;
      if (reqYear && reqMonth) {
         cal.set(java.util.Calendar.YEAR,reqYear);
         cal.set(java.util.Calendar.MONTH,reqMonth);
      }
   }
   var lastDay = cal.getActualMaximum(java.util.Calendar.DATE);
   var startAt = cal.get(java.util.Calendar.DAY_OF_WEEK) - cal.getFirstDayOfWeek();
   var currMonth = cal.get(java.util.Calendar.MONTH);
   calParam.month = cal.getTime().format("MMMM");
   calParam.year = cal.getTime().format("yyyy");

   calParam.back = this.renderLinkToPrev(cal.clone());

   for (var i=0;i<Math.ceil((startAt + lastDay) / 7);i++) {
      weekParam.week = "";
      for (var j=0;j<7;j++) {
         if(i==0 && j<startAt) {
            dayParam.day = "&nbsp;";
         } else {
            if (cal.get(java.util.Calendar.MONTH) != currMonth) {
               dayParam.day = "&nbsp;";
            } else {
               var currGroupname = cal.getTime().format("yyyyMMdd");
               dayParam.day = this.renderCalendarDay(currGroupname,cal.get(java.util.Calendar.DATE));
            }
            // check which skin we should render
            if (req.data.show && cal.getTime().format("yyyyMMdd") == req.data.show)
               dayParam.useskin = "calendarselday";
            else
               dayParam.useskin = "calendarday";
            // render the link to next month (if it makes sense)
            if (cal.get(java.util.Calendar.DATE) == lastDay)
               calParam.forward = this.renderLinkToNext(cal.clone());
            cal.add(java.util.Calendar.DATE,1);
         }
         weekParam.week += this.renderSkinAsString((dayParam.useskin ? dayParam.useskin : "calendarday"),dayParam);
      }
      calParam.calendar += this.renderSkinAsString("calendarweek",weekParam);
   }
   this.renderSkin("calendar",calParam);
}

/**
 * macro renders age of weblog
 */

function age_macro(param) {
   if (this.birthdate) {
      renderPrefix(param);
      if (param && param.format)
         res.write(this.birthdate.format(param.format));
      else if (param && param.show.toLowerCase() == "days")
         res.write(Math.floor((new Date() - this.birthdate) / 86400000));
      else
         res.write(this.birthdate);
      renderSuffix(param);
   }
}


/**
 * macro renders an image out of image-pool
 * either as plain image or as image-link
 * overrideable parameters: width,height,alttext,border
 * additional parameters: align, valign
 */

function image_macro(param) {
   if (param && param.name) {
      renderPrefix(param);
      this.renderImage(param);
      renderSuffix(param);
   }
}