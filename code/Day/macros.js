/**
 * macro rendering storylist for this day
 * but check if story is online ...
 * if not, we only display it when user is also allowed to edit this story!
 */

function storylist_macro() {
   for (var i=0;i<this.size();i++) {
      if (this.get(i).isOnline())
         this.get(i).renderSkin("preview");
   }
}

