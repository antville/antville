/**
 * function checks if a link to the given group makes sense
 */

function renderCalendarDay(currGroupname,text) {
   var currGroup = this.get(currGroupname);
   var linkit = false;
   if (currGroup && currGroup.size()) {
      if (this.isUserAdmin())
         linkit = true;
      else {
         linkit = false;
         for (var i=0;i<currGroup.size();i++) {
            var st = currGroup.get(i);
            if (st.isOnline() || st.isViewAllowed()) {
               linkit = true;
               break;
            }
         }
      }
      if (linkit) {
         var text = "<a href=\"" + currGroup.href() + "\">" + text + "</a>";
      }
   }
   return (text);
}
