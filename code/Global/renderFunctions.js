/**
 * renders image element
 * @param img Object contains the images's properties
 * @param param Object contains user-defined properties
 */
function renderImage(img, param) {
   if (!param.title)
      param.title = img.alttext ? encode(img.alttext) : "";
   param.src = img.getUrl();
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
   if (c && c.isHexColor())
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
   Html.dropDown({name: "locale"}, options, loc ? loc.toString() : null);
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
   Html.dropDown({name: version}, options, selectedValue);
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
      options[i] = [zones[i], "GMT" + (format.format(zone.getRawOffset()/ONEHOUR)) + " (" + zones[i] + ")"];
   }
   Html.dropDown({name: "timezone"}, options, tz ? tz.getID() : null);
}

/**
 * generic list render function. if the argument
 * "itemsPerPage" is given it renders a pagelist, otherwise
 * the *whole* collection will be rendered
 * @param Object collection to work on
 * @param Object either a string which is interpreted as name of a skin
 *               or a function to call for each item (the item is passed
 *               as argument)
 * @param Int Number of items per page
 * @param Object String or Integer representing the currently viewed page
 * @return String rendered list
 */
function renderList(collection, funcOrSkin, itemsPerPage, pageIdx) {
   var currIdx = 0;
   var stop = size = collection.size();

   if (itemsPerPage) {
      var totalPages = Math.ceil(size/itemsPerPage);
      if (isNaN(pageIdx) || pageIdx > totalPages || pageIdx < 0)
         pageIdx = 0;
      currIdx = pageIdx * itemsPerPage;
      stop = Math.min(currIdx + itemsPerPage, size);
   }
   var isFunction = (funcOrSkin instanceof Function) ? true : false;
   res.push();
   while (currIdx < stop) {
      var item = collection.get(currIdx);
      isFunction ? funcOrSkin(item) : item.renderSkin(funcOrSkin);
      currIdx++;
   }
   return res.pop();
}

/**
 * render pagewise-navigationbar
 * @param Object collection to work on (either HopObject or Array)
 * @param String url of action to link to
 * @param String Number of items on one page
 * @param Int currently viewed page index
 * @return String rendered Navigationbar
 */
function renderPageNavigation(collection, url, itemsPerPage, pageIdx) {
   var maxItems = 10;
   var size = (collection instanceof Array) ? collection.length : collection.size();
   var lastPageIdx = Math.ceil(size/itemsPerPage)-1;
   // if we have just one page, there's no need for navigation
   if (lastPageIdx <= 0)
      return null;

   // init parameter object
   var param = new Object();
   var pageIdx = parseInt(pageIdx, 10);
   // check if the passed page-index is correct
   if (isNaN(pageIdx) || pageIdx > lastPageIdx || pageIdx < 0)
      pageIdx = 0;
   param.display = ((pageIdx*itemsPerPage) +1) + "-" + (Math.min((pageIdx*itemsPerPage)+itemsPerPage, size));
   param.total = size;

   // render the navigation-bar
   res.push();
   if (pageIdx > 0)
      renderPageNavItem("prev", "pageNavItem", url, pageIdx-1);
   var offset = Math.floor(pageIdx/maxItems)*maxItems;
   if (offset > 0)
      renderPageNavItem("[..]", "pageNavItem", url, offset-1);
   var currPage = offset;
   var stop = Math.min(currPage + maxItems, lastPageIdx+1);
   while (currPage < stop) {
      if (currPage == pageIdx)
         renderPageNavItem("[" + (currPage +1) + "]", "pageNavSelItem");
      else
         renderPageNavItem("[" + (currPage +1) + "]", "pageNavItem", url, currPage);
      currPage++;
   }
   if (currPage < lastPageIdx)
      renderPageNavItem("[..]", "pageNavItem", url, offset + maxItems);
   if (pageIdx < lastPageIdx)
      renderPageNavItem("next", "pageNavItem", url, pageIdx +1);
   param.pagenavigation = res.pop();
   return renderSkinAsString("pagenavigation", param);
}

/**
 * render a single item for page-navigation bar
 */
function renderPageNavItem(text, cssClass, url, page) {
   var param = new Object();
   if (!url)
      param.text = text
   else
      Html.linkAsString({href: url + "?page=" + page}, text);
   param["class"] = cssClass;
   renderSkin("pagenavigationitem", param);
   return;
}


