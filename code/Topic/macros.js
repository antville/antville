/**
 * Display a link to let the user add a new writeup 
 * to this topic.
 */
function addstory_macro (param) {
   try {
      path.Site.stories.checkAdd(session.user, req.data.memberlevel);
   } catch (deny) {
      return;
   }
   param.linkto = "create";
   param.urlparam = "topic=" + this.groupname;
   Html.openTag("a", path.Site.stories.createLinkParam(param));
   if (param.text)
      res.format(param.text);
   else
      res.write(getMessage("Topic.addStoryToTopic"));
   Html.closeTag("a");
   return;
}
