/**
 * function checks if a link to the given group makes sense
 */
 
function renderCalendarDay(currGroupname,text) {
   var now = new Date();
   var currGroup = this.get(currGroupname);
   if (currGroup && currGroup.size()) {
      if (user == this.owner)
         var linkit = true;
      else {
         var linkit = false;
         if (currGroupname <= now.format("yyyyMMdd")) {
            for (var i=0;i<currGroup.size();i++) {
               if (currGroup.get(i).isOnline())
                  linkit = true;
            }
         }
      }
      if (linkit) {
         var text = "<A HREF=\"" + this.href("main") + "?show=" + currGroupname + "\">" + text + "</A>";
         /*
         if (!req.data.show && currGroupname == now.format("yyyyMMdd"))
            text = "<B>" + text + "</B>";
         else if (req.data.show && req.data.show == currGroupname)
            text = "<B>" + text + "</B>";
         */
      }
   }
   return (text);
}


/**
 * function renders an image
 */

function renderImage(param) {
   if (param.linkto)
      this.openLink(param);
   var img = this.images.get(param.name);
   if (img) {
      res.write("<IMG SRC=\"" + getProperty("imgUrl") + this.alias + "/" + img.filename + "." + img.fileext + "\"");
      res.write(" WIDTH=\"" + (param.width ? param.width : img.width) + "\"");
      res.write(" HEIGHT=\"" + (param.height ? param.height : img.height) + "\"");
      res.write(" ALT=\"" + (param.alttext ? param.alttext : img.alttext) + "\"");
      if (param.align)
         res.write(" ALIGN=\"" + param.align + "\"");
      if (param.valign)
         res.write(" VALIGN=\"" + param.valign + "\"");
      res.write(" BORDER=\"" + (param.border ? param.border : 0) + "\">");
   }
   if (param.linkto)
      this.closeLink(param);
}