/**
 * macro renders the current timestamp
 */
function now_macro(param) {
   return(formatTimestamp(new Date(),param.format));
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
   openLink(root.href());
   renderImage(logo, param);
   closeLink();
}


/**
 * macro renders an image out of image-pool
 * either as plain image, thumbnail, popup or url
 * param.name can contain a slash indicating that
 * the image belongs to a different site or to root
 */
function image_macro(param) {
   if (!param.name)
      return;
   var img = getPoolObj(param.name, "images");
   if (!img)
      return;
   var imgObj = img.obj;
   // return different display according to param.as
   if (param.as == "url")
      return(imgObj.getStaticUrl());
   else if (param.as == "thumbnail") {
      if (!param.linkto)
         param.linkto = imgObj.getStaticUrl();
      if (imgObj.thumbnail)
         imgObj = imgObj.thumbnail;
   } else if (param.as == "popup") {
      param.linkto = imgObj.getStaticUrl();
      param.onClick = imgObj.popupUrl();
      if (imgObj.thumbnail)
         imgObj = imgObj.thumbnail;
   }
   delete(param.name);
   delete(param.as);
   // render image tag
   if (param.linkto) {
      openLink(param.linkto);
      delete(param.linkto);
      renderImage(imgObj, param);
      closeLink();
   } else
      renderImage(imgObj, param);
   return;
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
      param.href += "?" + param.urlparam;
   if (param.anchor)
      param.href += "#" + param.anchor;
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
 * macro fetches a file-object and renders a link to "getfile"-action
 */
function file_macro(param) {
   if (!param.name)
      return;
   var p = getPoolObj(param.name,"files");
   if (!p)
      return;
   p.obj.renderSkin(param.skin ? param.skin : "main");
}


/**
 * Macro creates a string representing the objects in the
 * current request path, linked to their main action.
 */
function linkedpath_macro (param) {
   var separator = param.separator;
   if (!separator)
      separator = " &gt; ";
   var title;
   for (var i=1; i<path.length-1; i++) {
      title = path[i].getNavigationName();
      openLink(path[i].href());
      res.write(title);
      closeLink();
      res.write(separator);
   }
   title = path[i].getNavigationName();
   if (req.action != "main" && path[i].main_action) {
      openLink(path[i].href());
      res.write(title);
      closeLink();
   } else
      res.write(title);
   return;
}


/**
 * Renders the story with the specified id; uses preview.skin as default
 * but the skin to be rendered can be chosen with parameter skin="skinname"
 */
function story_macro(param) {
   if (!param.id)
      return;
   var storyPath = param.id.split("/");
   if (storyPath.length == 2)
      var site = root.get(storyPath[0]);
   else
      var site = res.handlers.site;
   if (!site)
      return;
   var story = site.allstories.get(storyPath[1] ? storyPath[1] : param.id);
   if (!story)
      return(getMessage("error","storyNoExist",param.id));
   story.renderSkin(param.skin ? param.skin : "embed");
   return;
}


/**
 * Renders a poll (optionally as link or results)
 */
function poll_macro(param) {
   // disable caching of any contentPart containing this macro
   req.data.cachePart = false;
   var parts = param.id.split("/");
   if (parts.length == 2)
      var site = root.get(parts[0]);
   else
      var site = res.handlers.site;
   if (!site)
      return;
   var poll = site.polls.get(parts[1] ? parts[1] : param.id);
   if (!poll)
      return(getMessage("error","pollNoExist",param.id));
   var deny = poll.isVoteDenied(session.user,req.data.memberlevel);
   if (poll.closed || param.as == "results")
      poll.renderSkin("results");
   else if (deny || param.as == "link") {
      openLink(poll.href());
      res.write(poll.question);
      closeLink();
   } else {
      res.data.action = poll.href();
      poll.renderSkin("main");
   }
}


/**
 * macro basically renders a list of sites
 * but first it checks which collection to use
 */
function sitelist_macro(param) {
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
      renderSkin("prevpagelink",sp);
      renderMarkupElement("br");
   }
   var cnt = 0;
   while (cnt < max && idx < size) {
      var w = collection.get(idx++);
      if (!w.blocked && w.online) {
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
 * wrapper-macro for imagelist
 */
function imagelist_macro(param) {
   var site = param.of ? root.get(param.of) : res.handlers.site;
   if (!site)
      return;
   site.images.imagelist_macro(param);
   return;
}


/**
 * wrapper-macro for topiclist
 */
function topiclist_macro(param) {
   var site = param.of ? root.get(param.of) : res.handlers.site;
   if (!site)
      return;
   site.topics.topiclist_macro(param);
   return;
}


/**
 * macro checks if the current session is authenticated
 * if true it returns the username
 */
function username_macro(param) {
   if (session.user) {
      if (session.user.url) {
         openLink(session.user.url);
         res.write(session.user.name);
         closeLink();
      } else
         res.write(session.user.name);
   }
   return;
}


/**
 * function renders a form-input
 */
function input_macro(param) {
   if (param.type!="button")
      param.value = param.name && req.data[param.name] ? req.data[param.name] : param.value;
   if (param.type == "textarea")
      return(renderInputTextarea(param));
   else if (param.type == "checkbox")
      return(renderInputCheckbox(param));
   else if (param.type == "button") {
      param.type = "submit";
      return(renderInputButton(param));
   } else if (param.type == "password")
      return(renderInputPassword(param));
   else if (param.type == "file")
      return(renderInputFile(param));
   else
      return(renderInputText(param));
}


/**
 * function renders a shortcut
 */
function shortcut_macro(param) {
   // disable caching of any contentPart containing this macro
   req.data.cachePart = false;
   if (param && param.name) {
      var sc = res.handlers.site.shortcuts.get(param.name);
      if (sc)
         sc.renderContent(param.text);
      else
         return(param.name);
   }
}


/**
 * function renders a list of stories either contained
 * in a topic or from the story collection.
 * param.sortby determines the sort criteria
 * (title, createtime, modifytime);
 * param.order determines the sort order (asc or desc)
 * param.show determines the text type (story, comment or all)
 */

function storylist_macro(param) {
   // disable caching of any contentPart containing this macro
   req.data.cachePart = false;
   var site = param.of ? root.get(param.of) : res.handlers.site;
   if (!site)
      return;

   // untrusted sites are only allowed to use "light" version
   if (res.handlers.site && !res.handlers.site.trusted) {
      param.limit = param.limit ? Math.min(site.allstories.count(), parseInt(param.limit), 50) : 25;
      for (var i=0; i<param.limit; i++) {
         var story = site.allcontent.get(i);
         if (!story)
            continue;
         res.write(param.itemprefix);
         openLink(story.href());
         var str = story.title;
         if (!str)
            str = softwrap(clipText(story.getRenderedContentPart("text"), 20))
         res.write(str ? str : "...");
         closeLink();
         res.write(param.itemsuffix);
      }     
      return;
   }

   // this is db-heavy action available for trusted users only (yet?)
   if (param.sortby != "title" && param.sortby != "createtime" && param.sortby != "modifytime")
      param.sortby = "modifytime";
   if (param.order != "asc" && param.order != "desc")
      param.order = "asc";
   var order = " order by TEXT_" + param.sortby.toUpperCase() + " " + param.order;
   var rel = "";
   if (param.show == "stories")
      rel += " and TEXT_PROTOTYPE = 'story'";
   else if (param.show == "comments")
      rel += " and TEXT_PROTOTYPE = 'comment'";
   if (param.topic)
      rel += " and TEXT_TOPIC = '" + param.topic + "'";
   var query = "select TEXT_ID from AV_TEXT where TEXT_F_SITE = " + site._id + " and TEXT_ISONLINE > 0" + rel + order;
   var connex = getDBConnection("antville");
   var rows = connex.executeRetrieval(query);

   if (rows) {
      var cnt = 0;
      param.limit = param.limit ? Math.min(parseInt(param.limit), 100) : 25;
      while (rows.next() && (cnt < param.limit)) {
         cnt++;
         var id = rows.getColumnItem("TEXT_ID").toString();
         var story = site.allcontent.get(id);
         if (!story)
            continue;
         res.write(param.itemprefix);
         openLink(story.href());
         var str = story.title;
         if (!str)
            str = softwrap(clipText(story.getRenderedContentPart("text"), 20))
         res.write(str ? str : "...");
         closeLink();
         res.write(param.itemsuffix);
      }
   }
   rows.release();
}


/**
 * a not yet sophisticated macro to display a 
 * colorpicker. works in site prefs and story editors
 */

function colorpicker_macro(param) {
   if (!param || !param.name)
      return;

   var param2 = new Object();
   param2.as = "editor";
   param2.width = "10";
   param2.onchange = "setColorPreview('" + param.name + "', this.value);";
   param2.id = "cp1_"+param.name;
   if (!param.text)
      param.text = param.name;
   if (param.color)
   	param.color = renderColorAsString(param.color);

   if (path.story || path.storymgr) {
      var obj = path.story ? path.story : new story();
      param2.part = param.name;
      param.editor = obj.content_macro(param2);
      param.color = renderColorAsString(obj.getContentPart(param.name));
   }
   else if (res.handlers.site) {
      var obj = res.handlers.site;
      param.editor = obj[param.name+"_macro"](param2);
      param.color = renderColorAsString(obj[param.name]);
   }
   else
      return;

   renderSkin("colorpickerWidget", param);
}


/**
 * fakemail macro <%fakemail number=%>
 * generates and renders faked email-adresses
 * param.number 
 * (contributed by hr@conspirat)
 */

function fakemail_macro(param) {
	var tldList = new Array("com", "net", "org", "mil", "edu", "de", "biz", "de", "ch", "at", "ru", "de", "tv", "com", "st", "br", "fr", "de", "nl", "dk", "ar", "jp", "eu", "it", "es", "com", "us", "ca", "pl");
   var nOfMails = param.number ? (param.number <= 50 ? param.number : 50) : 20;
   for (var i=0;i<nOfMails;i++) {
   	var tld = tldList[Math.floor(Math.random()*tldList.length)];
   	var mailName = "";
      var serverName = "";
   	var nameLength = Math.round(Math.random()*7) + 3;
   	for (var j=0;j<nameLength;j++)
   		mailName += String.fromCharCode(Math.round(Math.random()*25) + 97);
   	var serverLength = Math.round(Math.random()*16) + 8;
   	for (var j=0;j<serverLength;j++)
   		serverName += String.fromCharCode(Math.round(Math.random()*25) + 97);
      var addr = mailName + "@" + serverName + "." + tld;
      openLink("mailto:" + addr);
   	res.write(addr);
      closeLink();
      if (i+1 < nOfMails)
         res.write(param.delimiter ? param.delimiter : ", ");
   }
	return;
}
