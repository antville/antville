/**
 * function renders the list of stories for day-pages
 * and assigns the rendered list to res.data.storylist
 * scrollnavigation-links to previous and next page(s) are also
 * assigned to res.data (res.data.prevpage, res.data.nextpage)
 * using this separate renderFunction instead of doing the stuff
 * in storylist_macro() was necessary for completely independent
 * placement of the prevpage- and nextpage-links
 * @param Int Index-position to start with
 */

function renderStorylist(idx) {
   var size = this.size();
   if (idx < 0 || isNaN (idx)|| idx > size-1)
      idx = 0;
   var max = Math.min (idx+10, size);
   this.prefetchChildren(idx, max);
   if (idx > 0) {
      var sp = new Object();
      sp.url = this.href() + "?start=" + Math.max(0, idx-10);
      sp.text = "previous page";
      res.data.prevpage = renderSkinAsString("prevpagelink", sp);
   }

   res.push();
   var day;
   while (idx < max) {
      var s = this.get(idx++);
      if (s.day != day) {
         s.renderSkin("dayheader");
         day = s.day;
      }
      s.renderSkin("preview");
   }
   res.data.storylist = res.pop();

   if (idx < size) {
      var sp = new Object();
      sp.url = this.href() + "?start=" + idx;
      sp.text = "next page";
      res.data.nextpage = renderSkinAsString("nextpagelink", sp);
   }
   return;
}
