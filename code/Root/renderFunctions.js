/**
 * this function renders a list of sites
 * but first checks which collection to use
 * @param limit maximum amount of sites to be displayed
 * @param show set this to "all" to display all sites
 * @param scroll set this to "no" to hide prev/back links
 */
function renderSitelist(limit, show, scroll) {
   if (show && show == "all")
      var collection = root.publicSites;
   else
      var collection = root;
   
   var size = collection.size();
   if (!size)
      return;
   
   var idx = parseInt (req.data.start, 10);
   var scroll = (!scroll || scroll == "no" ? false : true);
   
   if (isNaN(idx) || idx > size-1 || idx < 0)
      idx = 0;
   if (scroll && idx > 0) {
      var sp = new Object();
      sp.url = root.href("list") + "?start=" + Math.max(0, idx-limit);
      sp.text = "previous weblogs";
      res.data.prevpage = renderSkinAsString("prevpagelink", sp);
   }

   var cnt = 0;
   var buf = new java.lang.StringBuffer();
   collection.prefetchChildren(idx, limit);
   while (cnt < limit && idx < size) {
      var w = collection.get(idx++);
      if (!w.blocked && w.online) {
         buf.append(w.renderSkinAsString("preview"));
         cnt++;
      }
   }
   res.data.sitelist = buf.toString();

   if (scroll && idx < size) {
      var sp = new Object();
      sp.url = root.href("list") + "?start=" + idx;
      sp.text = "more weblogs";
      res.data.nextpage = renderSkinAsString("nextpagelink", sp);
   }
   return;
}
