/**
 * macro renders a list of existing topics as dropdown
 */
function topicchooser_macro(param) {
   var size = path.Site.images.topics.size();
   var options = new Array();
   for (var i=0;i<size;i++) {
      var topic = path.Site.images.topics.get(i);
      if (topic.size()) {
         options[i] = {value: topic.groupname, display: topic.groupname};
         if (req.data.addToTopic)
            var selected = req.data.addToTopic;
         else if (path.Image && path.Image.topic == topic.groupname)
            var selected = topic.groupname;
      }
   }
   Html.dropDown({name: "addToTopic"}, options, selected, param.firstOption);
   return;
}
