/**
 * macro rendering a skin
 * valid parameters: - prefix
 *                   - suffix
 *                   - name of skin
 */

function skin_macro(param) {
   if (param.name) {
      renderPrefix(param);
      this.renderSkin(param.name);
      renderSuffix(param);
   }
}


/**
 * creates a <FORM ... tag

function form_macro(param) {
   if (param) {
      renderPrefix(param);
      res.write("<FORM METHOD=\"");
      if (param.method == "GET")
         res.write("GET\" ");
      else
         res.write("POST\" ");
      res.write("ACTION=\"" + this.href(param.action ? param.action : "") + "\"");
      if (param.enctype)
         res.write(" ENCTYPE=\"" + param.enctype + "\">");
      else
         res.write(">");
      renderSuffix(param);
   }
}
*/


/**
 * macro creates a link by using the renderFunctions
 * openLink() and closeLink()
 */

function link_macro(param) {
   renderPrefix(param);
   this.openLink(param);
   res.write(param.text);
   this.closeLink();
   renderSuffix(param);
}


/**
 * macro renders a form-input
 * used mostly for those inputs that have no initial value
 * i.e. in register.skin
 */

function input_macro(param) {
   renderPrefix(param);
   if (param.type == "textarea") {
      var inputParam = new HopObject();
      for (var i in param)
         inputParam[i] = param[i];
      inputParam.value = param.name ? req.data[param.name] : null;
      this.renderInputTextarea(inputParam);
   } else if (param.type == "checkbox") {
   } else if (param.type == "button") {
      this.renderInputButton(param);
   } else if (param.type == "password") {
      this.renderInputPassword(param);
   } else if (param.type == "file") {
      this.renderInputFile(param);
   } else {
      var inputParam = new HopObject();
      for (var i in param)
         inputParam[i] = param[i];
      inputParam.value = param.name ? req.data[param.name] : null;
      this.renderInputText(inputParam);
   }
   renderSuffix(param);
}


