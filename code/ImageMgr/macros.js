/**
 * macro renders res.data.imagelist to response-object
 * left for backwards-compatibility only
 */

function images_macro(param) {
   res.write(res.data.imagelist);
   return;
}

/**
 * function renders a list of the newest n (default=10) thumbnails
 * or images
 * linkto="popup|main"
 */
function imagelist_macro(param) {
   if (!this.size())
      return;
   var size = Math.min(param.limit ? param.limit : 5,this.size());
   var imgcnt = 0;
   var idx = 0;
   while (imgcnt < size || imgcnt == this.size()-1) {
      var imgObj = this.get(idx++);
      var url = imgObj.getStaticUrl();
      res.write(param.itemprefix);
      if (imgObj.thumbnail) {
         openLink(imgObj.popupUrl());
         delete(param.linkto);
         renderImage(imgObj.thumbnail,new Object());
         closeLink();
         res.write(param.itemsuffix);
         imgcnt++;
      }
   }
   return;
}