/**
 * macro renders the current timestamp
 */
function now_macro(param) {
   var now = new Date();
   if (path.weblog)
      res.write(formatTimestamp(now,param.format));
   else if (param.format) {
      var sdf = new java.text.SimpleDateFormat(param.format);
      var result = tryEval("sdf.format(now)");
      if (result.error)
         return ("[error: wrong date-format]");
      return (result.value);
   } else
      res.write(now.format("yyyy.MM.dd HH:mm"));
}


/**
 * macro renders the antville-logos
 */
function logo_macro(param) {
  if (!param.name)
    return;
  var logo = root.images.get(param.name);
  if (!logo)
    return;
  var linkParam = new Object();
  linkParam.href = root.href();

  openMarkupElement("a", linkParam);
  renderImage(logo, param);
  closeMarkupElement("a");
}


/**
 * macro renders an image out of image-pool
 * either as plain image, thumbnail, popup or url
 * param.name can contain a slash indicating that
 * the image belongs to a different weblog or to root
 */
function image_macro(param) {
  if (!param.name)
    return;
  var img = getPoolObj(param.name, "images");
  if (!img)
    return;
  var imgObj = img.obj;
  var url = imgObj.getStaticUrl();
  // return different display according to param.as
  if (param.as == "url")
    return(url);
  if (param.as == "thumbnail") {
    if (!param.linkto)
      param.linkto = url;
    imgObj = imgObj.thumbnail;
  }
  if (param.as == "popup") {
    param.linkto = imgObj.popupUrl();
    imgObj = imgObj.thumbnail;
  }
  delete(param.name);
  delete(param.as);

  // render image tag
  if (param.linkto) {
    var linkparam = new Object();
    linkparam.href = param.linkto;
    delete(param.linkto);
    openMarkupElement("a", linkparam);
    renderImage(imgObj, param);
    closeMarkupElement("a");
  }
  else
    renderImage(imgObj, param);
}


/** 
 * DEPRECATED!
 * use image_macro() with param.as = "popup" instead
 */
function thumbnail_macro(param) {
  param.as = "popup";
  image_macro(param);
}


/**
 * DEPRECATED!
 * use image_macro() with param.as = "url" instead
 */
function imageurl_macro(param) {
  param.as = "url";
  image_macro(param);
}


/**
 *  Global link macro. In contrast to the hopobject link macro,
 *  this reproduces the link target without further interpretation.
 */
function link_macro(param) {
  if (param.to)
    param.href = param.to;
  else // backwards compatibility
    param.href = param.linkto;
  if (param.urlparam)
    param.href += param.urlparam;
  if (param.anchor)
    param.href += param.anchor;
  var content = param.text ? param.text : param.href;

  delete param.to;
  delete param.linkto;
  delete param.urlparam;
  delete param.anchor;
  delete param.text;

  openMarkupElement("a", param);
  res.write(content);
  closeMarkupElement("a");
}


/**
 * macro fetches a goodie-object and renders a link to "getgoodie"-action
 */
function goodie_macro(param) {
   if (!param.name)
      return;
   var p = getPoolObj(param.name,"goodies");
   if (!p)
      return;
   p.obj.renderSkin(param.useskin ? param.useskin : "main");
}


/**
 * Macro creates a string representing the objects in the
 * current request path, linked to their main action.
 */
function linkedpath_macro (param) {
  var separator = param.separator;
  if (!separator)
    separator = " &gt; ";
  var title = "Home";
  for (var i=1; i<path.length-1; i++) {
    title = path[i].getNavigationName();
    var linkparam = new Object();
    linkparam.href = path[i].href();
    openMarkupElement("a", linkparam);
    res.write(title);
    closeMarkupElement("a");
    res.write(separator);
  }
  title = path[path.length-1].getNavigationName();
  res.write(title);
}


/**
 * Renders a poll (optionally as link or results)
 */
function poll_macro(param) {
  var parts = param.id.split("/");
  if (parts.length == 2) {
    var blog = root.get(parts[0]);
    var poll = blog.polls.get(parts[1]);
  }
  else {
    var blog = path.weblog;
    var poll = blog.polls.get(param.id);
  }
  if (!poll)
    return("[poll id " + param.id + " does not exist.]");
  var deny = poll.isVoteDenied(session.user);
  if (deny || param.as == "link") {
    var linkparam = new Object();
    linkparam.href = poll.href();
    openMarkupElement("a", linkparam);
    res.write(poll.question);
    closeMarkupElement("a");
  }
  else if (poll.closed || param.as == "results")
    poll.renderSkin("results");
  else {
    res.data.action = poll.href();
    poll.renderSkin("main");
  }
}


/**
 * macro basically renders a list of weblogs
 * but first it checks which collection to use
 */
function webloglist_macro(param) {
  if (param.show == "all")
    var collection = root.public;
  else
    var collection = root;

  var size = collection.size();
  if (!size)
    return;

  // setting some general limitations:
  var minDisplay = 10;
  var maxDisplay = 100;

  var idx = parseInt (req.data.start,10);
  var max = Math.min((param.limit ? parseInt(param.limit,10) : minDisplay),maxDisplay);

  var scroll = (!param.scroll || param.scroll == "no" ? false : true);

  if (isNaN(idx) || idx > size-1 || idx < 0)
    idx = 0;
  if (scroll && idx > 0) {
    var sp = new Object();
    sp.url = root.href("list") + "?start=" + Math.max(0, idx-max);
    sp.text = "previous weblogs";
    renderSkinAsString("prevpagelink",sp);
    renderMarkupElement("br");
  }
  var cnt = 0;
  while (cnt < max && idx < size) {
    var w = collection.get(idx++);
    if (!w.isBlocked() && !w.isNotPublic()) {
      w.renderSkin("preview");
      cnt++;
    }
  }
  if (scroll && idx < size) {
    var sp = new Object();
    sp.url = root.href("list") + "?start=" + idx;
    sp.text = "more weblogs";
    renderMarkupElement("br");
    renderSkin("nextpagelink",sp);
  }
}


/**
 * macro checks if the current session is authenticated
 * if true it returns the username
 */

function username_macro(param) {
   if (session.user)
      res.write(session.user.name);
   return;
}