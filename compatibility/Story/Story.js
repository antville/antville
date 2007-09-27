Story.prototype.location_macro = function(param) {
   switch (this.online) {
      case 1:
      if (this.tags.size() > 0) {
         Html.link({href: this.tags.get(0).tag.href()}, "topic");
      }
      break;
      case 2:
      res.write("site");
      break;
   }
   return;
};

Story.prototype.topic_macro = function(param) {
   if (this.constructor !== Image && (!this.online || this.tags.size() < 1))
      return;
   var topic = this.tags.get(0).tag;
   if (!param.as || param.as == "text")
      res.write(topic.name);
   else if (param.as == "link") {
      Html.link({href: topic.href()}, param.text ? param.text : topic.name);
   } else if (param.as == "image") {
      if (!param.imgprefix) {
         param.imgprefix = "topic_";
      }
      var img = getPoolObj(param.imgprefix + topic.name, "images");
      if (img) {
         Html.openLink({href: topic.href()});
         renderImage(img.obj, param)
         Html.closeLink();
      }
   }
   return;
};

Story.prototype.topicchooser_macro = function(param) {
   var site = this.site || res.handlers.site;
   var currentTopic = this.tags.size() > 0 ? this.tags.get(0).tag : null;
   var topics = (this.constructor === Story ? site.stories.tags : 
         site.images.galleries);
   var options = [], topic;
   for (var i=0; i<topics.size(); i++) {
      topic = topics.get(i);
      options[i] = {value: topic.name, display: topic.name};
      if (req.data.addToTopic) {
         var selected = req.data.addToTopic;
      } else if (currentTopic === topic) {
         var selected = topic.name;
      }
   }
   Html.dropDown({name: "addToTopic"}, options, selected, param.firstOption);
   return;
};

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
      html.checkBox(param);
   }
   return;
};

Story.prototype.discussions_macro = function(param) {
   if (!path.Site.metadata.get("discussions"))
      return;
   if (param.as == "editor") {
      var inputParam = this.createCheckBoxParam("discussions", param);
      if ((req.data.publish || req.data.save) && !req.data.discussions)
         delete inputParam.checked;
      html.checkBox(inputParam);
   } else
      res.write(this.discussions ? getMessage("generic.yes") : getMessage("generic.no"));
   return;
};

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
         html.radioButton({name: "editableby", value: options[i], selectedValue: selValue});
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

Story.prototype.editlink_macro = function(param) {
   if (session.user) {
      try {
         this.checkEdit(session.user, res.data.memberlevel);
      } catch (deny) {
         return;
      }
      html.openLink({href: this.href("edit")});
      if (param.image && this.site.images.get(param.image))
         renderImage(this.site.images.get(param.image), param);
      else
         res.write(param.text ? param.text : getMessage("generic.edit"));
      html.closeLink();
   }
   return;
};

Story.prototype.deletelink_macro = function(param) {
   if (session.user) {
      try {
         this.checkDelete(session.user, res.data.memberlevel);
      } catch (deny) {
         return;
      }
      html.openLink({href: this.href("delete")});
      if (param.image && this.site.images.get(param.image))
         renderImage(this.site.images.get(param.image), param);
      else
         res.write(param.text ? param.text : getMessage("generic.delete"));
      html.closeLink();
   }
   return;
};

Story.prototype.onlinelink_macro = function(param) {
   if (session.user) {
      try {
         this.checkEdit(session.user, res.data.memberlevel);
      } catch (deny) {
         return;
      }
      if (this.online && param.mode != "toggle")
         return;
      delete param.mode;
      param.linkto = "edit";
      param.urlparam = "set=" + (this.online ? "offline" : "online");
      html.openTag("a", this.createLinkParam(param));
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
      html.closeTag("a");
   }
   return;
};

Story.prototype.viewlink_macro = function(param) {
   if (session.user) {
      try {
         this.checkView(session.user, res.data.memberlevel);
      } catch (deny) {
         return;
      }
      html.openLink({href: this.href()});
      if (param.image && this.site.images.get(param.image))
         renderImage(this.site.images.get(param.image), param);
      else
         res.write(param.text ? param.text : "view");
      html.closeLink();
   }
   return;
};

Story.prototype.commentlink_macro = function(param) {
   if (this.discussions && this.site.metadata.get("discussions"))
      html.link({href: this.href(param.to ? param.to : "comment")},
                param.text ? param.text : "comment");
   return;
};

Story.prototype.online_macro = function(param) {
   if (!this.online)
      res.write(param.no ? param.no : "offline");
   else
      res.write(param.yes ? param.yes : "online");
   return;
};

Story.prototype.createtime_macro = function(param) {
   if (param.as == "editor") {
      if (this.createtime)
         param.value = formatTimestamp(this.createtime, "yyyy-MM-dd HH:mm");
      else
         param.value = formatTimestamp(new Date(), "yyyy-MM-dd HH:mm");
      param.name = "createtime";
      html.input(param);
   } else if (this.createtime) {
      var text = formatTimestamp(this.createtime, param.format);
      if (param.as == "link" && this.online == 2)
         html.link({href: path.Site.get(String(this.day)).href()}, text);
      else
         res.write(text);
   }
   return;
};
