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
 * @param Obj Object containing the form values
 * @param Obj User-Object modifying this weblog
 * @return String Message indicating success
 */

function updateWeblog(param,modifier) {
   this.title = param.title;
   this.tagline = param.tagline;
   this.bgcolor = param.bgcolor;
   this.textfont = param.textfont;
   this.textsize = param.textsize;
   this.textcolor = param.textcolor;
   this.linkcolor = param.linkcolor;
   this.alinkcolor = param.alinkcolor;
   this.vlinkcolor = param.vlinkcolor;
   this.titlefont = param.titlefont;
   this.titlesize = param.titlesize;
   this.titlecolor = param.titlecolor;
   this.smallfont = param.smallfont;
   this.smallsize = param.smallsize;
   this.smallcolor = param.smallcolor;
   this.days = parseInt(param.days,10);
   this.online = parseInt(param.online,10);
   this.discussions = parseInt(param.discussions,10);
   this.usercontrib = parseInt(param.usercontrib,10);
   this.usersignup = parseInt(param.usersignup,10);
   this.archive = parseInt(param.archive,10);

   // store selected locale in this.language and this.country
   var locs = java.util.Locale.getAvailableLocales();
   var newLoc = locs[parseInt(param.locale,10)];
   if (!newLoc)
      newLoc = java.util.Locale.getDefault();
   this.country = newLoc.getCountry();
   this.language = newLoc.getLanguage();

   // long dateformat
   var patterns = getDefaultDateFormats();
   var ldf = patterns[parseInt(param.longdateformat,10)];
   this.longdateformat = ldf ? ldf : null;

   // short dateformat
   var patterns = getDefaultDateFormats("short");
   var ldf = patterns[parseInt(param.shortdateformat,10)];
   this.shortdateformat = ldf ? ldf : null;

   // this.birthdate = this.checkdate(param,"birthdate");
   this.modifytime = new Date();
   this.modifier = modifier;
   return ("The changes were saved successfully!");
}

/**
 * function takes postdate of story, checks it and
 * returns Date-object
 */

function checkdate(param,prefix) {
   if (param[prefix + "Year"] && param[prefix + "Month"] && param[prefix + "Date"] && param[prefix + "Hours"] && param[prefix + "Minutes"]) {
      var pd = new Date();
      pd.setYear(parseInt(param[prefix + "Year"],10));
      pd.setMonth(parseInt(param[prefix + "Month"],10));
      pd.setDate(parseInt(param[prefix + "Date"],10));
      pd.setHours(parseInt(param[prefix + "Hours"],10));
      pd.setMinutes(parseInt(param[prefix + "Minutes"],10));
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
 * @param Obj User-object attempting to sign up to this weblog
 * @param Int Integer-value defining userlevel
 * @return Boolean true in any case ...
 */

function createMember(applicant,userLvl) {
   var newMember = new member();
   newMember.weblog = this;
   newMember.user = applicant;
   newMember.username = applicant.name;
   if (userLvl)
      newMember.level = userLvl;
   else {
      // we start with a default level of "normal user"
      newMember.level = 0;
   }
   newMember.createtime = new Date();
   this.members.add(newMember);
   return true;
}

/**
 * check if a signup attempt is ok
 * @param String email-address entered in form
 * @param Obj User-Object attempting to sign up to this weblog
 * @return Obj Object containing two properties:
 *             - error (boolean): true if error happened, false if everything went fine
 *             - message (String): containing a message to user
 */

function evalSignup(email,applicant) {
   var result = new Object();
   if (this.members.get(applicant.name)) {
      result.message = "You are already a member of this weblog!";
      result.error = true;
   }
   if (!email) {
      result.message = "Please specify your eMail-address!";
      result.error = true;
   } else if (email != applicant.email) {
      if (!checkEmail(email)) {
         result.message = "Your eMail-address is invalid!";
         result.error = true;
      } else
         applicant.email = email;
   }
   if (!result.error) {
      this.createMember(applicant);
      result.message = this.title + " welcomes you as a member! Have fun!";
      result.error = false;
   }
   return (result);
}

/**
 * function checks if language and/or country was specified for this weblog
 * if true, it returns the timestamp formatted with the given locale
 */

function formatTimestamp(ts,param) {
   var fmt = "yyyy/MM/dd HH:mm";
   if (param.format == "short")
      fmt = this.shortdateformat ? this.shortdateformat : "dd.MM HH:mm";
   else if (param.format == "long")
      fmt = this.longdateformat ? this.longdateformat : "yyyy/MM/dd HH:mm";
   else if (param.format)
      fmt = param.format;
   var sdf = new java.text.SimpleDateFormat(fmt,this.getLocale());
   var result = tryEval("sdf.format(ts)");
   if (result.error)
      return ("[error: wrong date-format]");
   return (result.value);
}

/**
 * function checks if language and country were specified
 * for this weblog. if so, it returns a Locale-object
 * otherwise false
 */

function getLocale() {
   if (this.language)
      return (new java.util.Locale(this.language,this.country ? this.country : ""));
   else
      return (java.util.Locale.getDefault());
}


/**
 * helper function to sort story reads
 * @param Obj story a to be compared with story b
 * @param Obj story b to be compared with story a
 * @return Integer -1: a>b; 1: a<b; 0: a=b
 */
function sortMostReads(s1, s2) {
	var s1reads = s1.reads + s1.cache.reads;
	var s2reads = s2.reads + s2.cache.reads;
	if (s1reads > s2reads)
		return(-1);
	else if (s1reads < s2reads)
		return(1);
	else
		return(0);
}
