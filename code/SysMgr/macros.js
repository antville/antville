/**
 * macro renders a dropdown-box using renderDropDownBox()
 */

function dropdown_macro(param) {
   if (!param.name || !param.values)
      return;
   var options = param.values.split(",");
   var selectedIndex = req.data[param.name];
   renderDropDownBox(param.name,options,selectedIndex);
}
