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
   var max = Math.min(idx + 20, size);
   if (idx > 0) {
      var sp = new Object();
      sp.url = this.href() + "?start=" + Math.max(0, idx-20);
      sp.text = "previous images";
      res.data.prevpage = renderSkinAsString("prevpagelink",sp);
   }
   this.prefetchChildren(idx, 20);
   var imagelist = new java.lang.StringBuffer();
   for (var i=idx; i<max; i++)
      imagelist.append(this.get(i).renderSkinAsString("preview"));
   if (i < size) {
      var sp = new Object();
      sp.url = this.href() + "?start=" + i;
      sp.text = "more images";
      res.data.nextpage = renderSkinAsString("nextpagelink",sp);
   }
   res.data.imagelist = imagelist.toString();
   return;
}
