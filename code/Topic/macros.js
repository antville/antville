/**
 * Display a link to let the use add a new writeup 
 * to this topic.
 */

function addstory_macro () {
   if (path.weblog.isUserContributor(user) || path.weblog.isUserAdmin(user)) {
      var param = new Object();
      param.link = path.weblog.stories.href("create")+"?topic="+this.groupname;
      this.renderSkin ("createStoryLink", param);
   }
}

/**
 * Get related topics, i.e. topics that contain stories that
 * link back to this topic.
 */

function relatedtopics_macro (param) {
   this.related.subnodeRelation = "where TEXT like '%*"+this.groupname+"*%' ";
   var l = this.related.size();
   if (l == 0)
      return;
   res.write (param.prefix);
   for (var i=0; i<l; i++) {
      var s = this.related.get(i);
      s._parent.renderSkin("relatedLink");
   }
   res.write (param.suffix);
}


