/*
 * macro for rendering a part of the content.
 * FIXME & FOXME: this macro should be completely rewritten post 1.0
 */
function content_macro(param) {
   if (param.as == "editor") {
      // this is a first trial to add a title like
      // "Re: title of previous posting" to a new posting
      // (works only if autoresponse="true" is set in the macro)
      if (param.autoresponse == "true" && param.part == "title" && !this.content) {
         if (path.comment && path.comment.title)
            param.value = "Re: " + path.comment.title;
         else if (path.story && path.story.title)
            param.value = "Re: " + path.story.title;
      } else if (req.data["content_" + param.part]) {
         // if there's a part-value in request.data available use it:
         param.value = unescape(req.data["content_" + param.part]);
      } else
         param.value = this.getContentPart(param.part);
      param.name = "content_" + param.part;
      delete(param.part);
      if (!param.height || parseInt(param.height,10) == 1)
         renderInputText(param);
      else
         renderInputTextarea(param);
   } else if (param.as == "image") {
      var part = this.getContentPart (param.part);
      if (part && this.site.images[part]) {
         delete (param.part);
         renderImage (this.site.images[part], param);
      }
   } else {
      var part = this.getRenderedContentPart (param.part);
      if (!part && param.fallback)
         part = this.getRenderedContentPart (param.fallback);
      if (param.as == "link") {
         if (this._prototype != "comment")
            openLink(this.href());
         else
            openLink(this.story.href()+"#"+this._id);
         if (!part && param.part == "title") {
            // FIXME: this should go post 1.0 final
            part = stripTags(this.getRenderedContentPart ("text")).trim();
            param.limit = "20";
         }
         if (!part)
            part = "...";
      }
      if (!param.limit)
         res.write(part);
      else
         res.write(softwrap(clipText(part, param.limit, param.clipping)));
      if (param.as == "link")
         closeLink();
   }
}

/**
 * macro rendering title of story
 */

function title_macro(param) {
   param.part = "title";
   this.content_macro (param);
}

/**
 * macro rendering text of story
 */

function text_macro(param) {
   param.part = "text";
   this.content_macro (param);
}

/**
 * macro rendering online-status of story
 */

function online_macro(param) {
   if (param.as == "editor") {
      var options = new Array("offline","online in topic","online in weblog");
      renderDropDownBox("online",options,this.online);
   } else {
      if (!this.online)
         res.write("offline");
      else if (this.online < 2) {
         res.write("online in ");
         if (this.topic) {
           openLink(this.site.topics.get(this.topic).href());
           res.write(this.topic);
           closeLink();
         } else {
           res.write ("stories");
         }
      } else
         res.write("online in weblog");
   }
}

/**
 * macro rendering createtime of story, either as editor,
 * plain text or as link to the frontpage of the day
 */

function createtime_macro(param) {
   if (param.as == "editor") {
      if (this.createtime)
         param.value = formatTimestamp(this.createtime, "yyyy-MM-dd HH:mm");
      else
         param.value = formatTimestamp(new Date(), "yyyy-MM-dd HH:mm");
      param.name = "createtime";
      renderInputText(param);
   } else if (this.createtime) {
      var text = formatTimestamp(this.createtime,param.format);
      if (param.as == "link" && this.online == 2) {
         openLink(this.site.get(String(this.day)).href());
         res.write(text);
         closeLink();
      } else
         res.write(text);
   }
   return;
}

/**
 * macro renders the name of the author
 * !!! left for backwards-compatibility !!!
 */

function author_macro(param) {
   this.creator_macro(param);
}

/**
 * macro renders the name of the modifier
 */

function modifier_macro(param) {
   if (!this.modifier)
      return;
   if (param.as == "link" && this.modifier.url) {
      openLink(this.modifier.url);
      res.write(this.modifier.name);
      closeLink();
   } else
      res.write(this.modifier.name);
}

/**
 * macro rendering a link to edit
 * if user is allowed to edit
 */

function editlink_macro(param) {
   if (session.user && !this.isEditDenied(session.user,req.data.memberlevel)) {
      openLink(this.href("edit"));
      if (param.image && this.site.images.get(param.image))
         this.site.renderImage(this.site.images.get(param.image),param);
      else
         res.write(param.text ? param.text : "edit");
      closeLink();
   }
}

/**
 * macro rendering a link to delete
 * if user is creator of this story
 */

function deletelink_macro(param) {
   if (session.user && !this.isDeleteDenied(session.user,req.data.memberlevel)) {
      openLink(this.href("delete"));
      if (param.image && this.site.images.get(param.image))
         this.site.renderImage(this.site.images.get(param.image),param);
      else
         res.write(param.text ? param.text : "delete");
      closeLink();
   }
}

/**
 * macro renders a link to
 * toggle the online-status of this story
 */

function onlinelink_macro(param) {
   if (session.user && !this.isEditDenied(session.user,req.data.memberlevel)) {
      if (this.online && param.mode != "toggle")
         return;
      delete param.mode;
      param.linkto = "edit";
      param.urlparam = "set=" + (this.online ? "offline" : "online");
      openMarkupElement("a",this.createLinkParam(param));
      if (param.image && this.site.images.get(param.image))
         this.site.renderImage(this.site.images.get(param.image),param);
      else
         res.write(this.online ? "set offline" : "set online");
      closeMarkupElement("a");
   }
}

/**
 * macro renders a link to the story
 */

function viewlink_macro(param) {
   if (session.user && this.isViewDenied(session.user,req.data.memberlevel))
      return;
   openLink(this.href());
   if (param.image && this.site.images.get(param.image))
      this.site.renderImage(this.site.images.get(param.image),param);
   else
      res.write(param.text ? param.text : "view");
   closeLink();
}

/**
 * macro rendering link to comments
 */

function commentlink_macro(param) {
   if (!this.discussions || !this.site.discussions)
      return;
   openLink(this.href(param.to ? param.to : "comment"));
   res.write(param.text ? param.text : "comment");
   closeLink();
}


/**
 * macro renders number of comments
 * options: text to use when no comment
 *          text to use when one comment
 *          text to use when more than one comment
 *          action to link to (default: main)
 */

function commentcounter_macro(param) {
   if (!this.discussions)
      return;
   var commentCnt = this.comments.count();
   if (!param.linkto)
      param.linkto = "main";
   // cloning the param object to remove the macro-specific 
   // attributes from the clone for valid markup output:
   var param2 = cloneObject(param);
   delete param2.one;
   delete param2.more;
   delete param2.no;
   var linkflag = (param.as == "link" && param.as != "text" || !param.as && commentCnt > 0);
   if (linkflag)
      openMarkupElement("a", this.createLinkParam(param2));
   if (commentCnt == 0)
      res.write(param.no ? param.no : "0 comments");
   else if (commentCnt == 1)
      res.write(param.one ? param.one : "1 comment");
   else
      res.write(commentCnt + (param.more ? param.more : " comments"));
   if (linkflag)
      closeMarkupElement("a");
   return;
}

/**
 * macro loops over comments and renders them
 */

function comments_macro(param) {
   var s = this.story ? this.story : this;
   if (!s.discussions)
      return;
   this.comments.prefetchChildren();
   for (var i=0;i<this.size();i++) {
      var c = this.get(i);
      var linkParam = new Object();
      linkParam.name = c._id;
      openMarkupElement("a", linkParam);
      closeMarkupElement("a");
      if (c.parent)
         c.renderSkin("reply");
      else
         c.renderSkin("toplevel");
   }
}

/**
 * macro checks if user is logged in and not blocked
 * if true, render form to add a comment
 */

function commentform_macro(param) {
   if (session.user) {
      var c = new comment();
      res.data.action = this.href("comment");
      c.renderSkin("edit");
   } else {
      openLink(this.site.members.href("login"));
      res.write (param.text ? param.text : "Login to add your comment!");
      closeLink();
   }
}

/**
 * macro left for backwards-compatibility
 * calls global image_macro()
 */

function image_macro(param) {
   image_macro(param);
}

/**
 * macro left for backwards-compatibility
 * calls global image_macro() as "popup"
 */

function thumbnail_macro(param) {
   param.as = "popup";
   image_macro(param);
}


/**
 * macro renders the property of story that defines if
 * other users may edit this story
 */

function editableby_macro(param) {
   if (param.as == "editor" && (session.user == this.creator || !this.creator)) {
      var options = new Array(null,0,1);
      var labels = new Array("the author","all subscribers","all contributors");
      for (var i=0;i<options.length;i++) {
        param.name = "editableby";
        param.value = options[i];
        param.selectedValue = this.editableby;
        renderInputRadio(param);
        res.write("&nbsp;");
        res.write(labels[i]);
        res.write("&nbsp;");
      }
   } else {
      if (this.editableby == 0)
         res.write("Subscribers of and contributors to " + this.site.title);
      else if (this.editableby == 1)
         res.write("Contributors to " + this.site.title);
      else
         res.write("Content managers and admins of " + this.site.title);
   }
   return;
}

/**
 * macro renders a checkbox for enabling/disabling discussions
 * for backwards compatibility this macro also renders a hidden input
 * so that we can check if the checkbox is embedded in story/edit.skin
 */

function discussions_macro(param) {
   if (param.as == "editor") {
      if (this.discussions == null && path.site.discussions)
         param.checked = "checked";
      renderInputCheckbox(this.createInputParam("discussions", param));
      var attr = new Object();
      attr.type = "hidden";
      attr.name = "discussions";
      attr.value = "0";
      renderMarkupElement("input", attr);
   } else
      res.write(this.discussions ? "yes" : "no");
   return;
}

/**
 * macro renders a list of existing topics as dropdown
 */

function topicchooser_macro(param) {
   var size = path.site.topics.size();
   var options = new Array();
   for (var i=0;i<size;i++) {
      var topic = path.site.topics.get(i);
      if (topic.size()) {
         options[i] = topic.groupname;
         if (req.data.topicidx != null) {
            if (req.data.topicidx == i)
               var selectedIndex = i;
         } else if (this.topic == topic.groupname)
            var selectedIndex = i;
      }
   }
   renderDropDownBox("topicidx", options, selectedIndex, "-- choose topic --");
}

/**
 * macro renders the name of the topic this story belongs to
 * either as link, image (if an image entiteld by the 
 * topic name is available) or plain text
 * NOTE: for backwards compatibility, the default is a link and
 * you have to set "text" explicitely (which is not so nice, imho.)
 */

function topic_macro(param) {
   if (!this.topic)
      return;
   if (!param.as || param.as == "link") {
      openLink(this.site.topics.href(this.topic));
      res.write(this.topic);
      closeLink();
   } else if (param.as == "image") {
      if (!param.imgprefix)
         param.imgprefix = "topic_";
      var img = getPoolObj(param.imgprefix+this.topic, "images");
      if (!img)
         return;
      openLink(this.site.topics.href(this.topic));
      renderImage(img.obj, param)
      closeLink();
   } else if (param.as = "text")
      res.write(this.topic);
}


/**
 * macro returns a list of references linking to a story
 * since referrers are asynchronously written to database by scheduler
 * it makes sense to cache them in story.cache.rBacklinks because they
 * won't change until the next referrer-update was done
 * @return String rendered backlinks
 */
function backlinks_macro(param) {
   // check if scheduler has done a new update of accesslog
   // if not and we have cached backlinks simply return them
   if (this.cache.lrBacklinks >= app.data.lastAccessLogUpdate)
      return (this.cache.rBacklinks)

   var c = getDBConnection("antville");
   var dbError = c.getLastError();
   if (dbError)
      return (getMessage("error","database",dbError));
   
   // we're doing this with direct db access here
   // (there's no need to do it with prototypes):
   var query = "select ACCESSLOG_REFERRER, count(*) as \"COUNT\" from AV_ACCESSLOG where ACCESSLOG_F_TEXT = " + this._id + " group by ACCESSLOG_REFERRER order by \"COUNT\" desc, ACCESSLOG_REFERRER asc;";                                
   var rows = c.executeRetrieval(query);
   var dbError = c.getLastError();
   if (dbError)
      return (getMessage("error","database",dbError));
   
   // we show a maximum of 100 backlinks
   var limit = Math.min((param.limit ? parseInt(param.limit,10) : 100),100);
   var backlinks = new java.lang.StringBuffer();

   // if user specified some servers to be excluded from backlink-list
   // create the RegExp-Object for filtering
   if (param.exclude) {
      var r = new RegExp("\\s*,\\s*");
      r.global = true;
      var excludeStr = param.exclude.replace(r,"|");
      var exclude = new RegExp(excludeStr);
   }

   var skinParam = new Object();
   var cnt = 0;
   while (rows.next() && cnt <= limit) {
      skinParam.count = rows.getColumnItem("COUNT");
      skinParam.referrer = rows.getColumnItem("ACCESSLOG_REFERRER");
      if (exclude && exclude.test(skinParam.referrer))
         continue;
      skinParam.text = skinParam.referrer.length > 50 ? skinParam.referrer.substring(0, 50) + "..." : skinParam.referrer;
      backlinks.append(this.renderSkinAsString("backlinkItem", skinParam));
      cnt++;
   }
   rows.release();
   // cache rendered backlinks and set timestamp for
   // checking if backlinks should be rendered again
   skinParam = new Object();
   if (backlinks.length() > 0) {
      skinParam.referrers = backlinks.toString();
      this.cache.rBacklinks = this.renderSkinAsString("backlinks", skinParam);
   } else
      this.cache.rBacklinks = "";
   this.cache.lrBacklinks = new Date();
   return (this.cache.rBacklinks);
}

/**
 * macro renders a checkbox whether the story
 * is just published in a topic or also in weblog
 */
function justintopic_macro(param) {
   if (param.as == "editor") {
      if (req.data.publish || req.data.submit == "publish") {
         if (!req.data.online)
            delete param.checked;
         else if (req.data.online == 1 || this.online == 1)
            param.checked = "checked";
      } else {
         if (this.online != 1)
            delete param.checked;
         else
            param.checked = "checked";
      }
      param.name = "online";
      renderInputCheckbox(param);
      var attr = new Object();
      attr.value = 2;
      attr.name = "onlinedefault";
      attr.type = "hidden";
      renderMarkupElement("input", attr);
   }
   return;
}


/**
 * macro renders a checkbox whether the story is
 * published on the weblog's front page
 */
function addtofront_macro(param) {
   if (param.as == "editor") {
      if (req.data.publish || req.data.submit == "publish") {
         if (!req.data.online)
            delete param.checked;
         else if (req.data.online == 2 || this.online == 2)
            param.checked = "checked";
      } else {
         if (this.online != null && this.online < 2)
            delete param.checked;
         else
            param.checked = "checked";
      }
      param.value = 2;
      param.name = "online";
      renderInputCheckbox(param);
      var attr = new Object();
      attr.value = 1;
      attr.name = "onlinedefault";
      attr.type = "hidden";
      renderMarkupElement("input", attr);
   }
   return;
}


/**
 * macro renders id of a story
 */
function id_macro() {
   res.write(this._id);
   return;
}
