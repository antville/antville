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
 * macro creates an html link
 */
function link_macro(param) {
   if (param.checkdeny == "true" && this.isDenied(session.user))
      return;
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
 * macro renders the name of the creator of an object
 * either as link or as plain text
 */

function creator_macro(param) {
   if (!this.creator)
      return;
   if (param.as == "link" && this.creator.url) {
      openLink(this.creator.url);
      res.write(this.creator.name);
      closeLink();
   } else
      res.write(this.creator.name);
   return;
}

/**
 * macro renders a form-input
 * DEPRECATED: just left for backwards-compatibility, use global input_macro() now
 */

function input_macro(param) {
   input_macro(param);
}
