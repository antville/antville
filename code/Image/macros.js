/**
 * macro rendering alias of image
 */

function alias_macro(param) {
   res.write(param.prefix)
   if (param.as == "editor")
      this.renderInputText(this.createInputParam("alias",param));
   else
      res.write(this.alias);
   res.write(param.suffix);
}


/**
 * macro rendering alternate text of image
 */

function alttext_macro(param) {
   res.write(param.prefix)
   if (param.as == "editor")
      this.renderInputText(this.createInputParam("alttext",param));
   else
      res.write(this.alttext);
   res.write(param.suffix);
}

/**
 * macro renders a link for editing image
 */

function editlink_macro(param) {
   res.write(param.prefix)
   var linkParam = new HopObject();
   linkParam.linkto = "edit";
   this.openLink(linkParam);
   if (!param.image)
      res.write(param.text ? param.text : "edit");
   else
      this.renderImage(param);
   this.closeLink();
   res.write(param.suffix);
}

/**
 * macro rendering a link to delete
 * if user is author of this story
 */

function deletelink_macro(param) {
   res.write(param.prefix)
   if (this.weblog && this.weblog.isUserAdmin) {
      var linkParam = new HopObject();
      linkParam.linkto = "delete";
      this.openLink(linkParam);
      if (!param.image)
         res.write(param.text ? param.text : "delete");
      else
         this.renderImage(param);
      this.closeLink();
   }
   res.write(param.suffix);
}

/**
 * macro renders the image-tag
 */

function show_macro(param) {
   res.write(param.prefix)
   if (param.linkto) {
      this.openLink(param);
      this.weblog.renderImage(this,param);
      this.closeLink(param);
   } else
      this.weblog.renderImage(this,param);
   res.write(param.suffix);
}
