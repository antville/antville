/**
 * macro renders a dropdown-box
 */

function dropdown_macro(param) {
   if (!param.name || !param.values)
      return;
   var options = param.values.split(",");
   var selectedIndex = req.data[param.name];
   Html.dropDown({name: param.name},options,selectedIndex);
   return;
}

/**
 * macro checks if there are any modules present
 * and if they need to be included in the system setup page
 */
function moduleSetup_macro(param) {
   for (var i in app.modules)
      this.applyModuleMethod(app.modules[i], "renderSetup", param);
   return;
}
