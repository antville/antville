/**
 * render a dropdown containing available layouts
 */
function layoutchooser_macro(param) {
   var options = [];
   var size = this.size();
   for (var i=0;i<size;i++) {
      var l = this.get(i);
      options.push({value: l.alias, display: l.title});
   }
   Html.dropDown({name: "layout"}, options, param.selected, "--- choose a layout ---");
   return;
}
