/**
 * macro rendering a skin
 * valid parameters: - prefix
 *                   - suffix
 *                   - name of skin
 */

function skin_macro(param) {
   if (param.name) {
      this.renderSkin(param.name);
   }
}

/**
 * Loops over subnodes, rendering a skin on each.
 */

function loopskin_macro (param) {
   var l = this.size();
   for (var i=0; i<l; i++) {
      var item = this.get(i);
      item.renderSkin (param.name);
   }
}


/**
 * macro creates a link by using the renderFunctions
 * openLink() and closeLink()
 */

function link_macro(param) {
   this.openLink(param);
   if (param.text)
      res.write(param.text);
   else
      res.write(param.to ? param.to : param.linkto);
   this.closeLink();
}


/**
 * macro renders a form-input
 * used mostly for those inputs that have no initial value
 * i.e. in register.skin
 */

function input_macro(param) {
   var inputParam = new Object();
   for (var i in param)
      inputParam[i] = param[i];
   if (param.type == "textarea") {
      inputParam.value = (param.name && req.data[param.name] ? req.data[param.name] : param.value);
      return(this.renderInputTextarea(inputParam));
   } else if (param.type == "checkbox")
      return(this.renderInputCheckbox(inputParam));
   else if (param.type == "button") {
      inputParam.type = "submit";
      return(this.renderInputButton(inputParam));
   }
   else if (param.type == "password")
      return(this.renderInputPassword(inputParam));
   else if (param.type == "file")
      return(this.renderInputFile(inputParam));
   else {
      inputParam.value = (param.name && req.data[param.name] ? req.data[param.name] : param.value);
      return(this.renderInputText(inputParam));
   }
}
