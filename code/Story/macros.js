/**
 * macro rendering title of story
 */

function title_macro(param) {
   if (!this.title && !param.as)
      return;
   if (param.as == "editor")
      renderInputText(this.createInputParam("title",param));
   else if (param.as == "link") {
      openLink(this.href("main"));
      if (this.title)
         res.write(this.title);
      else {
         // no title, so we show the first words of the story-text as link
         renderTextPreview(this.getText(),20);
      }
      closeLink();
   } else
      res.write(this.title);
}

/**
 * macro rendering text of story
 */

function text_macro(param) {
   if (param.as == "editor")
      renderInputTextarea(this.createInputParam("text",param));
   else {
      if (!param.limit)
         res.write(this.getText());
      else
         renderTextPreview(this.getText(),param.limit);
   }
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
         openLink(this.weblog.topics.get(this.topic).href());
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
 */

function author_macro(param) {
   if (!this.author)
      return;
   if (param.as == "link" && this.author.url) {
      openLink(this.author.url);
      res.write(this.author.name);
      closeLink();
   } else
      res.write(this.author.name);
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
      if (param.image && this.weblog.images.get(param.image))
         this.weblog.renderImage(this.weblog.images.get(param.image),param);
      else
         res.write(param.text ? param.text : "edit");
      closeLink();
   }
}

/**
 * macro rendering a link to delete
 * if user is author of this story
 */

function deletelink_macro(param) {
   if (!this.isDeleteDenied(session.user)) {
      openLink(this.href("delete"));
      if (param.image && this.weblog.images.get(param.image))
         this.weblog.renderImage(this.weblog.images.get(param.image),param);
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
      linkParam.urlparam = "set=" + (this.isOnline() ? "offline" : "online");
      openMarkupElement("a",this.createLinkParam(param));
      if (param.image && this.weblog.images.get(param.image))
         this.weblog.renderImage(this.weblog.images.get(param.image),param);
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
   if (param.image && this.weblog.images.get(param.image))
      this.weblog.renderImage(this.weblog.images.get(param.image),param);
   else
      res.write(param.text ? param.text : "view");
   closeLink();
}

/**
 * macro rendering link to comments
 * DEPRECATED
 * this is just left for compatibility with existing weblogs
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
   if (this.weblog.hasDiscussions()) {
      var commentCnt = this.comments.count();
      if (!param.linkto)
         param.linkto = "main";
      param.anchor = param.anchor;
      if (commentCnt == 0) {
         res.write(commentCnt + (param.no ? param.no : " comments"));
      } else {
         openMarkupElement("a",this.createLinkParam(param));
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
   if (this.weblog.hasDiscussions() && this.count()) {
      for (var i=0;i<this.size();i++) {
         var c = this.get(i);
         res.write("<a name=\"" + c._id + "\"></a>");
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
      openLink(this.weblog.members.href("login"));
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
 * calls global image_macro()
 */

function thumbnail_macro(param) {
   thumbnail_macro(param);
}


/**
 * macro renders the property of story that defines if
 * other users may edit this story
 */

function editableby_macro(param) {
   if (param.as == "editor" && (session.user == this.author || !this.author)) {
      var options = new Array("Subscribers and Contributors","Contributors only");
      renderDropDownBox("editableby",options,this.editableby,"----");
   } else {
      if (this.editableby == 0)
         res.write("Subscribers of and Contributors to " + this.weblog.title);
      else if (this.editableby == 1)
         res.write("Contributors to " + this.weblog.title);
      else
         res.write("Content Managers and Admins of " + this.weblog.title);
   }
}

/**
 * macro renders a list of existing topics as dropdown
 */

function topicchooser_macro(param) {
   var size = path.weblog.topics.size();
   var options = new Array();
   for (var i=0;i<size;i++) {
      var topic = path.weblog.topics.get(i);
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
   openLink(this.weblog.topics.get(this.topic).href());
   res.write(this.topic);
   closeLink();
}


/**
 * macro returns a list of references linking to a story
 */

function backlinks_macro() {
	// this is a clone of weblog.listReferrers_macro.
	var str = "";
	var c = getDBConnection("antville");
	error = c.getLastError();
	if (error)
		return("Error establishing DB connection: " + error);

	// we're doing this with direct db access here
	// (there's no need to do it with prototypes):
	var query = "select *, count(*) as \"COUNT\" from ACCESS where STORY_ID = " + this._id + " group by REFERRER order by \"COUNT\" desc, REFERRER asc;";                                
	var rows = c.executeRetrieval(query);
	error = c.getLastError();
	if (error)
		return("Error executing SQL query: " + error);
	
	var param = new Object();
	while (rows.next()) {
		param.count = rows.getColumnItem("COUNT");
    // these two lines are necessary only for hsqldb connections:
    if (param.count == 0)
      continue;
		param.referrer = rows.getColumnItem("REFERRER");
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
