/**
 * list the (most important) macros
 * available for a specific skin of a
 * prototype (except Global)
 * @see this.globalmacros_macro
 * FIXME: needs improvement
 */
function macros_macro(param) {
   this.renderMacroList(param);
   return;
}


/**
 * list macros available in a global
 * skin of a prototype
 * @see this.macros_macro
 * FIXME: needs improvement
 */
function globalmacros_macro(param) {
   param.proto = "Global";
   param.includeGlobal = true;
   this.renderMacroList(param);
   return;
}


/**
 * list skin-specific macros (param, 
 * response etc.) of a skin
 */
function skinmacros_macro(param) {
   if (!req.data.key)
      return;
   var parts = req.data.key.split(".");
   if (!HELP.skins[parts[0]])
      return;
   if (!HELP.skins[parts[0]][parts[1]])
      return;
   var macros = HELP.skins[parts[0]][parts[1]];
   macros.sort();
   if (!param.itemprefix)
      param.itemprefix = "";
   if (!param.itemsuffix)
      param.itemsuffix = "<br />";
   for (var i in macros) {
      res.write(param.itemprefix);
      res.encode("<% ");
      res.write(macros[i]);
      res.encode(" %>");
      res.write(param.itemsuffix);
   }
   return;
}


/**
 * renders a dropdown containing available
 * prototypes
 */
function prototypechooser_macro(param) {
   var options = [];
   for (var i in app.skinfiles)
      options.push({value: i, display: i});
   options.sort(function(a, b) {return a.display.charCodeAt(0) - b.display.charCodeAt(0); });
   var firstOption = param.firstOption ?  param.firstOption : getMessage("prototypeChooser.firstOption");
   Html.dropDown({name: "prototype"}, options, null, firstOption);
   return;
}
