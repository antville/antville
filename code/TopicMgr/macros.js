/**
 * function renders the list of topics as links
 */
function topiclist_macro(param) {
   if (!this.size())
      return;
   for (var i=0;i<this.size();i++) {
      var topic = this.get(i);
      res.write(param.itemprefix);
      openLink(topic.href());
      res.write(topic.groupname);
      closeLink();
      res.write(param.itemsuffix);
   }
}