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
 * macro renders the time the object was created
 */

function createtime_macro(param) {
   if (!this.createtime || !param.format)
      return;
   res.write(formatTimestamp(this.createtime, param.format));
}


/**
 * a yet not sophisticated macro to display a
 * colorpicker. works already in prefs and story editors
 */

function colorpicker_macro(param) {
   if (!param || !param.name)
      return;
   var param2 = new Object();
   param2.as = "editor";
   param2.width = "15";
   param2.onchange = "setColorPreview('" + param.name + "', this.value);";
   param2.id = "cp1_"+param.name;
   if (this.__prototype__ == "story") {
      param2.part = param.name;
      param.editor = this.content_macro(param2);
      param.color = this.getContentPart(param.name);
   }
   else {
      param.editor = this[param.name+"_macro"](param2);
      param.color = this[param.name];
   }
   if (!param.text)
      param.text = param.name;
   if (param.color && param.color.indexOf("#") < 0)
         param.color = "#" + param.color;
   this.renderSkin("cp_element", param);
}


/**
 * macro renders a form-input
 * DEPRECATED: just left for backwards-compatibility, use global input_macro() now
 */

function input_macro(param) {
   input_macro(param);
}
