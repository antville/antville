var relocateProperty = function(proto, name, key) {
   if (!proto || !name) {
      return;
   }
   key || (key = name);
   proto.prototype.__defineGetter__(name, function() {
      return this[key];
   });
   proto.prototype.__defineSetter__(name, function(value) {
      this[key] = value;
      return;
   });
   return addPropertyMacro.apply(this, arguments);
};

var addPropertyMacro = function(proto, name, key) {
   key || (key = name);
   proto.prototype[name + "_macro"] = function(param) {
      if (param.as === "editor") {
         this.input_macro(param, key);
      } else {
         res.write(this[key]);
      }
   };
   return;
};

var formatTimestamp = function() {
   return formatDate.apply(this, arguments);
};

function logo_macro(param, name) {
   Images.Default.render(name || param.name || "smallchaos", param);
   return;
}

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
         html.textArea(param);
         break;
      case "checkbox" :
         html.checkBox(param);
         break;
      case "button" :
         // FIXME: this is left for backwards compatibility
         html.submit(param);
         break;
      case "submit" :
         html.submit(param);
         break;
      case "password" :
         html.password(param);
         break;
      case "radio" :
         html.radioButton(param);
         break;
      case "file" :
         html.file(param);
         break;
      default :
         html.input(param);
   }
   return;
}

function storylist_macro(param) {
   // disable caching of any contentPart containing this macro
   res.meta.cachePart = false;
   var site = param.of ? root.get(param.of) : res.handlers.site;
   if (!site)
      return;

   // untrusted sites are only allowed to use "light" version
   if (res.handlers.site && !res.handlers.site.trusted) {
      param.limit = param.limit ? Math.min(site.allstories.count(), parseInt(param.limit), 50) : 25;
      for (var i=0; i<param.limit; i++) {
         var story = site.stories.all.get(i);
         if (!story)
            continue;
         res.write(param.itemprefix);
         html.openLink({href: story.href()});
         var str = story.title;
         if (!str)
            str = story.getRenderedContentPart("text").stripTags().clip(10, "...", "\\s").softwrap(30);
         res.write(str ? str : "...");
         html.closeLink();
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
         var story = site.stories.all.get(id);
         if (!story)
            continue;
         if (param.skin) {
            story.renderSkin(param.skin);
         } else {
            res.write(param.itemprefix);
            html.openLink({href: story.href()});
            var str = story.title;
            if (!str)
               str = story.getRenderedContentPart("text").stripTags().clip(10, "...", "\\s").softwrap(30);
            res.write(str ? str : "...");
            html.closeLink();
            res.write(param.itemsuffix); 
         }         
      }
   }
   rows.release();
   return;
}

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
      html.link({href: "mailto:" + addr}, addr);
      if (i+1 < nOfMails)
         res.write(param.delimiter ? param.delimiter : ", ");
   }
	return;
}

// FIXME:
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

// FIXME:
function imagelist_macro(param) {
   var site = param.of ? root.get(param.of) : res.handlers.site;
   if (!site)
      return;
   if (!site.images.size())
      return;
   var max = Math.min(param.limit ? param.limit : 5, site.images.size());
   var idx = 0;
   var imgParam;
   var linkParam = {};
   delete param.limit;

   while (idx < max) {
      var imgObj = site.images.get(idx++);

      imgParam = Object.clone(param);
      delete imgParam.itemprefix;
      delete imgParam.itemsuffix;
      delete imgParam.as;
      delete linkParam.href;
      delete linkParam.onclick;

      res.write(param.itemprefix);
      // return different display according to param.as
      switch (param.as) {
         case "url":
            res.write(imgObj.getUrl());
            break;
         case "popup":
            linkParam.onclick = imgObj.getPopupUrl();
         case "thumbnail":
            linkParam.href = param.linkto ? param.linkto : imgObj.getUrl();
            if (imgObj.thumbnail)
               imgObj = imgObj.thumbnail;
         default:
            if (linkParam.href) {
               html.openLink(linkParam);
               renderImage(imgObj, imgParam);
               html.closeLink();
            } else
               renderImage(imgObj, imgParam);
      }
      res.write(param.itemsuffix);
   }
   return;
}

// FIXME: -> tags!
function topiclist_macro(param) {
   var site = param.of ? root.get(param.of) : res.handlers.site;
   if (!site)
      return;
   site.topics.topiclist_macro(param);
   return;
}

function imageoftheday_macro(param) {
   var s = res.handlers.site;
   var pool = res.handlers.site.images;
   if (pool==null) return;
   delete(param.topic);
   var img = pool.get(0);
   param.name = img.alias;
   return image_macro(param);
}

// FIXME: obsolete?
function username_macro(param) {
   if (!session.user)
      return;
   if (session.user.url && param.as == "link")
      html.link({href: session.user.url}, session.user.name);
   else if (session.user.url && param.as == "url")
      res.write(session.user.url);
   else
      res.write(session.user.name);
   return;
}
