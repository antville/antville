/**
 * macro rendering a skin
 * valid parameters: - prefix
 *                   - suffix
 *                   - name of skin
 */
function skin_macro(param) {
   if (!param.name)
      return;
   this.renderSkin(param.name);
}

/**
 * macro creates an html link
 */
function link_macro(param) {
   var content = param.text ? param.text : param.to;
   param = this.createLinkParam(param);
   Html.openTag("a", param);
   res.write(content);
   Html.closeTag("a");
}

/**
 * macro renders the time the object was created
 */
function createtime_macro(param) {
   if (this.createtime)
      res.write(formatTimestamp(this.createtime, param.format));
   return;
}


/**
 * macro rendering modifytime
 */
function modifytime_macro(param) {
   if (this.modifytime)
      res.write(formatTimestamp(this.modifytime, param.format));
   return;
}


/**
 * macro renders the name of the creator of an object
 * either as link or as plain text
 */
function creator_macro(param) {
   if (!this.creator)
      return;
   if (param.as == "link" && this.creator.url)
      Html.link(this.creator.url, this.creator.name);
   else
      res.write(this.creator.name);
   return;
}

/**
 * macro renders the url of an object
 */
function url_macro() {
   res.write(this.href());
}
