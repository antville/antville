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
 * macro creates an html link
 */
function link_macro(param) {
	if (param.checkdeny == "true") {
		if (this.isDenied(session.user))
			return("");
	}
  var content = param.text ? param.text : param.to;
  param = this.createLinkParam(param);
  openMarkupElement("a", param);
  res.write(content);
  closeMarkupElement("a");
}


/**
 * macro renders a form-input
 * used mostly for those inputs that have no initial value
 * i.e. in register.skin
 */

function input_macro(param) {
   if (param.type == "textarea") {
      param.value = (param.name && req.data[param.name] ? req.data[param.name] : param.value);
      return(this.renderInputTextarea(param));
   } else if (param.type == "checkbox")
      return(this.renderInputCheckbox(param));
   else if (param.type == "button") {
      param.type = "submit";
      return(this.renderInputButton(param));
   }
   else if (param.type == "password")
      return(this.renderInputPassword(param));
   else if (param.type == "file")
      return(this.renderInputFile(param));
   else {
      param.value = (param.name && req.data[param.name] ? req.data[param.name] : param.value);
      return(this.renderInputText(param));
   }
}
