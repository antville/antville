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
