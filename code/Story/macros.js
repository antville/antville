/*
 *  macro for rendering a part of the content.
 */
function content_macro(param) {
   // check if this is a story with the old property layout. If so, convert to new.
   if (this.text && !this.content) {
      this.convertContentToXML();
   }
   if (param.as == "editor") {
      param.name = "content_" + param.part;
      param.value = this.getContentPart(param.part);
      delete(param.part);
      if (!param.height || parseInt(param.height) == 1)
         renderInputText(param);
      else
         renderInputTextarea(param);
   } else if (!this.content) {
      return;
   } else {
      var part = this.getRenderedContentPart (param.part);
      if (!part && param.fallback)
         part = this.getRenderedContentPart (param.fallback);
      if (param.part == "title" && param.as == "link" && !part) {
         part = this.getRenderedContentPart ("text");
         param.limit = "20";
      }
      if (param.as == "link")
         openLink(this.href("main"));
      if (!param.limit)
         res.write(part);
      else
         renderTextPreview(part, param.limit);
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
      if (!this.isOnline())
         res.write("offline");
      else if (parseInt(this.online,10) < 2) {
         res.write("online in ");
         openLink(this.site.topics.get(this.topic).href());
         res.write(this.topic);
         closeLink();
      } else
         res.write("online in weblog");
   }
}

/**
 * macro rendering createtime of story
 */

function createtime_macro(param) {
   if (param.as == "editor") {
      if (this.createtime)
         param.value = formatTimestamp(this.createtime, "yyyy-MM-dd HH:mm");
      else
         param.value = formatTimestamp(new Date(), "yyyy-MM-dd HH:mm");
      param.name = "createtime";
      renderInputText(param);
   } else {
      if (!this.createtime)
         return;
      res.write(formatTimestamp(this.createtime,param.format));
   }
}

/**
 * macro rendering modifytime of story
 */

function modifytime_macro(param) {
   if (this.modifytime) {
      res.write(formatTimestamp(this.modifytime,param.format));
   }
}

/**
 * macro renders the name of the author
 * !!! left for backwards-compatibility !!!
 */

function author_macro(param) {
   this.creator_macro(param);
}

/**
 * macro renders the name of the creator
 */

function creator_macro(param) {
   if (!this.creator)
      return;
   if (param.as == "link" && this.creator.url) {
      openLink(this.creator.url);
      res.write(this.creator.name);
      closeLink();
   } else
      res.write(this.creator.name);
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
 * macro renders the url of this story
 */

function url_macro(param) {
   res.write(this.href());
}

/**
 * macro rendering a link to edit
 * if user is allowed to edit
 */

function editlink_macro(param) {
   if (!this.isEditDenied(session.user)) {
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
   if (!this.isDeleteDenied(session.user)) {
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
   if (!this.isEditDenied(session.user)) {
      param.linkto = "edit";
      param.urlparam = "set=" + (this.isOnline() ? "offline" : "online");
      openMarkupElement("a",this.createLinkParam(param));
      if (param.image && this.site.images.get(param.image))
         this.site.renderImage(this.site.images.get(param.image),param);
      else
         res.write(this.isOnline() ? "set offline" : "set online");
      closeMarkupElement("a");
   }
}

/**
 * macro renders a link to the story
 */

function viewlink_macro(param) {
   if (this.isViewDenied(session.user))
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
 * DEPRECATED
 * this is just left for compatibility with existing sites
 * use a simple like i.e. <% story.link to="comment" text="place your comment" %> instead
 */

function commentlink_macro(param) {
   this.renderSkin(param.useskin ? param.useskin : "commentlink");
}


/**
 * macro renders number of comments
 * options: text to use when no comment
 *          text to use when one comment
 *          text to use when more than one comment
 *          action to link to (default: main)
 */

function commentcounter_macro(param) {
   if (this.site.hasDiscussions()) {
      var commentCnt = this.comments.count();
      if (!param.linkto)
         param.linkto = "main";
      if (commentCnt == 0) {
         res.write(commentCnt + (param.no ? param.no : " comments"));
      }
      else {
         openMarkupElement("a", this.createLinkParam(param));
         if (commentCnt == 1)
            res.write(commentCnt + (param.one ? param.one : " comment"));
         else
            res.write(commentCnt + (param.more ? param.more : " comments"));
         closeMarkupElement("a");
      }
   }
}

/**
 * macro loops over comments and renders them
 */

function comments_macro(param) {
   if (this.site.hasDiscussions() && this.count()) {
      for (var i=0;i<this.size();i++) {
         var c = this.get(i);
         var linkParam = new Object();
         linkParam.name = c._id;
         renderMarkupElement("a", linkParam);
         if (c.parent)
            c.renderSkin("reply");
         else
            c.renderSkin("toplevel");
      }
   }
}

/**
 * macro checks if user is logged in and not blocked
 * if true, render form to add a comment
 */

function commentform_macro(param) {
   if (session.user) {
      var c = new comment();
      c.renderSkin("edit");
   } else {
      openLink(this.site.members.href("login"));
      res.write (param.text ? param.text : "login to add your comment!");
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
      var options = new Array("Subscribers and Contributors","Contributors only");
      renderDropDownBox("editableby",options,this.editableby,"----");
   } else {
      if (this.editableby == 0)
         res.write("Subscribers of and Contributors to " + this.site.title);
      else if (this.editableby == 1)
         res.write("Contributors to " + this.site.title);
      else
         res.write("Content Managers and Admins of " + this.site.title);
   }
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
         if (this.topic == topic.groupname)
            var selectedIndex = i;
      }
   }
   renderDropDownBox("topicidx", options, selectedIndex, "-- choose topic --");
}

/**
 * macro renders the name of the topic this story belongs to
 * as link
 */

function topic_macro(param) {
   if (!this.topic)
      return;
   openLink(this.site.topics.get(this.topic).href());
   res.write(this.topic);
   closeLink();
}


/**
 * macro returns a list of references linking to a story
 */

function backlinks_macro() {
	// this is a clone of site.listReferrers_macro.
	var str = "";
	var c = getDBConnection("antville");
	var dbError = c.getLastError();
	if (dbError)
      return (getMsg("error","database",dbError));

	// we're doing this with direct db access here
	// (there's no need to do it with prototypes):
	var query = "select *, count(*) as \"COUNT\" from AV_ACCESSLOG where ACCESSLOG_F_TEXT = " + this._id + " group by ACCESSLOG_REFERRER order by \"COUNT\" desc, ACCESSLOG_REFERRER asc;";                                
	var rows = c.executeRetrieval(query);
	var dbError = c.getLastError();
	if (dbError)
      return (getMsg("error","database",dbError));
	
	var param = new Object();
	while (rows.next()) {
		param.count = rows.getColumnItem("COUNT");
    // these two lines are necessary only for hsqldb connections:
    if (param.count == 0)
      continue;
		param.referrer = rows.getColumnItem("ACCESSLOG_REFERRER");
		param.text = param.referrer.length > 50 ? param.referrer.substring(0, 50) + "..." : param.referrer;
		str += this.renderSkinAsString("backlinkItem", param);
	}
   rows.release();
	param = new Object();
	param.referrers = str;
	if (str)
		str = this.renderSkinAsString("backlinks", param);
	return(str);
}