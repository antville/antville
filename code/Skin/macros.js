/**
 * macro rendering source of skin
 */

function skin_macro(param) {
   if (param.as == "editor")
      Html.textArea(this.createInputParam("skin", param));
   else
      res.write(this.skin);
}


/**
 * macro showing the most important macros
 * available for a specific skin
 */

function help_macro(param) {
   var proto = req.data.proto;
   var skin = req.data.name;
   var ref = app.data.macros;
   var helpUrl = ref.getProperty("_url");

   // building an object for the various macro types 
   var macros = new Object();
   macros["global"] = ref.getProperty("global.macros");
   var hopjectMacros = ref.getProperty("hopobject.macros");
   macros["root"] = ref.getProperty("root.macros");
   // no prototype for global macros
   macros[proto] = (proto == "global") ? null : ref.getProperty(proto + ".macros");
   // merge the hopobject's stuff with the prototype's
   macros[proto] += hopjectMacros ? "," + hopjectMacros : "";
   macros.resOrParam = ref.getProperty(proto + ".skin." + skin);

   var re = new RegExp(" *, *", "g");
   for (var protoName in macros) {
      if (!macros[protoName])
         continue;
      // remove spaces before or after a colon
      macros[protoName] = macros[protoName].replace(re, ",");
      // now transform the string into an array
      var macroNames = macros[protoName].split(",");
      macroNames.sort();
      for (var n in macroNames) {
         var url = null;
         // don't try to get a url for response or param macros
         if (protoName != "resOrParam") {
            if (protoName != "global")
               // first try to get a help url from hopobject
               url = ref.getProperty("hopobject.macro."+macroNames[n]);
            if (!url)
               // if it's not in hopobject maybe it's in the prototype
               url = ref.getProperty(protoName+".macro."+macroNames[n]);
         }

         // if a url is available render an html link
         if (url)
            Html.openLink(helpUrl + url);
         res.encode("<% ");
         // show the prototype's name if not global, response or param
         if (protoName != "global" && protoName != "resOrParam")
            res.write(protoName+".");
         res.write(macroNames[n]);
         res.encode(" %>");
         if (url)
            Html.closeLink();
         Html.tag("br");
      }
      Html.tag("br");
   }
}
