/**
 * macro renders the current timestamp
 */
function now_macro(param) {
   return formatTimestamp(new Date(), param.format);
}


/**
 * macro renders the antville-logos
 */
function logo_macro(param) {
   if (!param.name)
      param.name = "smallchaos";
   var logo = root.images.get(param.name);
   if (!logo)
      return;
   Html.openLink("http://antville.org");
   renderImage(logo, param);
   Html.closeLink();
   return;
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
   var result = getPoolObj(param.name, "images");
   if (!result && param.fallback)
      result = getPoolObj(param.fallback, "images");
   if (!result)
      return;
   var imgObj = result.obj;
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
      param.onclick = imgObj.popupUrl();
      if (imgObj.thumbnail)
         imgObj = imgObj.thumbnail;
   }
   delete(param.name);
   delete(param.as);
   // render image tag
   if (param.linkto) {
      Html.openLink(param.linkto);
      delete(param.linkto);
      renderImage(imgObj, param);
      Html.closeLink();
   } else
      renderImage(imgObj, param);
   return;
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

   Html.openTag("a", param);
   res.write(content);
   Html.closeTag("a");
   return;
}


/**
 * macro fetches a file-object and renders a link to "getfile"-action
 */
function file_macro(param) {
   if (!param.name)
      return;
   var p = getPoolObj(param.name, "files");
   if (!p)
      return;
   if (!param.text)
      param.text = p.obj.alias;
   p.obj.renderSkin(param.skin ? param.skin : "main", param);
   return;
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
   var start = (path.site == null) ? 0 : 1;
   for (var i=start; i<path.length-1; i++) {
      title = path[i].getNavigationName();
      Html.link(path[i].href(), title);
      res.write(separator);
   }
   title = path[i].getNavigationName();
   if (req.action != "main" && path[i].main_action)
      Html.link(path[i].href(), title);
   else
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
   if (storyPath.length == 2) {
      var site = root.get(storyPath[0]);
      if (!site || !site.online)
         return;
   } else if (res.handlers.site)
      var site = res.handlers.site;
   else
      return;
   var story = site.allstories.get(storyPath[1] ? storyPath[1] : param.id);
   if (!story)
      return(getMessage("error", "storyNoExist", param.id));
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
      return getMessage("error.pollNoExist", param.id);
   if (param.as == "link")
      Html.link(poll.href(poll.closed ? "results" : ""), poll.question);
   else if (poll.closed || param.as == "results")
      poll.renderSkin("results");
   else {
      res.data.action = poll.href();
      poll.renderSkin("main");
   }
   return;
}


/**
 * macro basically renders a list of sites
 * calling root.renderSitelist() to do the real job
 */
function sitelist_macro(param) {
   // setting some general limitations:
   var minDisplay = 10;
   var maxDisplay = 25;
   var max = Math.min((param.limit ? parseInt(param.limit, 10) : minDisplay), maxDisplay);
   root.renderSitelist(max);
   res.write(res.data.sitelist);
   delete res.data.sitelist;
   return;
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
   if (!session.user)
      return;
   if (session.user.url)
      Html.link(session.user.url, session.user.name);
   else
      res.write(session.user.name);
   return;
}


/**
 * function renders a form-input
 */
function input_macro(param) {
   switch (param.type) {
      case "button" :
         break;
      case "radio" :
         param.selectedValue = req.data[param.name];
         break;
      default :
         param.value = param.name && req.data[param.name] ? req.data[param.name] : param.value;
   }
   switch (param.type) {
      case "textarea" :
         Html.textArea(param);
         break;
      case "checkbox" :
         Html.checkBox(param);
         break;
      case "button" :
         // FIXME: this is left for backwards compatibility
         Html.submit(param);
         break;
      case "submit" :
         Html.submit(param);
         break;
      case "password" :
         Html.password(param);
         break;
      case "radio" :
         Html.radioButton(param);
         break;
      case "file" :
         Html.file(param);
         break;
      default :
         Html.input(param);
   }
   return;
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
         Html.openLink(story.href());
         var str = story.title;
         if (!str)
            str = story.getRenderedContentPart("text").clip(20).softwrap(30);
         res.write(str ? str : "...");
         Html.closeLink();
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
         Html.openLink(story.href());
         var str = story.title;
         if (!str)
            str = story.getRenderedContentPart("text").clip(20).softwrap(30);
         res.write(str ? str : "...");
         Html.closeLink();
         res.write(param.itemsuffix);
      }
   }
   rows.release();
   return;
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
   param2.id = "cp1_" + param.name;
   if (!param.text)
      param.text = param.name;
   if (param.color)
   	param.color = renderColorAsString(param.color);

   if (path.story || path.storymgr) {
      var obj = path.story ? path.story : new story();
      param2.part = param.name;
      param.editor = obj.content_macro(param2);
      param.color = renderColorAsString(obj.content.getProperty(param.name));
   } else if (res.handlers.site) {
      var obj = res.handlers.site;
      param.editor = obj[param.name + "_macro"](param2);
      param.color = renderColorAsString(obj.preferences.getProperty(param.name));
   } else
      return;
   renderSkin("colorpickerWidget", param);
   return;
}


/**
 * fakemail macro <%fakemail number=%>
 * generates and renders faked email-adresses
 * param.number
 * (contributed by hr@conspirat)
 */

function fakemail_macro(param) {
	var tldList = ["com", "net", "org", "mil", "edu", "de", "biz", "de", "ch", "at", "ru", "de", "tv", "com", "st", "br", "fr", "de", "nl", "dk", "ar", "jp", "eu", "it", "es", "com", "us", "ca", "pl"];
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
      Html.link("mailto:" + addr, addr);
      if (i+1 < nOfMails)
         res.write(param.delimiter ? param.delimiter : ", ");
   }
	return;
}


/**
 * picks a random site, image or story by setting
 * param.what to the corresponding prototype
 * by default, embed.skin will be rendered but this
 * can be overriden using param.skin
 */
function randomize_macro(param) {
   if (!param)
      var param = new Object();
   if (!param.what || param.what == "sites") {
      var rnd = Math.floor(Math.random() * root.publicSites.size());
      var obj = root.publicSites.get(rnd);
   } else {
      if (param.site) {
         var parent = root.get(param.site);
         if (!parent.online)
            return;
      } else
         var parent = root;
      if (param.what == "stories")
         var coll = param.site ? parent.allstories : parent.storiesByID;
      else if (param.what == "images")
         var coll = parent.images;
      else
         return;
      var rnd = Math.floor(Math.random() * coll.size());
      var obj = coll.get(rnd);
   }
   obj.renderSkin(param.skin ? param.skin : "embed");
   return;
}
