/**
 * check if there are any stories in the previous month
 */

function renderLinkToPrevMonth(firstDayIndex, currentMonth, monthNames) {
   var l = this.size();
   if (l == 0 || l <= firstDayIndex)
      return "&nbsp;";

   var prevDay = this.get(firstDayIndex + 1);
   if (prevDay && prevDay.groupname < currentMonth) {
      var month = prevDay.groupName.toString().substring(4, 6) - 1;
      return Html.linkAsString({href: prevDay.href()}, monthNames[month]);
   } else {
      return "&nbsp;";
   }
}


/**
 * check if there are any stories in the previous month
 */

function renderLinkToNextMonth(lastDayIndex, currentMonth, monthNames) {
   var l = this.size();
   if (l == 0 || lastDayIndex == 0)
      return "&nbsp;";

   var nextDay = this.get(lastDayIndex - 1);
   if (nextDay && nextDay.groupname > currentMonth) {
      var month = nextDay.groupName.toString().substring(4, 6) - 1;
      return Html.linkAsString({href: nextDay.href()}, monthNames[month]);
   } else {
      return "&nbsp;";
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
   var days = this.preferences.getProperty("days") ? this.preferences.getProperty("days") : 2;
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
      sp.text = getMessage("story.newerStories");
      res.data.prevpage = renderSkinAsString("prevpagelink", sp);
   }
   days = Math.min(idx + days++, this.size());
   res.push();
   while (idx < days) {
      var day = this.get(idx++);
      day.get(0).renderSkin("dayheader");
      for (var i=0;i<day.size();i++)
         day.get(i).renderSkin("preview");
   }
   res.data.storylist = res.pop();
   if (idx < size) {
      var sp = new Object();
      var next = this.get (idx);
      sp.url = this.href() + "?day=" + next.groupname;
      sp.text = getMessage("story.olderStories");
      res.data.nextpage = renderSkinAsString("nextpagelink", sp);
   }
   return;
}
