/**
 * macro rendering bgcolor
 */
function bgcolor_macro(param) {
  if (param.as == "editor")
    Html.input(this.preferences.createInputParam("bgcolor", param));
  else
    renderColor(this.preferences.getProperty("bgcolor"));
}

/**
 * macro rendering textfont
 */
function textfont_macro(param) {
  if (param.as == "editor") {
    param.size = 40;
    Html.input(this.preferences.createInputParam("textfont", param));
  } else
    res.write(this.preferences.getProperty("textfont"));
}

/**
 * macro rendering textsize
 */
function textsize_macro(param) {
  if (param.as == "editor")
    Html.input(this.preferences.createInputParam("textsize", param));
  else
    res.write(this.preferences.getProperty("textsize"));
}

/**
 * macro rendering textcolor
 */
function textcolor_macro(param) {
  if (param.as == "editor")
    Html.input(this.preferences.createInputParam("textcolor", param));
  else
    renderColor(this.preferences.getProperty("textcolor"));
}

/**
 * macro rendering linkcolor
 */
function linkcolor_macro(param) {
  if (param.as == "editor")
    Html.input(this.preferences.createInputParam("linkcolor", param));
  else
    renderColor(this.preferences.getProperty("linkcolor"));
}

/**
 * macro rendering alinkcolor
 */
function alinkcolor_macro(param) {
  if (param.as == "editor")
    Html.input(this.preferences.createInputParam("alinkcolor", param));
  else
    renderColor(this.preferences.getProperty("alinkcolor"));
}

/**
 * macro rendering vlinkcolor
 */
function vlinkcolor_macro(param) {
  if (param.as == "editor")
    Html.input(this.preferences.createInputParam("vlinkcolor", param));
  else
    renderColor(this.preferences.getProperty("vlinkcolor"));
}

/**
 * macro rendering titlefont
 */
function titlefont_macro(param) {
  if (param.as == "editor") {
    param.size = 40;
    Html.input(this.preferences.createInputParam("titlefont", param));
  } else
    res.write(this.preferences.getProperty("titlefont"));
}

/**
 * macro rendering titlesize
 */
function titlesize_macro(param) {
  if (param.as == "editor")
    Html.input(this.preferences.createInputParam("titlesize", param));
  else
    res.write(this.preferences.getProperty("titlesize"));
}

/**
 * macro rendering titlecolor
 */
function titlecolor_macro(param) {
  if (param.as == "editor")
    Html.input(this.preferences.createInputParam("titlecolor", param));
  else
    renderColor(this.preferences.getProperty("titlecolor"));
}

/**
 * macro rendering smallfont
 */
function smallfont_macro(param) {
  if (param.as == "editor") {
    param.size = 40;
    Html.input(this.preferences.createInputParam("smallfont", param));
  } else
    res.write(this.preferences.getProperty("smallfont"));
}

/**
 * macro rendering smallfont-size
 */
function smallsize_macro(param) {
  if (param.as == "editor")
    Html.input(this.preferences.createInputParam("smallsize", param));
  else
    res.write(this.preferences.getProperty("smallsize"));
}

/**
 * macro rendering smallfont-color
 */
function smallcolor_macro(param) {
  if (param.as == "editor")
    Html.input(this.preferences.createInputParam("smallcolor", param));
  else
    renderColor(this.preferences.getProperty("smallcolor"));
}

/**
 * renders the layout title as editor
 */
function title_macro(param) {
   if (param.as == "editor")
      Html.input(this.createInputParam("title", param));
   else {
      if (param.linkto) {
         Html.openLink({href: this.href(param.linkto == "main" ? "" : param.linkto)});
         res.write(this.title);
         Html.closeLink();
      } else
         return this.title;
   }
}

/**
 * macro renders an image out of the layout imagepool
 * either as plain image, thumbnail, popup or url
 * param.name can contain a slash indicating that
 * the image belongs to a different site or to root
 */
function image_macro(param) {
   var img;
   if ((img = this.getImage(param.name, param.fallback)) == null)
      return;
   // return different display according to param.as
   switch (param.as) {
      case "url" :
         return img.getUrl();
      case "thumbnail" :
         if (!param.linkto)
            param.linkto = img.getUrl();
         if (img.thumbnail)
            img = img.thumbnail;
         break;
      case "popup" :
         param.linkto = img.getUrl();
         param.onClick = img.getPopupUrl();
         if (img.thumbnail)
            img = img.thumbnail;
         break;
   }
   delete(param.name);
   delete(param.as);
   // render image tag
   if (param.linkto) {
      Html.openLink({href: param.linkto});
      delete(param.linkto);
      renderImage(img, param);
      Html.closeLink();
   } else
      renderImage(img, param);
   return;
}

/**
 * render a link to testdrive if the layout is *not*
 * the currently active layout
 */
function testdrivelink_macro(param) {
   if (this.isDefaultLayout())
      return;
   Html.link({href: this.href("startTestdrive")},
             param.text ? param.text : "test");
   return;
}

/**
 * render a link for deleting the layout, but only if
 * layout is *not* the currently active layout
 */
function deletelink_macro(param) {
   if (this.isDefaultLayout() || this.sharedBy.size() > 0)
      return;
   Html.link({href: this.href("delete")},
             param.text ? param.text : "delete");
   return;
}

/**
 * render a link for activating the layout, but only if
 * layout is *not* the currently active layout
 */
function activatelink_macro(param) {
   if (this.isDefaultLayout())
      return;
   Html.link({href: this._parent.href() + "?activate=" + this.alias},
             param.text ? param.text : "activate");
   return;
}

/**
 * render the description of a layout, either as editor
 * or as plain text
 */
function description_macro(param) {
   if (param.as == "editor")
      Html.textArea(this.createInputParam("description", param));
   else if (this.description) {
      if (param.limit)
         res.write(this.description.clip(param.limit));
      else
         res.write(this.description);
   }
   return;
}

/**
 * render the property "shareable" either as editor (checkbox)
 * or as plain text (editor-mode works only for root-layouts)
 */
function shareable_macro(param) {
   if (param.as == "editor" && !this.site) {
      var inputParam = this.createInputParam("shareable", param);
      if ((req.data.save && req.data.shareable) || (!req.data.save && this.shareable))
         inputParam.checked = "checked";
      Html.checkBox(inputParam);
   } else if (this.shareable)
      res.write(param.yes ? param.yes : "yes");
   else
      res.write(param.no ? param.no : "no");
}

/**
 * render the title of the parent layout
 */
function parent_macro(param) {
   if (param.as == "editor") {
      this._parent.renderParentLayoutChooser(this, param);
   } else if (this.parent)
      return this.parent.title;
   return;
}

/**
 * render the copyright information of this layout
 * either as editor or as plain text
 */
function copyright_macro(param) {
   if (param.as == "editor" && !this.imported && !this.parent)
      Html.input(this.preferences.createInputParam("copyright", param));
   else if (this.preferences.getProperty("copyright"))
      res.write(this.preferences.getProperty("copyright"));
   return;
}

/**
 * render the contact email address of this layout
 * either as editor or as plain text
 */
function email_macro(param) {
   if (param.as == "editor" && !this.imported)
      Html.input(this.preferences.createInputParam("email", param));
   else if (this.preferences.getProperty("email"))
      res.write(this.preferences.getProperty("email"));
   return;
}
