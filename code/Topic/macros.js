/**
 * Display a link to let the use add a new writeup 
 * to this topic.
 */
function addstory_macro (param) {
   try {
      path.site.stories.checkAdd(session.user, req.data.memberlevel);
   } catch (deny) {
      return;
   }
   param.linkto = "create";
   param.urlparam = "topic=" + this.groupname;
   Html.openTag("a", path.site.stories.createLinkParam(param));
   if (param.text)
      res.format(param.text);
   else
      res.write(getMessage("topic.addStoryToTopic"));
   Html.closeTag("a");
   return;
}


/**
 * Display a link to let the use add a new image to this topic
 */
function addimage_macro (param) {
   try {
      path.site.images.checkAdd(session.user, req.data.memberlevel);
   } catch (deny) {
      return;
   }
   param.linkto = "create";
   param.urlparam = "topic=" + this.groupname;
   Html.openTag("a", path.site.images.createLinkParam(param));
   if (param.text)
      res.format(param.text);
   else
      res.write(getMessage("gallery.addImageToGallery"));
   Html.closeTag("a");
   return;
}
