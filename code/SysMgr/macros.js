/**
 * macro renders a dropdown-box
 */

function dropdown_macro(param) {
   if (!param.name || !param.values)
      return;
   var options = param.values.split(",");
   var selectedIndex = req.data[param.name];
   Html.dropDown(param.name,options,selectedIndex);
}
