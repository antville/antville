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
   if (param.checkdeny == "true" && this.isDenied(session.user,req.data.memberlevel))
      return;
   delete param.checkdeny;
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
 * macro rendering modifytime
 */

function modifytime_macro(param) {
   if (this.modifytime)
      res.write(formatTimestamp(this.modifytime,param.format));
   return;
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
 * Returns a href for an object.
 */
function href_macro(param) {
   if (param.action)
      return this.href(param.action);
   else
      return this.href();
}

/**
 * macro renders a form-input
 * DEPRECATED: just left for backwards-compatibility, use global input_macro() now
 */

function input_macro(param) {
   input_macro(param);
}

/**
 * macro renders the url of an object
 */
function url_macro() {
   res.write(this.href());
}


