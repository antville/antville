/**
 * renders a textarea
 * input:   - parameter object
 */

function renderInputTextarea(param) {
   if (param) {
      res.write("<TEXTAREA NAME=\"" + param.name + "\"");
      res.write(" ROWS=\"");
      res.write(param.height ? param.height : "5");
      res.write("\" COLS=\"");
      res.write(param.width ? param.width : "40");
      res.write("\" WRAP=\"");
      res.write(param.wrap ? param.wrap : "VIRTUAL");
      res.write("\">");
      res.write(param.value != null ? param.value : "");
      res.write("</TEXTAREA>");
   }
}


/**
 * renders an input type text
 * input:   - parameter object
 */

function renderInputText(param) {
   if (param) {
      res.write("<INPUT TYPE=\"TEXT\" NAME=\"" + param.name + "\"");
      if (param.value)
         res.write(" VALUE=\"" + param.value + "\"");
      res.write(" SIZE=\"");
      res.write(param.width ? param.width : "20");
      res.write("\">");
   }
}


/**
 * renders an input type password
 * input:   - parameter object
 */

function renderInputPassword(param) {
   if (param) {
      res.write("<INPUT TYPE=\"PASSWORD\" NAME=\"" + param.name + "\"");
      res.write(" SIZE=\"");
      res.write(param.width ? param.width : "20");
      res.write("\">");
   }
}


/**
 * function renders an input type file
 */

function renderInputFile(param) {
   if (param) {
      res.write("<INPUT TYPE=\"FILE\" NAME=\"" + param.name + "\"");
      res.write(" SIZE=\"");
      res.write(param.width ? param.width : "10");
      res.write("\">");
   }
} 

/**
 * renders an input type radio
 * input:   - parameter object

function renderInputRadio(param) {
   if (param) {
      res.write("<INPUT TYPE=\"RADIO\" NAME=\"" + param.value + "\"");
      res.write(" VALUE=\"" + (this[param.value] ? this[param.value] : "") + "\"");
      res.write(">");
   }
}
*/

/**
 * renders an input type checkbox
 * input:   - parameter object
 */

function renderInputCheckbox(param) {
   if (param && param.name) {
      res.write("<INPUT TYPE=\"CHECKBOX\" NAME=\"" + param.name + "\"");
      res.write(" VALUE=\"1\"");
      if (parseInt(param.value) == 1)
         res.write(" CHECKED");
      res.write(">");
   }
}


/**
 * renders a submit-button
 * input:   - parameter object
 */

function renderInputButton(param) {
   if (param) {
      res.write("<INPUT TYPE=\"SUBMIT\"");
      res.write(" NAME=\"" + (param.name ? param.name : "submit") + "\"");
      res.write(" VALUE=\"" + (param.value ? param.value : "submit") + "\"");
      res.write(">");
   }
}


/**
 * open a normal href-tag
 * valid attributes: -  linkto | to (the url)
 *                   -  urlparam (get-parameter)
 *                   -  target
 */

function openLink(param) {
   if (param.to || param.linkto) {
      res.write("<A HREF=\"");
      var url = param.to ? param.to : param.linkto;
      // check if this is an external url
      if (url.indexOf("://") > -1)
         res.write(url);
      else
         res.write(this.href(url));
      if (param.urlparam) res.write(param.urlparam);
      res.write("\"");
      if (param.target)
         res.write(" TARGET=\"" + param.target + "\"");
      res.write(">");
   }
}


/**
 * close a href-tag
 */

function closeLink() {
   res.write("</A>");
}


/**
 * renders a group of dropdowns for selecting
 * date-value
 */

function renderDateDropdown(param) {
   if (param.value) {
      var ts = param.value;
   } else {
      var ts = new Date();
   }
   var prefix = param.name ? param.name : "date";
   this.createDDparam(prefix,ts,"yyyy");
   this.createDDparam(prefix,ts,"MM");
   this.createDDparam(prefix,ts,"dd");
   this.createDDparam(prefix,ts,"HH");
   this.createDDparam(prefix,ts,"mm");
}

/**
 * function renders a dropdown-element
 * input values: parameter-object
 * param.name = name of select-element
 * param-object contains a HopObject for each option that is selectable
 * each option contains the following properties:
 * name = string to display in dropdown
 * value = value of option
 * selected = boolean (option matches the current selection)
 */

function chooser(param) {
   res.write("<SELECT NAME=\"" + param.name + "\"");
   res.write(">\n");
   for (var i=0;i<param.size();i++) {
      res.write("<OPTION VALUE=\"" + param.get(i).value + "\"");
      if (param.get(i).selected)
         res.write(" SELECTED");
      res.write(">" + param.get(i).name + "</OPTION>\n");
   }
   res.write("</SELECT>\n");
}
