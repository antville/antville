/**
 * function checks if a link to the given group makes sense
 */

function renderCalendarDay(currGroupname,text) {
   var now = new Date();
   var currGroup = this.get(currGroupname);
   var linkit = false;
   if (currGroup && currGroup.size()) {
      if (this.isUserAdmin())
         linkit = true;
      else {
         linkit = false;
         if (currGroupname <= now.format("yyyyMMdd")) {
            for (var i=0;i<currGroup.size();i++) {
               var st = currGroup.get(i);
               if (st.isOnline() || st.isViewAllowed()) {
                  linkit = true;
                  break;
               }
            }
         }
      }
      if (linkit) {
         var text = "<a href=\"" + currGroup.href() + "\">" + text + "</a>";
      }
   }
   return (text);
}

/**
 * function renders image-tag
 */

function renderImage(img,param) {
   res.write("<img src=\"" + getProperty("imgUrl") + this.alias + "/" + img.filename + "." + img.fileext + "\"");
   res.write(" width=\"" + (param.width ? param.width : img.width) + "\"");
   res.write(" height=\"" + (param.height ? param.height : img.height) + "\"");
   res.write(" alt=\"" + (param.alttext ? param.alttext : img.alttext) + "\"");
   if (param.align)
      res.write(" align=\"" + param.align + "\"");
   if (param.valign)
      res.write(" valign=\"" + param.valign + "\"");
   res.write(" border=\"" + (param.border ? param.border : 0) + "\">");
}


