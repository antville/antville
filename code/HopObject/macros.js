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
 * macro creates a link by using the renderFunctions
 * openLink() and closeLink()
 */

function link_macro(param) {
   renderPrefix(param);
   this.openLink(param);
   if (param.text)
      res.write(param.text);
   else
      res.write(param.to ? param.to : param.linkto);
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


