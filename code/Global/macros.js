/**
 * macro renders the current timestamp
 */

function now_macro(param) {
   res.write(param.prefix)
   var now = new Date();
   if (param.format)
      res.write(now.format(param.format));
   else
      res.write(now.format("yyyy.MM.dd HH:mm"));
   res.write(param.suffix);
}

/**
 * macro renders the antville-logos
 */

/*
big = new Array("big.gif",404,53,"antville.org");
small = new Array("smallanim.gif",98,30,"resident of antville.org");
smalltrans = new Array("smallanim.gif",98,30,"resident of antville.org");
smallstraight = new Array("smallstraight.gif",107,24,"resident of antville.org");
smallchaos = new Array("smallchaos.gif",107,29,"resident of antville.org");
*/

function logo_macro(param) {
   if (!param.name)
      return;
   var logo = root.images.get(param.name);
   if (!logo)
      return;
   var linkParam = new Object();
   linkParam.to = "http://antville.org";
   root.openLink(linkParam);
   root.renderImage(logo,param);
   root.closeLink();
}


/**
 * macro renders an image out of image-pool
 * either as plain image or as image-link
 * overrideable parameters: width,height,alttext,border
 * additional parameters: align, valign
 * param.name can now contain a slash indicating that
 * the image belongs to a different weblog or to root
 */

function image_macro(param) {
   if (!param.name)
      return;
   var dp = imgDispatch(param.name);
   if (!dp)
      return;
   res.write(param.prefix);
   if (param.linkto) {
      dp.handler.openLink(param);
      dp.handler.renderImage(dp.img,param);
      dp.handler.closeLink(param);
   } else
      dp.handler.renderImage(dp.img,param);
   res.write(param.suffix);
}


/**
 * macro renders thumbnail
 * either as plain image, as link to popup (=default) or to external url
 * overrideable parameters: width,height,alttext,border
 * additional parameters: align, valign
 * param.name can now contain a slash indicating that
 * the image belongs to a different weblog
 */

function thumbnail_macro(param) {
   if (!param.name)
      return;
   var dp = imgDispatch(param.name);
   if (!dp || !dp.img.thumbnail)
      return;
   res.write(param.prefix);
   if (param.linkto) {
      dp.handler.openLink(param);
   } else {
      var linkParam = new Object();
      linkParam.linkto = dp.img.popupUrl();
      dp.handler.openLink(linkParam);
   }
   dp.handler.renderImage(dp.img.thumbnail,param);
   dp.handler.closeLink(param);
   res.write(param.suffix);
}

/**
 * macro renders the url to a specified image
 */

function imageurl_macro(param) {
   if (!param.name)
      return;
   var dp = imgDispatch(param.name);
   if (!dp)
      return;
   res.write(getProperty("imgUrl"));
   if (dp.handler.alias)
       res.write(dp.handler.alias + "/");
   res.write(dp.img.filename + "." + dp.img.fileext);
}

/**
 * wrapper-macro to enable calling link_macro without handler-prefix
 */

function link_macro(param) {
   path[path.length-1].link_macro(param);
}