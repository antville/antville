/**
 * macro rendering alias
 */

function alias_macro(param) {
   if (param.as == "editor")
      renderInputText(this.createInputParam("alias",param));
   else if (param.as == "link") {
      param.to = "getfile"
      param.urlparam = "name=" + this.alias;
      param.title = this.description;
      openMarkupElement("a", this.site.createLinkParam(param));
      res.write(this.alias);
      closeMarkupElement("a");
   } else
      res.write(this.alias);
}


/**
 * macro rendering description
 */

function description_macro(param) {
   if (param.as == "editor")
      renderInputTextarea(this.createInputParam("description",param));
   else
      res.write(this.description);
}

/**
 * macro renders the url to this file
 */

function url_macro(param) {
   res.write(getProperty("fileUrl"));
   if (this.site)
       res.write(this.site.alias + "/");
   res.write(this.filename + "." + this.fileext);
}

/**
 * macro renders a link for editing a file
 */

function editlink_macro(param) {
   if (session.user && !this.isEditDenied(session.user,req.data.memberlevel)) {
      openLink(this.href("edit"));
      res.write(param.text ? param.text : "edit");
      closeLink();
   }
}

/**
 * macro rendering a link to delete
 * if user is creator of this file
 */

function deletelink_macro(param) {
   if (session.user && !this.isEditDenied(session.user,req.data.memberlevel)) {
      openLink(this.href("delete"));
      if (param.image && this.site.images.get(param.image))
         this.site.renderImage(this.site.images.get(param.image),param);
      else
         res.write(param.text ? param.text : "delete");
      closeLink();
   }
}

/**
 * macro rendering filesize
 */

function filesize_macro(param) {
   res.write((this.filesize / 1000).format("###,###") + " Kb");
}

/**
 * macro rendering the mimetype
 */

function mimetype_macro(param) {
   res.write(this.mimetype);
}


/**
 * macro rendering the file extension from the name
 */

function filetype_macro(param) {
   var i = this.name.lastIndexOf(".");
   if (i > -1)
      res.write(this.name.substring(i+1, this.name.length));
}


/**
 * macro rendering the number of requests so far
 * for a file-object
 */

function clicks_macro(param) {
   res.write(this.requestcnt);
}
