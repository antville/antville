/**
 * function renders a single day, either as link if there are
 * any stories online, or as plain text
 */

function renderCalendarDay(currGroupname,text) {
   text = "&nbsp;"+text+"&nbsp;";
   var currGroup = this.get(currGroupname);
   var linkit = false;
   if (currGroup && currGroup.size()) {
      linkit = false;
      for (var i=0;i<currGroup.size();i++) {
         var st = currGroup.get(i);
         if (this.isStoryOnline(st)) {
            linkit = true;
            break;
         }
      }
      if (linkit)
         var text = "<a href=\"" + currGroup.href() + "\">" + text + "</a>";
   }
   return (text);
}
