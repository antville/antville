/**
 * function renders a shortcut.
 * the magic placeholder $text is replaced with the title;
 * if a shortcut starts with http:// it is rendered as link.
 * @param str String content of the shortcut to be rendered
 */

function renderContent(str) {
   var re = new RegExp("\\$text");
   re.global = true;
   if (!str)
      str = this.getTitle();
   var content = this.content.replace(re, str);
   if (content.indexOf("http://") == 0) {
      openLink(content);
      res.write(str);
      closeLink();
   }
   else
      res.write(content);
}


/**
 * function removes meta information marked by #
 * from a shortcut's title. this way different shortcuts
 * with the same output can be created (e.g. both shortcut and
 * shortcut#2 will be display as "shortcut" only).
 * @return String extracted title of the shortcut
 */

function getTitle() {
   var items = this.title.split("#");
   return(items[0]);
}
