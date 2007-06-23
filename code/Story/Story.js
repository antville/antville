//
// The Antville Project
// http://code.google.com/p/antville
//
// Copyright 2001-2007 by The Antville People
//
// Licensed under the Apache License, Version 2.0 (the ``License'');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an ``AS IS'' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// $Revision$
// $LastChangedBy$
// $LastChangedDate$
// $URL$
//

/**
 * main action
 */
Story.prototype.main_action = function() {
   res.data.title = this.site.title;
   var storytitle = this.getRenderedContentPart("title");
   if (storytitle)
      res.data.title += ": " + stripTags(storytitle);
   res.data.body = this.renderSkinAsString("main");
   this.site.renderSkin("page");
   // increment read-counter
   this.incrementReadCounter();
   logAccess();
   return;
};

/**
 * edit action
 */
Story.prototype.edit_action = function() {
   // restore any rescued text
   if (session.data.rescuedText)
      restoreRescuedText();
   
   if (req.data.set) {
      this.toggleOnline(req.data.set);
      if (req.data.http_referer)
         res.redirect(req.data.http_referer);
      res.redirect(this.site.stories.href());
   } else if (req.data.cancel) {
      res.redirect(this.online ? this.href() : this.site.stories.href());
   } else if (req.data.save || req.data.publish) {
      try {
         var result = this.evalStory(req.data, session.user);
         res.message = result.toString();
         res.redirect(result.url);
      } catch (err) {
         res.message = err.toString();
      }
   }
   
   res.data.action = this.href(req.action);
   res.data.title = getMessage("Story.editTitle");
   if (this.title)
      res.data.title += ": " + encode(this.title);
   res.data.body = this.renderSkinAsString("edit");
   this.site.renderSkin("page");
   return;
};

/**
 * delete action
 */
Story.prototype.delete_action = function() {
   if (req.data.cancel)
      res.redirect(this.site.stories.href());
   else if (req.data.remove) {
      try {
         res.message = this.site.stories.deleteStory(this);
         res.redirect(this.site.stories.href());
      } catch (err) {
         res.message = err.toString();
      }
   }
   
   res.data.action = this.href(req.action);
   res.data.title = getMessage("Story.deleteTitle");
   if (this.title)
      res.data.title += ": " + encode(this.title);

   if (this.title)
      var skinParam = {
         description: getMessage("Story.deleteDescription"),
         detail: this.title
      };
   else
      var skinParam = {description: getMessage("Story.deleteDescriptionNoTitle")};
   res.data.body = this.renderSkinAsString("delete", skinParam);
   this.site.renderSkin("page");
   return;
};

/**
 * comment action
 */
Story.prototype.comment_action = function() {
   // restore any rescued text
   if (session.data.rescuedText)
      restoreRescuedText();
   
   if (req.data.cancel)
      res.redirect(this.href());
   else if (req.data.save) {
      try {
         var result = this.evalComment(req.data, session.user);
         res.message = result.toString();
         res.redirect(this.href() + "#" + result.id);
      } catch (err) {
         res.message = err.toString();
      }
   }
   
   res.data.action = this.href(req.action);
   res.data.title = this.site.title;
   if (this.title)
      res.data.title += " - " + encode(this.title);
   res.data.body = this.renderSkinAsString("comment");
   this.site.renderSkin("page");
   // increment read-counter
   this.incrementReadCounter();
   return;
};
/*
 * macro for rendering a part of the story content
 */
Story.prototype.content_macro = function(param) {
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
         if (param.clipping == null)
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
         else {
            var stripped = part.stripTags();
            var clipped = stripped.clip(param.limit, param.clipping, param.delimiter);
            if (stripped == clipped)
               res.write(part);
            else
               res.write(clipped);
         }
         if (param.as == "link")
            Html.closeLink();
   }
   return;
};


/**
 * macro rendering online status of story
 */
Story.prototype.online_macro = function(param) {
   if (!this.online)
      res.write(param.no ? param.no : "offline");
   else
      res.write(param.yes ? param.yes : "online");
   return;
};


/**
 * macro rendering the location of the story
 */
Story.prototype.location_macro = function(param) {
   switch (this.online) {
      case 1:
         Html.link({href: this.site.topics.get(this.topic).href()}, "topic");
         break;
      case 2:
         res.write("site");
         break;
   }
   return;
};


/**
 * macro rendering createtime of story, either as editor,
 * plain text or as link to the frontpage of the day
 */
Story.prototype.createtime_macro = function(param) {
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
};

/**
 * macro rendering a link to edit
 * if user is allowed to edit
 */
Story.prototype.editlink_macro = function(param) {
   if (session.user) {
      try {
         this.checkEdit(session.user, req.data.memberlevel);
      } catch (deny) {
         return;
      }
      Html.openLink({href: this.href("edit")});
      if (param.image && this.site.images.get(param.image))
         renderImage(this.site.images.get(param.image), param);
      else
         res.write(param.text ? param.text : getMessage("generic.edit"));
      Html.closeLink();
   }
   return;
};

/**
 * macro rendering a link to delete
 * if user is creator of this story
 */
Story.prototype.deletelink_macro = function(param) {
   if (session.user) {
      try {
         this.checkDelete(session.user, req.data.memberlevel);
      } catch (deny) {
         return;
      }
      Html.openLink({href: this.href("delete")});
      if (param.image && this.site.images.get(param.image))
         renderImage(this.site.images.get(param.image), param);
      else
         res.write(param.text ? param.text : getMessage("generic.delete"));
      Html.closeLink();
   }
   return;
};

/**
 * macro renders a link to
 * toggle the online-status of this story
 */
Story.prototype.onlinelink_macro = function(param) {
   if (session.user) {
      try {
         this.checkEdit(session.user, req.data.memberlevel);
      } catch (deny) {
         return;
      }
      if (this.online && param.mode != "toggle")
         return;
      delete param.mode;
      param.linkto = "edit";
      param.urlparam = "set=" + (this.online ? "offline" : "online");
      Html.openTag("a", this.createLinkParam(param));
      if (param.image && this.site.images.get(param.image))
         renderImage(this.site.images.get(param.image), param);
      else {
         // currently, only the "set online" text is customizable, since this macro
         // is by default only used in that context outside the story manager.
         if (this.online)
            res.write(getMessage("Story.setOffline"));
         else
            res.write(param.text ? param.text : getMessage("Story.setOnline"));
      }
      Html.closeTag("a");
   }
   return;
};

/**
 * macro renders a link to the story
 */
Story.prototype.viewlink_macro = function(param) {
   if (session.user) {
      try {
         this.checkView(session.user, req.data.memberlevel);
      } catch (deny) {
         return;
      }
      Html.openLink({href: this.href()});
      if (param.image && this.site.images.get(param.image))
         renderImage(this.site.images.get(param.image), param);
      else
         res.write(param.text ? param.text : "view");
      Html.closeLink();
   }
   return;
};

/**
 * macro rendering link to comments
 */
Story.prototype.commentlink_macro = function(param) {
   if (this.discussions && this.site.preferences.getProperty("discussions"))
      Html.link({href: this.href(param.to ? param.to : "comment")},
                param.text ? param.text : "comment");
   return;
};


/**
 * macro renders number of comments
 * options: text to use when no comment
 *          text to use when one comment
 *          text to use when more than one comment
 *          action to link to (default: main)
 */
Story.prototype.commentcounter_macro = function(param) {
   if (!this.site.preferences.getProperty("discussions") || !this.discussions)
      return;
   var commentCnt = this.comments.count();
   if (!param.linkto)
      param.linkto = "main";
   var linkParam = this.createLinkParam(param);
   // delete the macro-specific attributes for valid markup output
   delete linkParam.as;
   delete linkParam.one;
   delete linkParam.more;
   delete linkParam.no;
   var linkflag = (param.as == "link" && param.as != "text" || 
                   !param.as && commentCnt > 0);
   if (linkflag)
      Html.openTag("a", linkParam);
   if (commentCnt == 0)
      res.write(param.no || param.no == "" ? 
                param.no : getMessage("Comment.no"));
   else if (commentCnt == 1)
      res.write(param.one ? param.one : getMessage("Comment.one"));
   else
      res.write(commentCnt + (param.more ? 
                param.more : " " + getMessage("Comment.more")));
   if (linkflag)
      Html.closeTag("a");
   return;
};

/**
 * macro loops over comments and renders them
 */
Story.prototype.comments_macro = function(param) {
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
};

/**
 * macro checks if user is logged in and not blocked
 * if true, render form to add a comment
 */
Story.prototype.commentform_macro = function(param) {
   if (!this.discussions)
      return;
   if (session.user) {
      res.data.action = this.href("comment");
      (new Comment()).renderSkin("edit");
   } else {
      Html.link({href: this.site.members.href("login")},
                param.text ? param.text : getMessage("Comment.loginToAdd"));
   }
   return;
};

/**
 * macro renders the property of story that defines if
 * other users may edit this story
 */
Story.prototype.editableby_macro = function(param) {
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
};

/**
 * macro renders a checkbox for enabling/disabling discussions
 * for backwards compatibility this macro also renders a hidden input
 * so that we can check if the checkbox is embedded in story/edit.skin
 */
Story.prototype.discussions_macro = function(param) {
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
};

/**
 * macro renders a list of existing topics as dropdown
 */
Story.prototype.topicchooser_macro = function(param) {
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
};

/**
 * macro renders the name of the topic this story belongs to
 * either as link, image (if an image entiteld by the
 * topic name is available) or plain text
 */
Story.prototype.topic_macro = function(param) {
   if (!this.topic || !this.online)
      return;
   if (!param.as || param.as == "text")
      res.write(this.topic);
   else if (param.as == "link") {
      Html.link({href: path.Site.topics.href(this.topic)},
                param.text ? param.text : this.topic);
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
};

/**
 * macro returns a list of references linking to a story
 * since referrers are asynchronously written to database by scheduler
 * it makes sense to cache them in story.cache.rBacklinks because they
 * won't change until the next referrer-update was done
 * @return String rendered backlinks
 */
Story.prototype.backlinks_macro = function(param) {
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
      skinParam.text = skinParam.referrer.clip(50);
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
};

/**
 * macro renders a checkbox whether the story is
 * published on the site's front page
 */
Story.prototype.addtofront_macro = function(param) {
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
};
/**
 * constructor function for story objects
 */
Story.prototype.constructor = function(creator, ipaddress) {
   this.reads = 0;
   this.ipaddress = ipaddress;
   this.creator = creator;
   this.editableby = EDITABLEBY_ADMINS;
   this.createtime = new Date();
   this.modifytime = new Date();
   return this;
};


/**
 * check if story is ok; if true, save changed story
 * @param Obj Object containing the properties needed for creating a new Story
 * @param Obj User-Object modifying this story
 * @return Obj Object containing two properties:
 *             - error (boolean): true if error happened, false if everything went fine
 *             - message (String): containing a message to user
 */
Story.prototype.evalStory = function(param, modifier) {
   // collect content
   var content = extractContent(param, this.content.getAll());
   // if all story parts are null, return with error-message
   if (!content.exists)
      throw new Exception("textMissing");
   // check if the createtime is set in param
   if (param.createtime) {
      try {
         var ctime = param.createtime.toDate("yyyy-MM-dd HH:mm");
      } catch (err) {
         throw new Exception("timestampParse", param.createtime);
      }
   }
   // check name of topic (if specified)
   var topicName = null;
   if (param.topic) {
       // FIXME: this should be solved more elegantly
      if (String.URLPATTERN.test(param.topic))
         throw new Exception("topicNoSpecialChars");
      if (this.site.topics[param.topic] || this.site.topics[param.topic + "_action"])
         throw new Exception("topicReservedWord");
      topicName = param.topic;
   } else if (param.addToTopic)
      topicName = param.addToTopic;

   // store the new values of the story
   if (param.publish) {
      var newStatus = param.addToFront ? 2 : 1;
      if (!this.online || content.isMajorUpdate)
         this.site.lastupdate = new Date();
      this.online = newStatus;
   } else
      this.online = 0;
   if (content.isMajorUpdate)
      this.modifytime = new Date();
   this.content.setAll(content.value);
   this.topic = topicName;
   // let's keep the title property
   this.title = content.value.title;
   // re-create day of story with respect to site-timezone
   if (ctime && ctime != this.createtime) {
      this.createtime = ctime;
      this.day = ctime.format("yyyyMMdd", this.site.getLocale(), this.site.getTimeZone());
   }
   if (modifier == this.creator)
      this.editableby = !isNaN(param.editableby) ?
                        parseInt(param.editableby, 10) : EDITABLEBY_ADMINS;
   this.discussions = param.discussions ? 1 : 0;
   this.modifier = modifier;
   this.ipaddress = param.http_remotehost;

   // send e-mail notification
   if (this.site.isNotificationEnabled() && newStatus != 0) {
      // status changes from offline to online
      // (this is bad because somebody could send a bunch
      // of e-mails simply by toggling the online status.)
      //if (this.online == 0)
      //   this.sendNotification("story", "create");
      // major update of an already online story
      if (this.online != 0 && content.isMajorUpdate)
         this.site.sendNotification("update", this);
   }
   var result = new Message("storyUpdate");
   result.url = this.online > 0 ? this.href() : this.site.stories.href();
   result.id = this._id;
   // add the modified story to search index
   app.data.indexManager.getQueue(this.site).add(this);
   return result;
};


/**
 * function sets story either online or offline
 */
Story.prototype.toggleOnline = function(newStatus) {
   if (newStatus == "online") {
      this.online = 2;
      this.site.lastupdate = new Date();
   } else if (newStatus == "offline")
      this.online = 0;

   // add the modified story to search index
   app.data.indexManager.getQueue(this.site).add(this);
   return true;
};

/**
 * function evaluates comment and adds it if ok
 * @param Obj Object containing properties needed for creation of comment
 * @param Obj Story-Object
 * @param Obj User-Object (creator of comment)
 * @return Obj Object containing two properties:
 *             - error (boolean): true if error happened, false if everything went fine
 *             - message (String): containing a message to user
 */

Story.prototype.evalComment = function(param, creator) {
   // collect content
   var content = extractContent(param);
   if (!content.exists)
      throw new Exception("textMissing");
   var c = new Comment(this.site, creator, param.http_remotehost);
   c.content.setAll(content.value);
   // let's keep the title property:
   c.title = content.value.title;
   this.add(c);
   // also add to story.comments since it has
   // cachemode set to aggressive and wouldn't refetch
   // its child collection index otherwise
   if (this.story)
      this.story.comments.add(c);
   else
      this.comments.add(c);
   this.site.lastupdate = new Date();
   // send e-mail notification
   if (this.site.isNotificationEnabled())
      this.site.sendNotification("create", c);
   var result = new Message("commentCreate");
   result.id = c._id;
   // add the new comment to search index
   app.data.indexManager.getQueue(this.site).add(c);
   return result;
};

/**
 * function deletes a whole thread
 * @param Obj Comment-Object that should be deleted
 * @return String Message indicating success/failure
 */

Story.prototype.deleteComment = function(commentObj) {
   for (var i=commentObj.size();i>0;i--)
      this.deleteComment(commentObj.get(i-1));
   // also remove from comment's parent since it has
   // cachemode set to aggressive and wouldn't refetch
   // its child collection index otherwise
   (commentObj.parent ? commentObj.parent : this).removeChild(commentObj);
   this.comments.removeChild(commentObj);
   commentObj.remove();

   // remove the modified comment from search index
   app.data.indexManager.getQueue(this.site).remove(commentObj._id);
   return new Message("commentDelete");
};

/**
 * function checks if the text of the story was already cached
 * and if it's still valid
 * if false, it caches it again
 * @return String cached text of story
 */
Story.prototype.getRenderedContentPart = function(name, fmt) {
   var part = this.content.getProperty(name);
   if (!part)
      return "";
   var key = fmt ? name + ":" + fmt : name;
   var lastRendered = this.cache["lastRendered_" + key];
   if (!lastRendered ||
       lastRendered.getTime() < this.content.getLastModified().getTime()) {
      switch (fmt) {
         case "plaintext":
            part = stripTags(part).clipURLs(30);
            break;
         case "alttext":
            part = stripTags(part);
            part = part.replace(/\"/g, "&quot;");
            part = part.replace(/\'/g, "&#39;");
            break;
         default:
            var s = createSkin(format(part));
            this.allowTextMacros(s);
            // enable caching; some macros (eg. poll, storylist)
            // will set this to false to prevent caching of a contentpart
            // containing them
            req.data.cachePart = true;
            // The following is necessary so that global macros know where they belong to.
            // Even if they are embeded at some other site.
            var tmpSite;
            if (this.site != res.handlers.site) {
               tmpSite = res.handlers.site;
               res.handlers.site = this.site;
            }
            part = this.renderSkinAsString(s).activateURLs(50);
            if (tmpSite)
               res.handlers.site = tmpSite;
      }
      this.cache[key] = part;
      if (req.data.cachePart)
         this.cache["lastRendered_" + key] = new Date();
   }   
   return this.cache[key];
};

/**
 * function deletes all childobjects of a story (recursive!)
 */
Story.prototype.deleteAll = function() {
   var queue = app.data.indexManager.getQueue(this.site);
   var item;
   for (var i=this.comments.size();i>0;i--) {
      item = this.comments.get(i-1);
      // remove comment from search index
      queue.remove(item._id);
      item.remove();
   }
   return true;
};

/**
 * function records the access to a story-object
 * by incrementing the counter of the Object representing
 * this story in app.data.readLog which will be stored
 * in database by scheduler
 */
Story.prototype.incrementReadCounter = function() {
   // do not record requests by the story creator
   if (session.user == this.creator)
      return;
   // check if app.data.readLog already contains
   // an Object representing this story
   if (!app.data.readLog.containsKey(String(this._id))) {
      var logObj = new Object();
      logObj.site = this.site.alias;
      logObj.story = this._id;
      logObj.reads = this.reads + 1;
      app.data.readLog.put(String(this._id), logObj);
   } else
      app.data.readLog.get(String(this._id)).reads++;
   return;
};

/**
 * Return either the title of the story or
 * the id prefixed with standard display name
 * to be used in the global linkedpath macro
 * @see hopobject.getNavigationName()
 */
Story.prototype.getNavigationName  = function() {
   if (this.title)
      return this.title;
   return getDisplay("story") + " " + this._id;
};


/**
 * creates a Lucene Document object for a story
 * @return Object instance of Search.Document representing the story
 */
Story.prototype.getIndexDocument = function() {
   var doc = new Search.Document();
   switch (this._prototype) {
      case "Comment":
         doc.addField("story", this.story._id, {store: true, index: true, tokenize: false});
         if (this.parent)
            doc.addField("parent", this.parent._id, {store: true, index: true, tokenize: false});
         break;
      default:
         doc.addField("day", this.day, {store: true, index: true, tokenize: false});
         if (this.topic)
            doc.addField("topic", this.topic, {store: true, index: true, tokenize: true});
         break;
   }

   doc.addField("online", this.online, {store: true, index: true, tokenize: false});
   doc.addField("site", this.site._id, {store: true, index: true, tokenize: false});
   doc.addField("id", this._id, {store: true, index: true, tokenize: false});
   var content = this.content.getAll();
   var title;
   if (title = stripTags(content.title).trim())
      doc.addField("title", title, {store: false, index: true, tokenize: true});
   var text = new java.lang.StringBuffer();
   for (var propName in content) {
      if (propName != "title") {
         text.append(stripTags(content[propName]).trim());
         text.append(" ");
      }
   }
   doc.addField("text", text.toString(), {store: false, index: true, tokenize: true});
   if (this.creator) {
      // FIXME: checking this shouldn't be necessary, but somehow it is ...
      doc.addField("creator", this.creator.name, {store: false, index: true, tokenize: false});
      doc.addField("createtime", this.createtime.format("yyyyMMdd"), {store: false, index: true, tokenize: false});
   }
   return doc;
};
/**
 * permission check (called by hopobject.onRequest())
 * @param String name of action
 * @param Obj User object
 * @param Int Membership level
 * @return Obj Exception object or null
 */
Story.prototype.checkAccess = function(action, usr, level) {
   var url = this.site.href();
   try {
      switch (action) {
         case "main" :
            this.checkView(usr, level);
            break;
         case "edit" :
            if (!usr && req.data.save)
               rescueText(req.data);
            checkIfLoggedIn(this.href(req.action));
            this.checkEdit(usr, level);
            break;
         case "delete" :
            checkIfLoggedIn();
            this.checkDelete(usr, level);
            break;
         case "comment" :
            if (!usr && req.data.save)
               rescueText(req.data);
            checkIfLoggedIn(this.href(req.action));
            url = this.href();
            this.checkPost(usr, level);
            break;
      }
   } catch (deny) {
      res.message = deny.toString();
      res.redirect(url);
   }
   return;
};


/**
 * check if user is allowed to post a comment to this story   
 * @param Obj Userobject   
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)   
 */   
Story.prototype.checkPost = function(usr, level) {
   if (!usr.sysadmin && !this.site.online && level == null)
      throw new DenyException("siteView");
   else if (!this.site.preferences.getProperty("discussions"))
      throw new DenyException("siteNoDiscussion");
   else if (!this.discussions)
      throw new DenyException("storyNoDiscussion");
   return;
};
    
 /** 
 * check if user is allowed to delete a story
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */
Story.prototype.checkDelete = function(usr, level) {
   if (this.creator != usr && (level & MAY_DELETE_ANYSTORY) == 0)
      throw new DenyException("storyDelete");
   return;
};

/**
 * check if user is allowed to edit a story
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */
Story.prototype.checkEdit = function(usr, level) {
   if (this.creator != usr) {
      if (level == null)
         throw new DenyException("storyEdit");
      else if (this.editableby == EDITABLEBY_ADMINS && (level & MAY_EDIT_ANYSTORY) == 0)
         throw new DenyException("storyEdit");
      else if (this.editableby == EDITABLEBY_CONTRIBUTORS && (level & MAY_ADD_STORY) == 0)
         throw new DenyException("storyEdit");
   }
   return;
};


/**
 * check if user is allowed to view story
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */
Story.prototype.checkView = function(usr, level) {
   this.site.checkView(usr, level);
   if (!this.online && this.creator != usr) {
      if (this.editableby == EDITABLEBY_ADMINS && (level & MAY_EDIT_ANYSTORY) == 0)
         throw new DenyException("storyView");
      else if (this.editableby == EDITABLEBY_CONTRIBUTORS && (level & MAY_ADD_STORY) == 0)
         throw new DenyException("storyView");
   }
   return;
};

/**
 * function explicitly allowes some macros for use in the text of a story
 * @param Obj Skin-object to allow macros for
 */
Story.prototype.allowTextMacros = function(s) {
   s.allowMacro("image");
   s.allowMacro("this.image");
   s.allowMacro("site.image");
   s.allowMacro("story.image");
   s.allowMacro("thumbnail");
   s.allowMacro("this.thumbnail");
   s.allowMacro("site.thumbnail");
   s.allowMacro("story.thumbnail");
   s.allowMacro("link");
   s.allowMacro("this.link");
   s.allowMacro("site.link");
   s.allowMacro("story.link");
   s.allowMacro("file");
   s.allowMacro("poll");
   s.allowMacro("logo");
   s.allowMacro("storylist");
   s.allowMacro("fakemail");
   s.allowMacro("this.topic");
   s.allowMacro("story.topic");
   s.allowMacro("imageoftheday");
   s.allowMacro("spacer");

   // allow module text macros
   for (var i in app.modules) {
      if (app.modules[i].allowTextMacros)
         app.modules[i].allowTextMacros(s);
   }
   return;
};
