/**
 * render a dropdown containing the available shareable system layouts
 * (this method also checks if any of the system layouts is already
 * in the chain of the selected layout, just to prevent a loop
 * between two layouts)
 * @see layoutmgr/renderParentLayoutChooser
 * @param Object collection to work on
 * @param Object current Layout
 * @param String String to display as first option
 */
function renderParentLayoutChooser(selLayout) {
   var size = this.size();
   var parents = null;
   var selected = null;
   var options = [];
   for (var i=0;i<size;i++) {
      var l = this.get(i);
      var parents = l.getParents();
      if (!selLayout || (l != selLayout && !parents.containsKey(selLayout._id)))
         options.push({value: l.alias, display: l.title});
   }
   if (selLayout && selLayout.parent)
      selected = selLayout.parent.alias;
   Html.dropDown({name: "layout"}, options, selected, "--- choose a basis layout ---");
   return;
}
