/**
 * function renders the list of topics as links
 */
function topiclist_macro(param) {
   if (!this.size())
      return;
   for (var i=0;i<this.size();i++) {
      var topic = this.get(i);
      // check if topic has at least one story that
      // user is allowed to see
      var render = false;
      for (var j=0;j<topic.size();j++) {
         if (!topic.get(j).isViewDenied(session.user))
            render = true;
      }
      if (!render)
         continue;
      res.write(param.itemprefix);
      // FIXME: manual escaping because internal webserver doesn't
      // seem to understand spaces encoded as '+'
      openLink(this.href() + escape(topic.groupname));
      res.write(topic.groupname);
      closeLink();
      res.write(param.itemsuffix);
   }
}