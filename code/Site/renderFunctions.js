/**
 * check if there are any stories in the previous month
 */

function renderLinkToPrevMonth(firstDayIndex,currentMonth) {

   var l = this.size();
   if (l == 0 || l <= firstDayIndex)
      return ("&nbsp;");

   var prevDay = this.get(firstDayIndex+1);
   if (prevDay && prevDay.groupname<currentMonth) {
      var date = parseTimestamp(prevDay.groupName, "yyyyMMdd");
      return ("<a href=\"" + prevDay.href() + "\">" + formatTimestamp(date,"MMMM") + "</a>");
   } else {
      return ("&nbsp;");
   }
}


/**
 * check if there are any stories in the previous month
 */

function renderLinkToNextMonth(lastDayIndex,currentMonth) {
   var l = this.size();
   if (l == 0 || lastDayIndex == 0)
      return ("&nbsp;");

   var nextDay = this.get(lastDayIndex-1);
   if (nextDay && nextDay.groupname>currentMonth) {
      var date = parseTimestamp(nextDay.groupName, "yyyyMMdd");
      return ("<a href=\"" + nextDay.href() + "\">" + formatTimestamp(date,"MMMM") + "</a>");
   } else {
      return ("&nbsp;");
   }
}


/**
 * function renders the list of stories for site-(front-)pages
 * and assigns the rendered list to res.data.storylist
 * scrollnavigation-links to previous and next page(s) are also
 * assigned to res.data (res.data.prevpage, res.data.nextpage)
 * using this separate renderFunction instead of doing the stuff
 * in storylist_macro() was necessary for completely independent
 * placement of the prevpage- and nextpage-links
 * @param Int Index-position to start with
 */

function renderStorylist(day) {
   if (this.allstories.size() == 0) {
      res.data.storylist = this.renderSkinAsString("welcome");
      return;
   }
   var size = this.size();
   var idx = 0;

   // if no day is specified, start with today. we may need 
   // to search for today's entries (or the latest entry 
   // before today) because there may be stories posted for 
   // future days. (HW)
   var startdayString = day;
   if (!startdayString)
      startdayString = formatTimestamp(new Date(), "yyyyMMdd");

   var startday = this.get(startdayString);
   if (startday && startday.size()>0) {
      idx = this.contains(startday);
   } else {
      // loop through days until we find a day less or equal than 
      // the one we're looking for.
      for (var i=0; i<size; i++) {
         if (startdayString >= this.get(i).groupname) {
            this.get(i).prefetchChildren();
            idx = i;
            break;
         }
      }
   }
   var days = parseInt(this.days,10) ? parseInt(this.days,10) : 2;
   days = Math.min (days, 14);  // render 14 days max
   this.prefetchChildren(idx, days);

   // only display "newer stories" if we are actually browsing the archive, 
   // and the day parameter has been explicitly specified, 
   // i.e. suppress the link if we are on the home page and there are 
   // stories on future days. (HW)
   if (idx > 0 && day) {
      var sp = new Object();
      var prev = this.get (Math.max(0, idx-days));
      sp.url = this.href() + "?day=" + prev.groupname;
      sp.text = "newer stories";
      res.data.prevpage = renderSkinAsString("prevpagelink",sp);
   }
   days = Math.min(days++,this.size());
   var dayCnt = 0;
   res.data.storylist = "";
   while (dayCnt < days && idx < size) {
      var day = this.get(idx++);
      // init var for incrementing daycounter
      var count = false;
      for (var i=0;i<day.size();i++) {
         var st = day.get(i);
         if (this.isStoryOnline(st)) {
            res.data.storylist += st.renderSkinAsString("preview");
            count = true;
         }
      }
      // only increment daycounter if day contains a story
      // that is online in site
      if (count)
         dayCnt++;
   }
   if (idx < size) {
      var sp = new Object();
      var next = this.get (idx);
      sp.url = this.href() + "?day=" + next.groupname;
      sp.text = "older stories";
      res.data.nextpage = renderSkinAsString("nextpagelink",sp);
   }
   return;
}
