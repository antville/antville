/**
 * open an html link element
 * special properties of param:
 *   - linkto | to (the url)
 *   - urlparam (querystring)
 *   - anchor (inline link)
 */
function openLink(param) {
  var p = this.createLinkParam(param);
  openMarkupElement("a", p);
}


/**
 * close an html link element
 */
function closeLink() {
  closeMarkupElement("a");
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
  renderDropDownBox(fmtProperty, options, selectedIndex ? selectedIndex : 0);
}


/**
 * renders image element
 * @param img Object contains the images's properties
 * @param param Object contains user-defined properties
 */
function renderImage(img, param) {
  // this function has gone global
  renderImage(img, param);
}


/**
 * renders a textarea
 * @param param Object contains the element's attributes
 */
function renderInputTextarea(param) {
  // this function has gone global
  renderInputTextarea(param);
}


/**
 * renders a submit-button
 * @param param Object contains the element's attributes
 */
function renderInputButton(param) {
  // this function has gone global
  renderInputButton(param);
}


/**
 * renders an input type text
 * @param param Object contains the element's attributes
 */
function renderInputText(param) {
  // this function has gone global
  renderInputText(param);
}


/**
 * renders an input type password
 * @param param Object contains the element's attributes
 */
function renderInputPassword(param) {
  // this function has gone global
  renderInputPassword(param);
}


/**
 * function renders an input type file
 * @param param Object contains the element's attributes
 */
function renderInputFile(param) {
  // this function has gone global
  renderInputFile(param);
} 


/**
 * FIXME!
 *
 * renders an input type radio
 * @param param Object contains the element's attributes
 *
function renderInputRadio(param) {
  if (!param)
    return;
  param.type = "radio";
  param.name = param.value; // ???
  param.value = this[param.value] ? this[param.value] : "";
  renderMarkupElement("input", param);
}*/


/**
 * renders an input type checkbox
 * @param param Object contains the element's attributes
 */
function renderInputCheckbox(param) {
  // this function has gone global
  renderInputCheckbox(param);
}
