/**
 * function renders a single day, either as link if there are
 * any stories online, or as plain text
 */

function renderCalendarDay(currGroupname,text) {
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

function renderStorylist(idx) {
   if (this.allstories.size() == 0) {
      res.data.storylist = this.renderSkinAsString("welcome");
      return;
   }
   var size = this.size();
   if (idx < 0 || isNaN (idx) || idx > size-1)
      idx = 0;
   var days = parseInt(this.days,10) ? parseInt(this.days,10) : 2;
   if (idx > 0) {
      var sp = new Object();
      sp.url = this.href() + "?start=" + Math.max(0, idx-days);
      sp.text = "older stories";
      res.data.prevpage = renderSkinAsString("prevpagelink",sp);
   }
   days = Math.min(days++,this.size());
   var dayCnt = 0;
   res.data.storylist = "";
   while (dayCnt < days && idx < size) {
      var day = this.get(idx++);
      for (var i=0;i<day.size();i++) {
         var st = day.get(i);
         if (this.isStoryOnline(st))
            res.data.storylist += st.renderSkinAsString("preview");
      }
      dayCnt++;
   }
   if (idx < size) {
      var sp = new Object();
      sp.url = this.href() + "?start=" + idx;
      sp.text = "newer stories";
      res.data.nextpage = renderSkinAsString("nextpagelink",sp);
   }
   return;
}