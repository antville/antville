/**
 * macro renders res.data.imagelist to response-object
 * left for backwards-compatibility only
 */

function images_macro(param) {
   res.write(res.data.imagelist);
   return;
}

/**
 * function renders a list of the newest n (default=5) thumbnails
 * or images
 */
function imagelist_macro(param) {
   if (!this.size())
      return;
   var size = Math.min(param.limit ? param.limit : 5, this.size());
   var imgcnt = 0;
   var idx = 0;
   while (imgcnt < size || imgcnt == size-1) {
      var imgObj = this.get(idx++);
      var url = param.linkto ? param.linkto : imgObj.getUrl();

      res.write(param.itemprefix);
      // return different display according to param.as
      if (param.as == "thumbnail") {
         if (imgObj.thumbnail)
            imgObj = imgObj.thumbnail;
      } else if (param.as == "popup") {
         url = imgObj.getPopupUrl();
         if (imgObj.thumbnail)
            imgObj = imgObj.thumbnail;
      }
      if (url) {
         Html.openLink(url);
         renderImage(imgObj, ObjectLib.clone(param));
         Html.closeLink();
      } else
         renderImage(imgObj, ObjectLib.clone(param));
      res.write(param.itemsuffix);
      imgcnt++;
   }
   return;
}


/**
 * macro renders a list of existing topics as dropdown
 */
function topicchooser_macro(param) {
   var size = path.site.images.topics.size();
   var options = new Array();
   for (var i=0;i<size;i++) {
      var topic = path.site.images.topics.get(i);
      if (topic.size()) {
         options[i] = {value: topic.groupname, display: topic.groupname};
         if (req.data.addToTopic)
            var selected = req.data.addToTopic;
         else if (path.image && path.image.topic == topic.groupname)
            var selected = topic.groupname;
      }
   }
   Html.dropDown("addToTopic", options, selected, "-- choose gallery --");
   return;
}
