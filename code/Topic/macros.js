/**
 * Display a link to let the use add a new writeup 
 * to this topic.
 */

function addstory_macro () {
   var membership = path.weblog.isUserMember(user);
   if (!membership)
      return;
   if ((membership.level & MAY_ADD_STORY) == 0)
      return;
   var param = new Object();
   param.link = path.weblog.stories.href("create")+"?topic="+this.groupname;
   this.renderSkin ("createStoryLink", param);
}

/**
 * Get related topics, i.e. topics that contain stories that
 * link back to this topic.
 * but avoiding self-referential backlinks
 */

function relatedtopics_macro (param) {
   this.related.subnodeRelation = "where TEXT like '%*" + this.groupname + "*%' AND (TOPIC is null OR TOPIC != '" + this.groupname + "') ORDER BY MODIFYTIME DESC";
   var l = this.related.size();
   if (l == 0)
      return;
   res.write (param.prefix);
   for (var i=0; i<l; i++)
      this.related.get(i).renderSkin("relatedLink");
   res.write (param.suffix);
}

/**
 * macro writes storylist to response-object
 * kept for backwards-compatibility only
 */

function storylist_macro(param) {
   res.write(param.prefix)
   res.write(res.data.storylist);
   res.write(param.suffix)
   return;
}
