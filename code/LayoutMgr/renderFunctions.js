/**
 * check if a layout is default layout or not
 * and render the listitem view accordingly
 * @param Object layout object to render
 */
function renderManagerView(layout) {
   var sp = {layout: layout.renderSkinAsString("listitem")};
   if (layout.isDefaultLayout())
      return this.renderSkinAsString("activelayout", sp);
   return this.renderSkinAsString("inactivelayout", sp);
}
