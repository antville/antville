/**
 * Display a link to let the use add a new writeup 
 * to this topic.
 */

function addstory_macro () {
   var membership = path.site.isUserMember(session.user);
   if (!membership)
      return;
   if ((membership.level & MAY_ADD_STORY) == 0)
      return;
   var param = new Object();
   param.link = path.site.stories.href("create")+"?topic="+this.groupname;
   this.renderSkin ("createStoryLink", param);
}

/**
 * Get related topics, i.e. topics that contain stories that
 * link back to this topic.
 * but avoiding self-referential backlinks
 */

function relatedtopics_macro (param) {
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
