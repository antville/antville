/**
 * user-friendly wrapper for href_macro
 */
function url_macro(param) {
   this.href_macro(param);
   return;
}

/**
 * macro creates an html link
 */
function link_macro(param) {
   Html.openTag("a", this.createLinkParam(param));
   res.write(param.text ? param.text : param.to);
   Html.closeTag("a");
   return;
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
      Html.link({href: this.creator.url}, this.creator.name);
   else
      res.write(this.creator.name);
   return;
}

/**
 * macro renders the name of the modifier
 */
function modifier_macro(param) {
   if (!this.modifier)
      return;
   if (param.as == "link" && this.modifier.url)
      Html.link({href: this.modifier.url}, this.modifier.name);
   else
      res.write(this.modifier.name);
   return;
}
