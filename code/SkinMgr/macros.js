/**
 * list the (most important) macros
 * available for a specific skin
 */
function macros_macro(param) {
   if (!param.proto) {
      if (!req.data.key)
         return;
      var parts = req.data.key.split(".");
      param.proto = parts[0];
   }

   if (!param.itemprefix)
      param.itemprefix = "";
   if (!param.itemsuffix)
      param.itemsuffix = "<br />";

   var renderMacroList = function(proto) {
      var macrolist = app.data.macros[proto]
      var handler = "";
      if (proto != "global")
         handler = proto + ".";
      for (var i in macrolist) {
         var macro = macrolist[i];
         res.push();
         res.encode("<% ");
         res.write(handler);
         res.write(macro.name);
         res.encode(" %>");
         var str = res.pop();
         res.write(param.itemprefix);
         if (macro.storyid > 0)
            Html.link({href: HELP.macros._url + macro.storyid}, str);
         else
            res.write(str);
         res.write(param.itemsuffix);
      }
      return;
   }

   renderMacroList(param.proto);
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
   var macros = HELP.skins[parts[0]][parts[1]];
   for (var i in macros) {
      res.encode("<% ");
      res.write(macros[i]);
      res.encode(" %>");
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
   options.sort(function(a, b) {return (a.display.charCodeAt(0) - b.display.charCodeAt(0)); });
   Html.dropDown({name: "prototype"}, options, null, "--- select a prototype ---");
}
