/**
 * function renders the list of images 
 * and assigns the rendered list to res.data.imagelist
 * scrollnavigation-links to previous and next page(s) are also
 * assigned to res.data (res.data.prevpage, res.data.nextpage)
 * using this separate renderFunction instead of doing the stuff
 * in images_macro() was necessary for completely independent
 * placement of the prevpage- and nextpage-links
 * @param Int Index-position to start with
 */

function renderImagelist(idx) {
   var size = this.size();
   if (isNaN (idx)|| idx > size-1)
      idx = 0;
   var max = Math.min(idx + 10, size);
   if (idx > 0) {
      var sp = new Object();
      sp.url = this.href() + "?start=" + Math.max(0, idx-10);
      sp.text = "previous images";
      res.data.prevpage = renderSkinAsString("prevpagelink",sp);
   }
   res.data.imagelist = "";
   for (var i=idx; i<max; i++)
      res.data.imagelist += this.get(i).renderSkinAsString("preview");
   if (i < size) {
      var sp = new Object();
      sp.url = this.href() + "?start=" + i;
      sp.text = "more images";
      res.data.nextpage = renderSkinAsString("nextpagelink",sp);
   }
   return;
}