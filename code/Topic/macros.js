/**
 * Display a link to let the use add a new writeup 
 * to this topic.
 */

function addstory_macro (param) {
   if ((req.data.memberlevel & MAY_ADD_STORY) == 0)
      return;
   var text = param.text;
   param.linkto = "create";
   param.urlparam = "topic=" + this.groupname;
   openMarkupElement("a",path.site.stories.createLinkParam(param));
   if (text)
      res.format(text);
   else
      res.write("add a story to this topic");
   closeMarkupElement("a");
}

/**
 * Get related topics, i.e. topics that contain stories that
 * link back to this topic.
 * but avoiding self-referential backlinks
 * DEPRECATED since the wiki-functionality was dropped!
 */

function relatedtopics_macro (param) {
   return;
   this.related.subnodeRelation = "where TEXT_F_SITE = " + path.site._id + " AND TEXT_TEXT like '%*" + this.groupname + "*%' AND (TEXT_TOPIC is null OR TEXT_TOPIC != '" + this.groupname + "') ORDER BY TEXT_MODIFYTIME desc";
   var l = this.related.size();
   if (l == 0)
      return;
   for (var i=0; i<l; i++)
      this.related.get(i).renderSkin("relatedLink");
}

/**
 * macro writes storylist to response-object
 * kept for backwards-compatibility only
 */

function storylist_macro(param) {
   res.write(res.data.storylist);
   return;
}
