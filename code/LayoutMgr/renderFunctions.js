/**
 * check if a layout is default layout or not
 * and render the mgrlistitem view accordingly
 * @param Object layout object to render
 */
function renderManagerView(layout) {
   var sp = {layout: layout.renderSkinAsString("mgrlistitem")};
   this.renderSkin(layout.isDefaultLayout() ? "activelayout" : "inactivelayout", sp);
   return;
}

/**
 * render a dropdown containing shareable system layouts
 * @param Object current layout
 */
function renderParentLayoutChooser(selLayout) {
   var options = [];
   var size = root.layouts.shareable.size();
   for (var i=0;i<size;i++) {
      var l = root.layouts.shareable.get(i);
      options.push({value: l.alias, display: l.title});
   }
   var selected = null;
   if (selLayout && selLayout.parent)
      selected = selLayout.parent.alias;
   Html.dropDown({name: "layout"}, options, selected, "--- choose a basis layout ---");
   return;
}
