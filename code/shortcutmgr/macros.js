/**
 * function renders a list of shortcuts
 */

function shortcutlist_macro() {
   var param = new Object();
   for (var i=0; i<this.size(); i++) {
      param.id = i;
      this.get(i).renderSkin("main", param);
   }
}
