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
         var text = "<a href=\"" + this.href("main") + "?show=" + currGroupname + "\">" + text + "</a>";
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


/**
 * function checks if language and/or country was specified for this weblog
 * if true, it renders the timestamp with the given locale
 */

function formatTimestamp(ts,param) {
   if (param.format)
      var fmt = param.format;
   else
      var fmt = "yyyy/MM/dd HH:mm";
   if (this.language && this.country) {
      var loc = new java.util.Locale(this.language,this.country);
      var sdf = new java.text.SimpleDateFormat(fmt,loc);
   } else
      var sdf = new java.text.SimpleDateFormat(fmt);
   res.write(sdf.format(ts));
}