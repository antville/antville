/**
 * renders a textarea
 * input:   - parameter object
 */

function renderInputTextarea(param) {
   if (param) {
      res.write("<textarea name=\"" + param.name);
      res.write("\" rows=\"");
      res.write(param.height ? param.height : "5");
      res.write("\" cols=\"");
      res.write(param.width ? param.width : "40");
      res.write("\" wrap=\"");
      res.write(param.wrap ? param.wrap : "virtual");
      if (param.style)
         res.write("\" class=\"" + param.style);
      res.write("\">");
      res.encodeForm(param.value ? param.value : "");
      res.write("</textarea>");
   }
}


/**
 * renders an input type text
 * input:   - parameter object
 */

function renderInputText(param) {
   if (param) {
      res.write("<input type=\"text\" name=\"" + param.name);
      if (param.value)
         res.write("\" value=\"" + encodeForm(param.value));
      res.write("\" size=\"");
      res.write(param.width ? param.width : "20");
      if (param.style)
         res.write("\" class=\"" + param.style);
      res.write("\">");
   }
}


/**
 * renders an input type password
 * input:   - parameter object
 */

function renderInputPassword(param) {
   if (param) {
      res.write("<input type=\"password\" name=\"" + param.name);
      res.write("\" size=\"");
      res.write(param.width ? param.width : "20");
      if (param.style)
         res.write("\" class=\"" + param.style);
      res.write("\">");
   }
}


/**
 * function renders an input type file
 */

function renderInputFile(param) {
   if (param) {
      res.write("<input type=\"file\" name=\"" + param.name);
      res.write("\" size=\"");
      res.write(param.width ? param.width : "10");
      if (param.style)
         res.write("\" class=\"" + param.style);
      res.write("\">");
   }
} 

/**
 * renders an input type radio
 * input:   - parameter object

function renderInputRadio(param) {
   if (param) {
      res.write("<input type=\"radio\" name=\"" + param.value + "\"");
      res.write(" value=\"" + (this[param.value] ? this[param.value] : "") + "\"");
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
 * renders a submit-button
 * input:   - parameter object
 */

function renderInputButton(param) {
   if (param) {
      res.write("<input type=\"submit\"");
      res.write(" name=\"" + (param.name ? param.name : "submit") + "\"");
      res.write(" value=\"" + (param.value ? param.value : "submit") + "\"");
      if (param.style)
         res.write(" class=\"" + param.style + "\"");
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
   res.write("<a href=\"");
   var url = param.to ? param.to : param.linkto;
   // check if this is an external url
   if (!url || url == "main")
      res.write(this.href());
   else if (url.indexOf("://") > -1 || url.substring(0,10) == "javascript")
      res.write(url);
   else
      res.write(this.href(url));
   if (param.urlparam) res.write(param.urlparam);
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
   res.write("<select name=\"" + param.name + "\"");
   res.write(">\n");
   for (var i=0;i<param.size();i++) {
      res.write("<option value=\"" + param.get(i).value + "\"");
      if (param.get(i).selected)
         res.write(" selected");
      res.write(">" + param.get(i).name + "</option>\n");
   }
   res.write("</select>\n");
}


/**
 * function renders only a part of the text
 * length of the string to show is defined by parameter limit
 */

function renderTextPreview(limit) {
   var text = createSkin(format(this.text));
   text = stripTags(this.renderSkinAsString(text));
   var limit = Math.min(limit,text.length);
   var charCnt = 0;
   for (var i=0;i<text.length;i++) {
      charCnt = (text.charAt(i) == " " ? 0 : charCnt+1);
      if (charCnt > 20) {
         res.write("<wbr>");
         charCnt = 0;
      }
      if (i >= limit && text.charAt(i) == " ")
         break;
      res.write(text.charAt(i));
   }
}

/**
 * function renders image-tag
 */

function renderImage(img,param) {
   res.write("<img src=\"" + getProperty("imgUrl"));
   if (this.alias)
      res.write(this.alias + "/");
   res.write(img.filename + "." + img.fileext + "\"");
   res.write(" width=\"" + (param.width ? param.width : img.width) + "\"");
   res.write(" height=\"" + (param.height ? param.height: img.height) + "\"");
   if (param.align)
      res.write(" align=\"" + param.align + "\"");
   if (param.valign)
      res.write(" valign=\"" + param.valign + "\"");
   if (img.alttext)
      res.write(" alt=\"" + img.alttext + "\"");
   res.write(" border=\"0\">");
}
