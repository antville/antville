/**
 * macro rendering a skin
 * valid parameters: - prefix
 *                   - suffix
 *                   - name of skin
 */

function skin_macro(param) {
   if (param.name) {
      res.write(param.prefix)
      this.renderSkin(param.name);
      res.write(param.suffix);
   }
}


/**
 * macro creates a link by using the renderFunctions
 * openLink() and closeLink()
 */

function link_macro(param) {
   res.write(param.prefix)
   this.openLink(param);
   if (param.text)
      res.write(param.text);
   else
      res.write(param.to ? param.to : param.linkto);
   this.closeLink();
   res.write(param.suffix);
}


/**
 * macro renders a form-input
 * used mostly for those inputs that have no initial value
 * i.e. in register.skin
 */

function input_macro(param) {
   res.write(param.prefix)
   if (param.type == "textarea") {
      var inputParam = new Object();
      for (var i in param)
         inputParam[i] = param[i];
      inputParam.value = (param.name && req.data[param.name] ? req.data[param.name] : param.value);
      this.renderInputTextarea(inputParam);
   } else if (param.type == "checkbox") {
      this.renderInputCheckbox(param);
   } else if (param.type == "button") {
      this.renderInputButton(param);
   } else if (param.type == "password") {
      this.renderInputPassword(param);
   } else if (param.type == "file") {
      this.renderInputFile(param);
   } else {
      var inputParam = new Object();
      for (var i in param)
         inputParam[i] = param[i];
      inputParam.value = (param.name && req.data[param.name] ? req.data[param.name] : param.value);
      this.renderInputText(inputParam);
   }
   res.write(param.suffix);
}


