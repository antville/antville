/**
 * Set the layout with the alias passed as argument
 * to the default root layout
 */
function setDefaultLayout(alias) {
   var l = root.layouts.get(alias);
   if (root.sys_layout != l)
      root.sys_layout = l;
   return;
}
