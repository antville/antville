/**
 * macro renders the current timestamp
 */

function now_macro(param) {
   res.write(param.prefix)
   var now = new Date();
   if (path.weblog)
      res.write(path.weblog.formatTimestamp(now,param));
   else if (param.format) {
      var sdf = new java.text.SimpleDateFormat(param.format);
      var result = tryEval("sdf.format(now)");
      if (result.error)
         return ("[error: wrong date-format]");
      return (result.value);
   } else
      res.write(now.format("yyyy.MM.dd HH:mm"));
   res.write(param.suffix);
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
   var p = getPoolObj(param.name,"images");
   if (!p)
      return;
   res.write(param.prefix);
   if (param.linkto) {
      p.parent.openLink(param);
      p.parent.renderImage(p.obj,param);
      p.parent.closeLink(param);
   } else
      p.parent.renderImage(p.obj,param);
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
   var p = getPoolObj(param.name,"images");
   if (!p || !p.obj.thumbnail)
      return;
   res.write(param.prefix);
   if (param.linkto) {
      p.parent.openLink(param);
   } else {
      var linkParam = new Object();
      linkParam.linkto = p.obj.popupUrl();
      p.parent.openLink(linkParam);
   }
   p.parent.renderImage(p.obj.thumbnail,param);
   p.parent.closeLink(param);
   res.write(param.suffix);
}

/**
 * macro renders the url to a specified image
 */

function imageurl_macro(param) {
   if (!param.name)
      return;
   var p = getPoolObj(param.name,"images");
   if (!p)
      return;
   res.write(getProperty("imgUrl"));
   if (p.obj.weblog)
       res.write(p.obj.weblog.alias + "/");
   res.write(p.obj.filename + "." + p.obj.fileext);
}

/**
 *  Global link macro. In contrast to the hopobject link macro,
 *  this reproduces the link target without further interpretation.
 */

function link_macro(param) {
   res.write(param.prefix)
   res.write("<a href=\"");
   var url = param.to ? param.to : param.linkto;
   res.write(url);
   if (param.urlparam) res.write(param.urlparam);
   if (param.anchor) res.write(param.anchor);
   res.write("\"");
   if (param.target)
      res.write(" target=\"" + param.target + "\"");
   res.write(">");
   if (param.text)
      res.write(param.text);
   else
      res.write(param.to ? param.to : param.linkto);
   res.write("</a>");
   res.write(param.suffix);
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
   res.write(param.prefix);
   p.obj.renderSkin(param.useskin ? param.useskin : "main");
   res.write(param.suffix);
}

/**
 * Macro creates a string representing the objects in the
 * current request path, linked to their main action.
 */

function linkedpath_macro (param) {
   res.write(param.prefix);
   var separator = param.separator;
   if (!separator)
       separator = " &gt; ";
   var title = "Home";
   for (var i=1; i<path.length-1; i++) {
       title = path[i].getNavigationName();
       res.write("<a href=\""+path[i].href()+"\">"+title+"</a>"+separator);
   }

   title = path[path.length-1].getNavigationName();
   res.write (title);
   res.write(param.suffix);
}


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
	var deny = poll.isVoteDenied(user);
	if (deny || param.as == "link")
		return('<a href="' + poll.href() + '">' + poll.question + '</a>');
	if (poll.closed || param.as == "results")
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

   res.write(param.prefix);
   var idx = parseInt (req.data.start,10);
   var max = Math.min((param.limit ? parseInt(param.limit,10) : minDisplay),maxDisplay);

   var scroll = (!param.scroll || param.scroll == "no" ? false : true);

   if (isNaN(idx) || idx > size-1 || idx < 0)
      idx = 0;
   if (scroll && idx > 0) {
      var sp = new Object();
      sp.url = root.href("list") + "?start=" + Math.max(0, idx-max);
      sp.text = "previous weblogs";
      res.write(renderSkinAsString("prevpagelink",sp) + "<br>");
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
      res.write("<br>" + renderSkinAsString("nextpagelink",sp));
   }
   res.write(param.suffix);
}
