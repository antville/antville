/**
 * function renders the list of stories for day-pages
 * and assigns the rendered list to res.data.storylist
 * scrollnavigation-links to previous and next page(s) are also
 * assigned to res.data (res.data.prevpage, res.data.nextpage)
 * using this separate renderFunction instead of doing the stuff
 * in storylist_macro() was necessary for completely independent
 * placement of the prevpage- and nextpage-links
 * @param Int Index-position to start with
 * @param String String indicating what kind of stories to show
 */

function renderStorylist(idx,show) {
   var size = this.size();
   if (isNaN (idx)|| idx > size-1)
      idx = 0;
   var cnt = 0;
   var max = Math.min (10, size);

   if (idx > 0) {
      var sp = new Object();
      sp.url = this.href() + "?start=" + Math.max(0, idx-10) + (show ? "&show=" + show : "");
      sp.text = "newer stories";
      res.data.prevpage = renderSkinAsString("prevpagelink",sp);
   }

   var storylist = new java.lang.StringBuffer();
   while (cnt < max && idx < size) {
      var render = true;
      var st = this.get(idx);
      if (show == "offline" && st.online)
         render = false;
      else if (show == "mystories" && st.creator != session.user)
         render = false;
      if (render) {
         var sp = new Object();
         sp.story = st.renderSkinAsString("listitem");
         if (st.online)
            storylist.append(this.renderSkinAsString("onlinestory",sp));
         else
            storylist.append(this.renderSkinAsString("offlinestory",sp));
         cnt++;
      }
      idx++;
   }
   if (idx < size) {
      var sp = new Object();
      sp.url = this.href() + "?start=" + idx + (show ? "&show=" + show : "");
      sp.text = "older stories";
      res.data.nextpage = renderSkinAsString("nextpagelink",sp);
   }
   res.data.storylist = storylist.toString();
   return;
}