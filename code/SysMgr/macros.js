/**
 * macro renders a dropdown-box using simpleDropDownBox()
 */

function dropdown_macro(param) {
   if (!param.name || !param.values)
      return;
   res.write(param.prefix);
   var options = param.values.split(",");
   var selectedIndex = req.data[param.name];
   res.write(simpleDropDownBox(param.name,options,selectedIndex));
   res.write(param.suffix);
}
