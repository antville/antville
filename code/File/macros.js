/**
 * macro rendering alias of goodie
 */

function alias_macro(param) {
   if (param.as == "editor")
      this.renderInputText(this.createInputParam("alias",param));
   else if (param.as == "link") {
      var linkParam = new Object();
      linkParam.to = "getgoodie"
      linkParam.urlparam = "?name=" + this.alias;
      this.weblog.openLink(linkParam);
      res.write(this.alias);
      this.closeLink();
   } else
      res.write(this.alias);
}


/**
 * macro rendering description of goodie
 */

function description_macro(param) {
   if (param.as == "editor")
      this.renderInputTextarea(this.createInputParam("description",param));
   else
      res.write(this.description);
}

/**
 * macro renders the url to this goodie
 */

function url_macro(param) {
   res.write(getProperty("goodieUrl"));
   if (this.weblog)
       res.write(this.weblog.alias + "/");
   res.write(this.filename + "." + this.fileext);
}

/**
 * macro renders a link for editing goodie
 */

function editlink_macro(param) {
   if (!this.isEditDenied(session.user)) {
      var linkParam = new Object();
      linkParam.linkto = "edit";
      this.openLink(linkParam);
      res.write(param.text ? param.text : "edit");
      this.closeLink();
   }
}

/**
 * macro rendering a link to delete
 * if user is creator of this goodie
 */

function deletelink_macro(param) {
   if (!this.isEditDenied(session.user)) {
      var linkParam = new Object();
      linkParam.linkto = "delete";
      this.openLink(linkParam);
      if (param.image && this.weblog.images.get(param.image))
         this.weblog.renderImage(this.weblog.images.get(param.image),param);
      else
         res.write(param.text ? param.text : "delete");
      this.closeLink();
   }
}

/**
 * macro renders the name of the creator of this goodie
 */

function creator_macro(param) {
   res.write(this.creator.name);
}

/**
 * macro rendering createtime of goodie
 */

function createtime_macro(param) {
   if (!this.createtime)
      return;
   res.write(this.weblog.formatTimestamp(this.createtime,param));
}

/**
 * macro rendering filesize of goodie
 */

function filesize_macro(param) {
   res.write((this.filesize / 1000).format("###,###") + " Kb");
}

/**
 * macro rendering the mimetype of goodie
 */

function mimetype_macro(param) {
   res.write(this.mimetype);
}

/**
 * mcaro rendering the number of requests so far
 * for a goodie-object
 */

function clicks_macro(param) {
   res.write(this.requestcnt);
}