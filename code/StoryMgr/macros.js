/**
 * macro renders a list of stories
 */

function storylist_macro(param) {
   res.write(param.prefix)
   var show = req.data.show;
   var size = this.size();
   var idx = parseInt (req.data.start,10);
   if (isNaN (idx)|| idx > size-1)
      idx = 0;
   var cnt = 0;
   var max = Math.min (10, size);

   if (idx > 0)
      res.write ("...&nbsp;<a href='"+this.href()+"?start="+Math.max(0, idx-10) + (show ? "&show=" + show : "") + "'>newer stories</a><br>");

   while (cnt < max && idx < size) {
      var render = true;
      var st = this.get(idx);
      if (show == "offline" && st.isOnline())
         render = false;
      else if (show == "mystories" && s.author != user)
         render = false;
      if (render) {
         var sp = new Object();
         sp.story = st.renderSkinAsString("listitem");
         if (st.isOnline())
            this.renderSkin("onlinestory",sp);
         else
            this.renderSkin("offlinestory",sp);
         cnt++;
      }
      idx++;
   }
   if (idx < size)
      res.write ("<br><a href='"+this.href()+"?start=" + idx + (show ? "&show=" + show : "") + "'>older stories</a>&nbsp;...");
   res.write(param.suffix);
}
