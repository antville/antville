/**
 * macro rendering source of skin
 */

function skin_macro(param) {
   if (param.as == "editor")
      renderInputTextarea(this.createInputParam("skin",param));
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
   var macros = new Object();
   macros["global"] = ref.getProperty("global");
   var hopjectMacros = ref.getProperty("hopobject");
   macros["root"] = ref.getProperty("root");
   macros[proto] = (proto == "global") ? null : ref.getProperty(proto);
   macros[proto] += hopjectMacros ? ","+hopjectMacros : "";
   macros.resOrParam = ref.getProperty(proto+"."+skin);
   //macros.response = ref.getProperty(proto+"."+skin+".response");
   var re = new RegExp(" *, *");
   re.global = true;
   for (var protoName in macros) {
      if (!macros[protoName])
         continue;
      macros[protoName] = macros[protoName].replace(re, ",");
      var macroNames = macros[protoName].split(",");
      macroNames.sort();
      for (var n in macroNames) {
         var url = null;
         if (protoName != "resOrParam") // && protoName != "res")
            url = ref.getProperty(protoName+"."+macroNames[n]);
         if (url)
            openLink(helpUrl + url);
         res.encode("<% ");
         if (protoName != "global" && protoName != "resOrParam")
            res.write(protoName+".");
         res.write(macroNames[n]);
         res.encode(" %>");
         if (url)
            closeLink();
         renderMarkupElement("br");
      }
      renderMarkupElement("br");
   }
}
