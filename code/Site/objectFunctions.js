/**
 * check if there are any stories in the previous month
 */

function renderLinkToPrevMonth(cal) {
   // create Object used to pass to format-function
   var tsParam = new Object();
   tsParam.format = "MMMM";

   if (!this.size())
      return ("&nbsp;");
   if (parseInt(this.get(this.size()-1).groupname,10) < parseInt(cal.getTime().format("yyyyMMdd"),10)) {
      // there are any stories left back in history, so try to get them ...
      prevDay = false;
      while (!prevDay) {
         cal.add(java.util.Calendar.DATE,-1);
         if (this.get(cal.getTime().format("yyyyMMdd")))
            prevDay = this.get(cal.getTime().format("yyyyMMdd"));
      }
      return ("<a href=\"" + prevDay.href() + "\">" + this.formatTimestamp(cal.getTime(),tsParam) + "</a>");
   } else {
      return ("&nbsp;");
   }
}


/**
 * check if there are any stories in the previous month
 */

function renderLinkToNextMonth(cal) {
   // create Object used to pass to format-function
   var tsParam = new Object();
   tsParam.format = "MMMM";

   if (!this.size())
      return ("&nbsp;");
   if (parseInt(this.get(0).groupname,10) > parseInt(cal.getTime().format("yyyyMMdd"),10)) {
      // there are any stories, so try to get them ...
      nextDay = false;
      while (!nextDay) {
         cal.add(java.util.Calendar.DATE,1);
         if (this.get(cal.getTime().format("yyyyMMdd")))
            nextDay = this.get(cal.getTime().format("yyyyMMdd"));
      }
      return ("<a href=\"" + nextDay.href() + "\">" + this.formatTimestamp(cal.getTime(),tsParam) + "</a>");
   } else {
      return ("&nbsp;");
   }
}

/**
 * function saves new properties of weblog
 */

function updateWeblog() {
   this.title = req.data.title;
   this.tagline = req.data.tagline;
   this.bgcolor = req.data.bgcolor;
   this.textfont = req.data.textfont;
   this.textsize = req.data.textsize;
   this.textcolor = req.data.textcolor;
   this.linkcolor = req.data.linkcolor;
   this.alinkcolor = req.data.alinkcolor;
   this.vlinkcolor = req.data.vlinkcolor;
   this.titlefont = req.data.titlefont;
   this.titlesize = req.data.titlesize;
   this.titlecolor = req.data.titlecolor;
   this.days = parseInt(req.data.days,10);
   this.online = parseInt(req.data.online,10);
   this.discussions = parseInt(req.data.discussions,10);
   this.usercontrib = parseInt(req.data.usercontrib,10);
   this.usersignup = parseInt(req.data.usersignup,10);
   this.archive = parseInt(req.data.archive,10);
   this.language = req.data.language ? req.data.language.substring(0,2).toLowerCase() : "";
   this.country = req.data.country ? req.data.country.substring(0,2).toUpperCase() : "";
   this.dateformat = req.data.dateformat;
   this.birthdate = this.checkdate("birthdate");
   res.message = "The changes were saved successfully!";
   res.redirect(this.href());
}

/**
 * function takes postdate of story, checks it and
 * returns Date-object
 */

function checkdate(prefix) {
   if (req.data[prefix + "Year"] && req.data[prefix + "Month"] && req.data[prefix + "Date"] && req.data[prefix + "Hours"] && req.data[prefix + "Minutes"]) {
      var pd = new Date();
      pd.setYear(parseInt(req.data[prefix + "Year"],10));
      pd.setMonth(parseInt(req.data[prefix + "Month"],10));
      pd.setDate(parseInt(req.data[prefix + "Date"],10));
      pd.setHours(parseInt(req.data[prefix + "Hours"],10));
      pd.setMinutes(parseInt(req.data[prefix + "Minutes"],10));
      return (pd);
   } else
      return (new Date());
}

/**
 * function returns true if discussions are enabled
 * for this weblog
 */

function hasDiscussions() {
   if (parseInt(this.discussions,10))
      return true;
   return false;
}

/**
 * function returns true if weblog is online
 * otherwise false
 */

function isOnline() {
   if (parseInt(this.online,10))
      return true;
   return false;
}

/**
 * function returns true if signup is enabled
 * otherwise false
 */

function userMaySignup() {
   if (parseInt(this.usersignup,10))
      return true;
   return false;
}


/**
 * function creates the directory that will contain the images of this weblog
 */

function createImgDirectory() {
   var dir = new File(getProperty("imgPath") + this.alias + "/");
   return (dir.mkdir());
}

/**
 * function adds a new member-object for this weblog
 */

function createMember(userLvl) {
   var newMember = new member();
   newMember.weblog = this;
   newMember.user = user;
   newMember.username = user.name;
   if (userLvl)
      newMember.level = userLvl;
   else {
      // we start with a default level of "normal user"
      newMember.level = 0;
   }
   newMember.createtime = new Date();
   this.members.add(newMember);
   return;
}

/**
 * check if a signup attempt is ok
 */

function evalSignup() {
   if (this.members.get(user.name)) {
      res.message = "You are already a member of this weblog!";
      res.redirect(this.href());
   }
   var signup = new member();
   if (req.data.email) {
      if (req.data.email != user.email) {
         if (!checkEmail(req.data.email)) {
            res.message = "Your eMail-address is invalid!";
            return (signup);
         } else
            user.email = req.data.email;
      }
      this.createMember();
      res.message = this.title + " welcomes you as a member! Have fun!";
      res.redirect(this.href());
   }
}

/**
 * function checks if language and/or country was specified for this weblog
 * if true, it returns the timestamp formatted with the given locale
 */

function formatTimestamp(ts,param) {
   if (param.format)
      var fmt = param.format;
   else if (this.dateformat)
      var fmt = this.dateformat;
   else
      var fmt = "yyyy/MM/dd HH:mm";
   var sdf = new java.text.SimpleDateFormat(fmt,this.getLocale());
   return(sdf.format(ts));
}

/**
 * function checks if language and country were specified
 * for this weblog. if so, it returns a Locale-object
 * otherwise false
 */

function getLocale() {
   if (this.language && this.country)
      return (new java.util.Locale(this.language,this.country));
   else
      return (java.util.Locale.getDefault());
}
