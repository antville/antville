/**
 * function renders a shortcut
 */
function render_macro() {
   this.renderContent(this.getTitle());
}


/**
 * function displays an asterisk in
 * the preview if shortcut contains
 * the magic placeholder $text.
 */
function placeholder_macro() {
   if (this.content.indexOf("$text") > -1)
      res.write("*");
}
