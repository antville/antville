/**
 * function renders a single day, either as link if there are
 * any stories online, or as plain text
 */

function renderCalendarDay(currGroupname,text) {
   if (text < 10)
      text = "&nbsp;"+text+"&nbsp;";
   var currGroup = this.get(currGroupname);
   var linkit = false;
   if (currGroup && currGroup.size()) {
      linkit = false;
      for (var i=0;i<currGroup.size();i++) {
         var st = currGroup.get(i);
         if (this.isStoryOnline(st)) {
            linkit = true;
            break;
         }
      }
      if (linkit)
         var text = "<a href=\"" + currGroup.href() + "\">" + text + "</a>";
   }
   return (text);
}


/**
 * function renders the list of stories for weblog-(front-)pages
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
            idx = i;
            break;
         }
      }
   }
   var days = parseInt(this.days,10) ? parseInt(this.days,10) : 2;

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
      // that is online in weblog
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
