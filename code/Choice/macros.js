/**
 * render the title of a choice, either as editor
 * or as plain text
 */
function title_macro(param) {
   if (param.as = "editor")
      Html.input(this.createInputParam("title", param));
   else
      res.write(this.title);
   return;
}
