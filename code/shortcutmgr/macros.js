/**
 * function renders a list of shortcuts
 */

function shortcutlist_macro(param) {
   var skin = param.as == "editor" ? "edit" : "main";
   delete param.as;
   for (var i=0; i<this.size(); i++) {
      param.id = i;
      this.get(i).renderSkin(skin, param);
   }
}
