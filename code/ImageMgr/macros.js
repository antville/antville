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
   var size = Math.min(param.limit ? param.limit : 5,this.size());
   var imgcnt = 0;
   var idx = 0;
   while (imgcnt < size || imgcnt == size-1) {
      var imgObj = this.get(idx++);
      var url = param.linkto ? param.linkto : imgObj.getStaticUrl();

      res.write(param.itemprefix);
      // return different display according to param.as
      if (param.as == "thumbnail") {
         if (imgObj.thumbnail)
            imgObj = imgObj.thumbnail;
      } else if (param.as == "popup") {
         url = imgObj.popupUrl();
         if (imgObj.thumbnail)
            imgObj = imgObj.thumbnail;
      }
      if (url) {
         openLink(url);
         renderImage(imgObj,cloneObject(param));
         closeLink();
      } else
         renderImage(imgObj,cloneObject(param));
      res.write(param.itemsuffix);
      imgcnt++;
   }
   return;
}


