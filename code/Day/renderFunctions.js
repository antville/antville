/**
 * function renders the list of stories for day-pages
 * and assigns the rendered list to res.data.storylist
 * scrollnavigation-links to previous and next page(s) are also
 * assigned to res.data (res.data.prevpage, res.data.nextpage)
 * prevpage- and nextpage-links always link to the previous
 * or next day
 */

function renderStorylist() {
   var dayIdx = path.weblog.contains(this);
   if (dayIdx > 0) {
      var sp = new Object();
      sp.url = path.weblog.get(path.weblog.contains(this)-1).href();
      res.data.prevpage = renderSkinAsString("prevpagelink",sp);
   }
   res.data.storylist = "";
   for (var i=0;i<this.size();i++) {
      var st = this.get(i);
      if (this.isStoryOnline(st))
         res.data.storylist += st.renderSkinAsString("preview");
   }
   // assigning link to previous page to res.data.prevpage
   if (dayIdx < path.weblog.size()-1) {
      var sp = new Object();
      sp.url = path.weblog.get(path.weblog.contains(this)+1).href();
      res.data.nextpage = renderSkinAsString("nextpagelink",sp);
   }
   return;
}