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
 * macro renders a form-input
 * DEPRECATED: just left for backwards-compatibility, use global input_macro() now
 */

function input_macro(param) {
   input_macro(param);
}
