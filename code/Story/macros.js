/*
 * macro for rendering a part of the story content
 */
function content_macro(param) {
   switch (param.as) {
      case "editor" :
         var inputParam = this.content.createInputParam(param.part, param);
         delete inputParam.part;
         if (param.cols || param.rows)
            Html.textArea(inputParam);
         else
            Html.input(inputParam);
         break;

      case "image" :
         var part = this.content.getProperty(param.part);
         if (part && this.site.images.get(part)) {
            delete param.part;
            renderImage(this.site.images.get(part), param);
         }
         break;

      default :
         if (!param.clipping)
            param.clipping = "...";
         var part = this.getRenderedContentPart(param.part, param.as);
         if (!part && param.fallback)
            part = this.getRenderedContentPart(param.fallback, param.as);
         if (param.as == "link") {
            if (this._prototype != "Comment")
               Html.openLink({href: this.href()});
            else
               Html.openLink({href: this.story.href() + "#" + this._id});
            part = part ? part.stripTags() : param.clipping;
         }
         if (!param.limit)
            res.write(part);
         else
            res.write(part.clip(param.limit, param.clipping).softwrap(25));
         if (param.as == "link")
            Html.closeLink();
   }
   return;
}


/**
 * macro rendering online status of story
 */
function online_macro(param) {
   if (!this.online)
      res.write(param.no ? param.no : "offline");
   else
      res.write(param.yes ? param.yes : "online");
   return;
}


/**
 * macro rendering the location of the story
 */
function location_macro(param) {
   switch (this.online) {
      case 1:
         Html.link({href: this.site.topics.get(this.topic).href()}, "topic");
         break;
      case 2:
         res.write("site");
         break;
   }
   return;
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
      Html.input(param);
   } else if (this.createtime) {
      var text = formatTimestamp(this.createtime, param.format);
      if (param.as == "link" && this.online == 2)
         Html.link({href: path.Site.get(String(this.day)).href()}, text);
      else
         res.write(text);
   }
   return;
}

/**
 * macro rendering a link to edit
 * if user is allowed to edit
 */
function editlink_macro(param) {
   if (session.user) {
      try {
         this.checkEdit(session.user, req.data.memberlevel);
      } catch (deny) {
         return;
      }
      Html.openLink({href: this.href("edit")});
      if (param.image && this.site.images.get(param.image))
         this.site.renderImage(this.site.images.get(param.image), param);
      else
         res.write(param.text ? param.text : getMessage("generic.edit"));
      Html.closeLink();
   }
   return;
}

/**
 * macro rendering a link to delete
 * if user is creator of this story
 */
function deletelink_macro(param) {
   if (session.user) {
      try {
         this.checkDelete(session.user, req.data.memberlevel);
      } catch (deny) {
         return;
      }
      Html.openLink({href: this.href("delete")});
      if (param.image && this.site.images.get(param.image))
         this.site.renderImage(this.site.images.get(param.image), param);
      else
         res.write(param.text ? param.text : getMessage("generic.delete"));
      Html.closeLink();
   }
   return;
}

/**
 * macro renders a link to
 * toggle the online-status of this story
 */
function onlinelink_macro(param) {
   if (session.user) {
      try {
         this.checkEdit(session.user, req.data.memberlevel);
      } catch (deny) {
         return;
      }
      if (this.online && param.mode != "toggle")
         return;
      delete param.mode;
      var text = param.text;
      param.linkto = "edit";
      param.urlparam = "set=" + (this.online ? "offline" : "online");
      Html.openTag("a", this.createLinkParam(param));
      if (param.image && this.site.images.get(param.image))
         this.site.renderImage(this.site.images.get(param.image), param);
      else {
         // currently, only the "set online" text is customizable, since this macro
         // is by default only used in that context outside the story manager.
         if (this.online)
            res.write(getMessage("Story.setOffline"));
         else
            res.write(text ? text : getMessage("Story.setOnline"));
      }
      Html.closeTag("a");
   }
   return;
}

/**
 * macro renders a link to the story
 */
function viewlink_macro(param) {
   if (session.user) {
      try {
         this.checkView(session.user, req.data.memberlevel);
      } catch (deny) {
         return;
      }
      Html.openLink({href: this.href()});
      if (param.image && this.site.images.get(param.image))
         this.site.renderImage(this.site.images.get(param.image), param);
      else
         res.write(param.text ? param.text : "view");
      Html.closeLink();
   }
   return;
}

/**
 * macro rendering link to comments
 */
function commentlink_macro(param) {
   if (this.discussions && this.site.preferences.getProperty("discussions"))
      Html.link({href: this.href(param.to ? param.to : "comment")},
                param.text ? param.text : "comment");
   return;
}


/**
 * macro renders number of comments
 * options: text to use when no comment
 *          text to use when one comment
 *          text to use when more than one comment
 *          action to link to (default: main)
 */
function commentcounter_macro(param) {
   if (!this.site.preferences.getProperty("discussions") || !this.discussions)
      return;
   var commentCnt = this.comments.count();
   if (!param.linkto)
      param.linkto = "main";
   // cloning the param object to remove the macro-specific
   // attributes from the clone for valid markup output:
   var param2 = Object.clone(param);
   delete param2.one;
   delete param2.more;
   delete param2.no;
   var linkflag = (param.as == "link" && param.as != "text" || !param.as && commentCnt > 0);
   if (linkflag)
      Html.openTag("a", this.createLinkParam(param2));
   if (commentCnt == 0)
      res.write(param.no || param.no == "" ? param.no : getMessage("Comment.no"));
   else if (commentCnt == 1)
      res.write(param.one ? param.one : getMessage("Comment.one"));
   else
      res.write(commentCnt + (param.more ? param.more : " " + getMessage("Comment.more")));
   if (linkflag)
      Html.closeTag("a");
   return;
}

/**
 * macro loops over comments and renders them
 */
function comments_macro(param) {
   var s = this.story ? this.story : this;
   if (!s.site.preferences.getProperty("discussions") || !s.discussions)
      return;
   this.comments.prefetchChildren();
   for (var i=0;i<this.size();i++) {
      var c = this.get(i);
      var linkParam = new Object();
      linkParam.name = c._id;
      Html.openTag("a", linkParam);
      Html.closeTag("a");
      if (c.parent)
         c.renderSkin("reply");
      else
         c.renderSkin("toplevel");
   }
   return;
}

/**
 * macro checks if user is logged in and not blocked
 * if true, render form to add a comment
 */
function commentform_macro(param) {
   if (session.user) {
      res.data.action = this.href("comment");
      (new Comment()).renderSkin("edit");
   } else {
      Html.link({href: this.site.members.href("login")},
                param.text ? param.text : getMessage("Comment.loginToAdd"));
   }
   return;
}

/**
 * macro renders the property of story that defines if
 * other users may edit this story
 */
function editableby_macro(param) {
   if (param.as == "editor" && (session.user == this.creator || !this.creator)) {
      var options = [EDITABLEBY_ADMINS,
                     EDITABLEBY_CONTRIBUTORS,
                     EDITABLEBY_SUBSCRIBERS];
      var labels = [getMessage("Story.editableBy.admins"), 
                    getMessage("Story.editableBy.contributors"), 
                    getMessage("Story.editableBy.subscribers")];
      delete param.as;
      if (req.data.publish || req.data.save)
         var selValue = !isNaN(req.data.editableby) ? req.data.editableby : null;
      else
         var selValue = this.editableby;
      for (var i=0;i<options.length;i++) {
         Html.radioButton({name: "editableby", value: options[i], selectedValue: selValue});
         res.write("&nbsp;");
         res.write(labels[i]);
         res.write("&nbsp;");
      }
   } else {
      switch (this.editableby) {
         case 0 :
            res.write(getMessage("Story.editableBy.adminsLong", {siteTitle: path.Site.title}));
            return;
         case 1 :
            res.write(getMessage("Story.editableBy.contributorsLong", {siteTitle: path.Site.title}));
            break;
         case 2 :
            res.write(getMessage("Story.editableBy.subscribersLong", {siteTitle: path.Site.title}));
            break;
      }
   }
   return;
}

/**
 * macro renders a checkbox for enabling/disabling discussions
 * for backwards compatibility this macro also renders a hidden input
 * so that we can check if the checkbox is embedded in story/edit.skin
 */
function discussions_macro(param) {
   if (!path.Site.preferences.getProperty("discussions"))
      return;
   if (param.as == "editor") {
      var inputParam = this.createCheckBoxParam("discussions", param);
      if ((req.data.publish || req.data.save) && !req.data.discussions)
         delete inputParam.checked;
      Html.checkBox(inputParam);
   } else
      res.write(this.discussions ? getMessage("generic.yes") : getMessage("generic.no"));
   return;
}

/**
 * macro renders a list of existing topics as dropdown
 */
function topicchooser_macro(param) {
   var size = path.Site.topics.size();
   var options = new Array();
   for (var i=0;i<size;i++) {
      var topic = path.Site.topics.get(i);
      if (topic.size()) {
         options[i] = {value: topic.groupname, display: topic.groupname};
         if (req.data.addToTopic)
            var selected = req.data.addToTopic;
         else if (this.topic == topic.groupname)
            var selected = topic.groupname;
      }
   }
   Html.dropDown({name: "addToTopic"}, options, selected, param.firstOption);
   return;
}

/**
 * macro renders the name of the topic this story belongs to
 * either as link, image (if an image entiteld by the
 * topic name is available) or plain text
 */
function topic_macro(param) {
   if (!this.topic || !this.online)
      return;
   if (!param.as || param.as == "text")
      res.write(this.topic);
   else if (param.as == "link") {
      var text = param.text ? param.text : this.topic;
      Html.link({href: path.Site.topics.href(this.topic)}, text);
   } else if (param.as == "image") {
      if (!param.imgprefix)
         param.imgprefix = "topic_";
      var img = getPoolObj(param.imgprefix + this.topic, "images");
      if (!img)
         return;
      Html.openLink({href: path.Site.topics.href(this.topic)});
      renderImage(img.obj, param)
      Html.closeLink();
   }
   return;
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
      return this.cache.rBacklinks;

   var c = getDBConnection("antville");
   var dbError = c.getLastError();
   if (dbError)
      return getMessage("error.database", dbError);

   // we're doing this with direct db access here
   // (there's no need to do it with prototypes):
   var query = "select ACCESSLOG_REFERRER, count(*) as \"COUNT\" from AV_ACCESSLOG where ACCESSLOG_F_TEXT = " + this._id + " group by ACCESSLOG_REFERRER order by \"COUNT\" desc, ACCESSLOG_REFERRER asc;";
   var rows = c.executeRetrieval(query);
   var dbError = c.getLastError();
   if (dbError)
      return getMessage("error.database", dbError);

   // we show a maximum of 100 backlinks
   var limit = Math.min((param.limit ? parseInt(param.limit, 10) : 100), 100);
   res.push();

   var skinParam = new Object();
   var cnt = 0;
   while (rows.next() && cnt <= limit) {
      skinParam.count = rows.getColumnItem("COUNT");
      skinParam.referrer = rows.getColumnItem("ACCESSLOG_REFERRER");
      skinParam.text = skinParam.referrer.clip(50, "...", true);
      this.renderSkin("backlinkItem", skinParam);
      cnt++;
   }
   rows.release();
   // cache rendered backlinks and set timestamp for
   // checking if backlinks should be rendered again
   skinParam = {referrers: res.pop()};
   if (skinParam.referrers.length > 0)
      this.cache.rBacklinks = this.renderSkinAsString("backlinks", skinParam);
   else
      this.cache.rBacklinks = "";
   this.cache.lrBacklinks = new Date();
   res.write(this.cache.rBacklinks);
   return;
}

/**
 * macro renders a checkbox whether the story is
 * published on the site's front page
 */
function addtofront_macro(param) {
   if (param.as == "editor") {
      // if we're in a submit, use the submitted form value.
      // otherwise, render the object's value.
      if (req.data.publish || req.data.save) {
         if (!req.data.addToFront)
            delete param.checked;
      } else if (this.online != null && this.online < 2) {
         delete param.checked;
      }
      param.name = "addToFront";
      param.value = 1;
      delete param.as;
      Html.checkBox(param);
   }
   return;
}
