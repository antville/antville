/**
 * renders image element
 * @param img Object contains the images's properties
 * @param param Object contains user-defined properties
 */
function renderImage(img, param) {
  if (!param.title)
    param.title = img.alttext;
  param.src = getProperty("imgUrl");
  param.src += img.weblog ? img.weblog.alias + "/" : "";
  param.src += img.filename + "." + img.fileext;
  if (!param.width)
    param.width = img.width;
  if (!param.height)
    param.height = img.height;
  if (!param.border)
    param.border = "0";
  param.alt = param.description ? param.description : img.alttext;
  delete(param.description);
  // delete(param.name);
  return(renderMarkupElement("img", null, param));
}


/**
 * renders a textarea
 * @param param Object contains the element's attributes
 */
function renderInputTextarea(param) {
  param.cols = param.width ? param.width : "40";
  param.rows = param.height ? param.height : "5";
  if (!param.wrap)
    param.wrap = "virtual";
  var value = param.value ? encodeForm(param.value) : "";
  delete(param.value);
  delete(param.width);
  delete(param.height);
  delete(param.as);
  return(renderMarkupElement("textarea", value, param));
}


/**
 * renders an arbitrary input element
 * @param type String contains the input type
 * @param param Object contains the element's attributes
 */
function renderInputElement(type, param) {
  param.value = param.value ? encodeForm(param.value) : "";
  return(renderMarkupElement("input", null, param));
}


/**
 * renders a submit-button
 * @param param Object contains the element's attributes
 */
function renderInputButton(param) {
  if (!param)
    return;
  if (param.content) {
    param.value = param.content;
    delete(param.content);
  }
  if (!param.name)
    param.name = "submit";
  if (!param.value)
    param.value = "submit";
  return(this.renderInputElement("submit", param));
}


/**
 * renders an input type text
 * @param param Object contains the element's attributes
 */
function renderInputText(param) {
  if (!param)
    return;
  param.size = param.width ? param.width : "20";
  delete(param.width);
  delete(param.as);
  return(this.renderInputElement("text", param));
}


/**
 * renders an input type password
 * @param param Object contains the element's attributes
 */
function renderInputPassword(param) {
  if (!param)
    return;
  this.renderInputElement("password", param);
  return;
}


/**
 * function renders an input type file
 * @param param Object contains the element's attributes
 */
function renderInputFile(param) {
  if (!param)
    return;
  this.renderInputElement("file", param);
  return;
} 


/**
 * renders an input type radio
 * @param param Object contains the element's attributes
 *
function renderInputRadio(param) {
  if (param) {
    res.write("<input type=\"radio\" name=\"" + param.value + "\"");
    res.write(" value=\"" + (this[param.value] ? this[param.value] : "") + "\"");
    res.write(">");
  }
}*/


/**
 * renders an input type checkbox
 * @param param Object contains the element's attributes
 */
function renderInputCheckbox(param) {
   if (param && param.name) {
      res.write("<input type=\"checkbox\" name=\"" + param.name);
      res.write("\" value=\"1\"");
      if (param.style)
         res.write(" class=\"" + param.style + "\"");
      if (parseInt(param.value,10) == 1 || param.check == "true")
         res.write(" checked");
      res.write(">");
   }
}


/**
 * open a normal href-tag
 * valid attributes: -  linkto | to (the url)
 *                   -  urlparam (get-parameter)
 *                   -  anchor 
 *                   -  target
 */
function openLink(param) {
   res.write("<a href=\"");
   var url = param.to ? param.to : param.linkto;
   if (!url || url == "main")
      res.write(this.href());
   else if (url.indexOf("://") > -1 || url.substring(0,10) == "javascript")
      res.write(url);
   else {
      // check if link points to a subcollection
      if (url.indexOf("/") > -1)
         res.write(this.href() + url);
      else
         res.write(this.href(url));
   }
   if (param.urlparam) res.write(param.urlparam);
   if (param.anchor) res.write(param.anchor);
   res.write("\"");
   if (param.target)
      res.write(" target=\"" + param.target + "\"");
   res.write(">");
}


/**
 * close a href-tag
 */
function closeLink() {
   res.write("</a>");
}


/**
 * function renders a dropdown-box for choosing dateformats
 * @param String String indicating version of dateformat to use:
 *               "short" - short date format
 *               "long" - long date format
 */

function renderDateformatChooser(version) {
   var patterns = getDefaultDateFormats(version);
   var now = new Date();
   var options = new Array();
   var loc = this.getLocale();
   var fmtProperty = (version == "short" ? "shortdateformat" : "longdateformat");
   for (var i in patterns) {
      var sdf = new java.text.SimpleDateFormat(patterns[i],loc);
      options[i] = sdf.format(now);
      if (this[fmtProperty] == patterns[i])
         var selectedIndex = i;
   }
   res.write(simpleDropDownBox(fmtProperty,options,selectedIndex ? selectedIndex : 0));
}
