
/**
 * returns name of action file the user has called
 * Input params: none
 * returns: string (= name of .hac-file)
 */


function getActionName() {
   // return name of current action executed by user
   var rPath = req.path.split("/");
   if (path[path.length-1]._id == rPath[rPath.length-1] || path[path.length-1]._name == rPath[rPath.length-1])
      return "main";
   else
      return(rPath[rPath.length -1]);
}

/**
 * function tries to check if the color contains just hex-characters
 * if so, it renders the color-definition prefixed with a '#'
 * otherwise it assumes the color is a named one
 */

function renderColor(c) {
   if (c.length == 6) {
      var nonhex = new RegExp("[^0-9,a-f]");
      nonhex.ignoreCase = true;
      var found = c.match(nonhex);
      if (!found) {
         // color-string contains just hex-characters, so we prefix it with '#'
         res.write("#" + c);
         return;
      }
   }
   res.write(c);
}

/**
 * function renders only a part of the text passed as argument
 * length of the string to show is defined by argument "limit"
 */

function renderTextPreview(text,limit) {
   var text = stripTags(text);
   var limit = Math.min(limit,text.length);
   var idx = 0;
   while (idx < limit) {
      var nIdx = text.indexOf(" ",idx);
      if (nIdx < 0)
         break;
      idx = ++nIdx;
   }
   var prev = text.substring(0,(idx ? idx : text.length));
   // and now we "enrich" the text with <wbr>-tags
   for (var i=0;i<prev.length;i=i+30)
      res.write(prev.substring(i,i+30) + "<wbr>");
}

/**
 * Do Wiki style substitution, transforming
 * stuff contained between asterisks into links.
 */
function doWikiStuff (src) {
   var src= " "+src;

   // set up reg exp for http link stuff
   var linkexp = new RegExp ("([^=^\"])(http://[^ ^\r^\n^\"]*)");
   linkexp.ignoreCase=true;
   linkexp.global=true;

   // do the Wiki link thing, *asterisk style*
   var regex = new RegExp ("[*]([a-z0-9צהü][a-z0-9צהüß ]*[a-z0-9צהüß])[*]");
   regex.ignoreCase=true;

   var text = "";
   var start = 0;
   while (true) {
      var found = regex.exec (src.substring(start));
      var to = found == null ? src.length : start + found.index;
      text += src.substring(start, to).replace (linkexp, "$1<a href=\"$2\">$2</a>");
      if (found == null)
         break;
      var name = found[1];
      var item = path.weblog.space.get (name);
      if (item == null && name.lastIndexOf("s") == name.length-1)
         item = path.weblog.space.get (name.substring(0, name.length-1));
      if (item == null)
         text += format(name)+" <small>[<a href=\""+path.weblog.stories.href("create")+"?topic="+escape(name)+"\">define "+format(name)+"</a>]</small>";
      else
         text += "<a href=\""+item.href()+"\">"+name+"</a>";
      start += found.index + found[1].length+2;
   }
   return text;
}

/**
 *  Renders a drop down box from an Array and an optional 
 *  current selection index. This is a simpler alternative 
 *  for the drop-down framework in hopobject. Its main 
 *  advantage is that Arrays are much simpler to set up in 
 *  JavaScript than (Hop)Objects:
 *  
 */
function simpleDropDownBox (name, options, selectedIndex) {
  var str = "<select name=\""+name+"\" size=\"1\">";
  for (var i in options) {
    var name = encode (options[i]);
    var key = i;
    if (key == selectedIndex)
       str += "<option value=\""+key+"\" selected=\"true\">"+name+"</option>";
    else
       str += "<option value=\""+key+"\">"+name+"</option>";
  }
  str += "</select>";
  return str;
}
