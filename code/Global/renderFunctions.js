/**
 * renders image element
 * @param img Object contains the images's properties
 * @param param Object contains user-defined properties
 */
function renderImage(img, param) {
   if (!param.title)
      param.title = img.alttext ? encode(img.alttext) : "";
   param.src = img.getStaticUrl();
   if (!param.width)
      param.width = img.width;
   if (!param.height)
      param.height = img.height;
   if (!param.border)
      param.border = "0";
   param.alt = encode(param.description ? param.description : img.alttext);
   Html.tag("img", param);
   return;
}


/**
 * function tries to check if the color contains just hex-characters
 * if so, it returns the color-definition prefixed with a '#'
 * otherwise it assumes the color is a named one
 */
function renderColorAsString(c) {
   if (c && c.length == 6 && c.isHexColor())
      return("#" + c);
   return(c);
}

/**
 * renders a color as hex or named string
 */
function renderColor(c) {
   res.write(renderColorAsString(c));
}


/**
 * Do Wiki style substitution, transforming
 * stuff contained between asterisks into links.
 */
function doWikiStuff (src) {
   // robert, disabled: didn't get the reason for this:
   // var src= " "+src;
   if (src == null || !src.contains("<*"))
      return src;

   // do the Wiki link thing, <*asterisk style*>
   var regex = new RegExp ("<[*]([^*]+)[*]>");
   regex.ignoreCase=true;
   
   var text = "";
   var start = 0;
   while (true) {
      var found = regex.exec (src.substring(start));
      var to = found == null ? src.length : start + found.index;
      text += src.substring(start, to);
      if (found == null)
         break;
      var name = ""+(new java.lang.String (found[1])).trim();
      var item = res.handlers.site.topics.get (name);
      if (item == null && name.lastIndexOf("s") == name.length-1)
         item = res.handlers.site.topics.get (name.substring(0, name.length-1));
      if (item == null || !item.size())
         text += format(name)+" <small>[<a href=\""+res.handlers.site.stories.href("create")+"?topic="+escape(name)+"\">define "+format(name)+"</a>]</small>";
      else
         text += "<a href=\""+item.href()+"\">"+name+"</a>";
      start += found.index + found[1].length+4;
   }
   return text;
}


/**
 * function renders a dropdown-box containing all available
 * locales
 * @param Obj Locale-Object to preselect
 */

function renderLocaleChooser(loc) {
   var locs = java.util.Locale.getAvailableLocales();
   var options = new Array();
   // get the defined locale of this site for comparison
   for (var i in locs)
      options[i] = new Array(locs[i], locs[i].getDisplayName());
   Html.dropDown("locale", options, loc ? loc.toString() : null);
}


/**
 * function renders a dropdown-box for choosing dateformats
 * @param String String indicating version of dateformat to use:
 *               "short" - short date format
 *               "long" - long date format
 * @param Obj Locale object (java.util.Locale)
 * @param Obj String Pattern to preselect
 */
function renderDateformatChooser(version, locale, selectedValue) {
   var patterns = (version == "shortdateformat" ? SHORTDATEFORMATS : LONGDATEFORMATS);
   var now = new Date();
   var options = new Array();
   for (var i in patterns) {
      var sdf = new java.text.SimpleDateFormat(patterns[i], locale);
      options[i] = [encodeForm(patterns[i]), sdf.format(now)];
   }
   Html.dropDown(version, options, selectedValue);
}


/**
 * function renders a dropdown-box for choosing timezones
 * @param Obj Timezone object (java.util.TimeZone)
 */
function renderTimeZoneChooser(tz) {
   var zones = java.util.TimeZone.getAvailableIDs();
   var options = new Array();
   var format = new java.text.DecimalFormat ("-0;+0");
   for (var i in zones) {
      var zone = java.util.TimeZone.getTimeZone(zones[i]);
      options[i] = [zones[i], "GMT" + (format.format(zone.getRawOffset()/3600000)) + " (" + zones[i] + ")"];
   }
   Html.dropDown("timezone", options, tz ? tz.getID() : null);
}