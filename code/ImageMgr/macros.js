/**
 * function renders a list of the newest n (default=5) thumbnails
 * or images
 * FIXME: is this deprecated or even obsolete?
 * (we have response.imagelist in main.skin)
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
         Html.openLink({href: url});
         renderImage(imgObj, Object.clone(param));
         Html.closeLink();
      } else
         renderImage(imgObj, Object.clone(param));
      res.write(param.itemsuffix);
      imgcnt++;
   }
   return;
}


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
         else if (path.Picture && path.Picture.topic == topic.groupname)
            var selected = topic.groupname;
      }
   }
   Html.dropDown({name: "addToTopic"}, options, selected, param.firstOption);
   return;
}


/**
 * render a link to delete action
 * calls image.deletelink_macro, but only
 * if the layout in path is the one this image
 * belongs to
 */
function replacelink_macro(param) {
   if (this.layout && path.Layout != this.layout) {
      if (session.user) {
         try {
            path.Layout.images.checkAdd(session.user, req.data.memberlevel);
         } catch (deny) {
            return;
         }
         Html.openLink({href: path.Layout.images.href("create") + "?alias=" + this.alias});
         if (param.image && this.site.images.get(param.image))
            this.site.renderImage(this.site.images.get(param.image), param);
         else
            res.write(param.text ? param.text : getMessage("generic.replace"));
         Html.closeLink();
      }
      return;
   }
   return;
}
