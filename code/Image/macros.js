/**
 * macro rendering alias of image
 */

function alias_macro(param) {
   renderPrefix(param);
   if (param.as == "editor")
      this.renderInputText(this.createInputParam("alias",param));
   else
      res.write(this.alias);
   renderSuffix(param);
}


/**
 * macro rendering alternate text of image
 */

function alttext_macro(param) {
   renderPrefix(param);
   if (param.as == "editor")
      this.renderInputText(this.createInputParam("alttext",param));
   else
      res.write(this.alttext);
   renderSuffix(param);
}

/**
 * macro renders a link for editing image
 */

function editlink_macro(param) {
   renderPrefix(param);
   var linkParam = new HopObject();
   linkParam.linkto = "edit";
   this.openLink(linkParam);
   if (!param.image)
      res.write(param.text ? param.text : "edit");
   else
      this.renderImage(param);
   this.closeLink();
   renderSuffix(param);
}

/**
 * macro rendering a link to delete
 * if user is owner of this story
 */

function deletelink_macro(param) {
   renderPrefix(param);
   if (this.weblog && this.weblog.owner == user) {
      var linkParam = new HopObject();
      linkParam.linkto = "delete";
      this.openLink(linkParam);
      if (!param.image)
         res.write(param.text ? param.text : "delete");
      else
         this.renderImage(param);
      this.closeLink();
   }
   renderSuffix(param);
}

/**
 * macro renders a preview of this image
 */

function show_macro(param) {
   renderPrefix(param);
   res.write("<IMG SRC=\"" + getProperty("imgUrl") + this.weblog.alias + "/" + this.filename + "." + this.fileext + "\"");
   res.write(" WIDTH=\"" + (param && param.as == "preview" ? Math.round(this.width / 2) : this.width) + "\"");
   res.write(" HEIGHT=\"" + (param && param.as == "preview" ? Math.round(this.height / 2) : this.height) + "\"");
   res.write(" BORDER=\"0\">");
   renderSuffix(param);
}