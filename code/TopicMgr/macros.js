/**
 * function renders the list of topics as links
 */
function topiclist_macro(param) {
   if (!this.size())
      return;
   for (var i=0;i<this.size();i++) {
      var topic = this.get(i);
      res.write(param.itemprefix);
      Html.link(topic.href(), topic.groupname);
      res.write(param.itemsuffix);
   }
}