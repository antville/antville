/**
 * function renders the list of stories for day-pages
 * and assigns the rendered list to res.data.storylist
 * scrollnavigation-links to previous and next page(s) are also
 * assigned to res.data (res.data.prevpage, res.data.nextpage)
 * prevpage- and nextpage-links always link to the previous
 * or next day
 */

function renderStorylist() {
   var dayIdx = this._parent.contains(this);
   if (dayIdx > 0) {
      var sp = new Object();
      sp.url = this._parent.get(dayIdx - 1).href();
      sp.text = getMessage("Story.newerStories");
      res.data.prevpage = renderSkinAsString("prevpagelink", sp);
   }
   res.push();
   this.get(0).renderSkin("dayheader");
   for (var i=0;i<this.size();i++)
      this.get(i).renderSkin("preview");
   res.data.storylist = res.pop();
   // assigning link to previous page to res.data.prevpage
   if (dayIdx < this._parent.size()-1) {
      var sp = new Object();
      sp.url = this._parent.get(dayIdx + 1).href();
      sp.text = getMessage("Story.olderStories");
      res.data.nextpage = renderSkinAsString("nextpagelink", sp);
   }
   return;
}
