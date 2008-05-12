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

relocateProperty(Story, "createtime", "created");
relocateProperty(Story, "modifytime", "modified");

Story.prototype.allowTextMacros = function(skin) {
   return Story.prototype.macro_filter(skin);
}

Story.prototype.commentform_macro = function(param) {
   if (this.commentMode === "closed") {
      return;
   }
   if (session.user) {
      res.data.action = this.href("comment");
      res.handlers.parent = this;
      (new Comment(this)).renderSkin("Comment#edit");
   } else {
      html.link({href: this.site.members.href("login")},
            param.text || gettext("Please login to add a comment"));
   }
   return;
}

Story.prototype.content_macro = function(param) {
   switch (param.as) {
      case "editor":
      if (param.cols || param.rows) {
         this.metadata.textarea_macro(param, param.part);
      } else {
         this.metadata.input_macro(param, param.part);
      }
      break;
      
      case "image":
      var part = this.metadata.get(param.part);
      part && res.write(this.format_filter(part, param, "image"));
      break;
      
      default:
      var part = this.getRenderedContentPart(param.part, param.as);
      if (!part && param.fallback) {
         part = this.getRenderedContentPart(param.fallback, param.as);
      }
      if (part && param.limit) {
         part = part.stripTags().head(param.limit, 
               param.clipping, param.delimiter || String.SPACE);
      }
      if (param.as === "link") {
         res.write(this.link_filter(part || "...", param));
      } else {
         res.write(part);
      }
   }
   return;
}

// FIXME: To be removed when content handling works after update
/* Story.prototype.content_macro = function(param) {
   switch (param.as) {
      case "editor":
      var inputParam = this.metadata.createInputParam(param.part, param);
      delete inputParam.part;
      if (param.cols || param.rows) {
         html.textArea(inputParam);
      } else {
         html.input(inputParam);
      }
      break;

      case "image":
      var part = this.metadata.get(param.part);
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
            html.openLink({href: this.href()});
         else
            html.openLink({href: this.story.href() + "#" + this._id});
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
         html.closeLink();
   }
   return;
}; */

Story.prototype.getRenderedContentPart = function(name, mode) {
   var part = this.metadata.get(name);
   if (!part) {
      return "";
   }
   var key = mode ? (name + ":" + mode) : name;
   var lastRendered = this.cache["lastRendered_" + key];
   if (!lastRendered) {
       // FIXME: || lastRendered.getTime() < this.metadata.getLastModified().getTime())
      switch (mode) {
         case "plaintext":
         part = this.format_filter(part, {}, "plain");
         break;
         
         case "alttext":
         part = this.format_filter(part, {}, "quotes");
         break;
         
         default:
         // Enable caching; some macros (eg. poll, storylist) will set this 
         // to false to prevent caching of a contentpart containing them.
         res.meta.cachePart = true;
         part = this.format_filter(part, {});
      }
      this.cache[key] = part;
      if (res.meta.cachePart) {
         this.cache["lastRendered_" + key] = new Date();
      }
   }   
   return this.cache[key];
}

Story.prototype.location_macro = function(param) {
   switch (this.mode) {
      case Story.FEATURED:
      res.write(gettext("site")); break;
      
      default:
      if (this.tags.size() > 0) {
         html.link({href: this.tags.get(0).tag.href()}, gettext("topic"));
      }
   }
   return;
}

Story.prototype.topic_macro = function(param) {
   // This method is applied to images as well, thus we check what we got first:
   if (this.constructor !== Image && this.status !== Story.PUBLIC) {
      return;
   }
   if (this.tags.size() < 1) {
      return;
   }
   var tag = this.tags.get(0).tag;
   if (!param.as || param.as === "text") {
      res.write(tag.name);
   } else if (param.as === "link") {
      html.link({href: tag.href()}, param.text || tag.name);
   } else if (param.as === "image") {
      param.imgprefix || (param.imgprefix = "topic_");
      var img = HopObject.getFromPath(param.imgprefix + tag.name, "images");
      delete param.imgprefix;
      delete param.as;
      if (img) {
         res.push();
         img.render_macro(param);
         delete param.height;
         delete param.width;
         delete param.border;
         delete param.src;
         delete param.alt;
         link_filter(res.pop(), param, tag.href());
      }
   }
   return;
}

Story.prototype.topicchooser_macro = function(param) {
   var site = this.site || res.handlers.site;
   var currentTopic = this.tags.size() > 0 ? this.tags.get(0).tag : null;
   var topics = (this.constructor === Story ? site.stories.tags : 
         site.images.galleries);
   var options = [], topic;
   for (var i=0; i<topics.size(); i++) {
      topic = topics.get(i);
      options.push({value: topic.name, display: topic.name});
      if (req.data.addToTopic) {
         var selected = req.data.addToTopic;
      } else if (currentTopic === topic) {
         var selected = topic.name;
      }
   }
   html.dropDown({name: "addToTopic"}, options, selected, param.firstOption);
   return;
}

Story.prototype.addtofront_macro = function(param) {
   if (param.as === "editor") {
      // if we're in a submit, use the submitted form value.
      // otherwise, render the object's value.
      if (req.data.publish || req.data.save) {
         if (!req.data.addToFront) {
            delete param.checked;
         }
      } else if (req.action !== "create" && this.mode !== Story.FEATURED) {
         delete param.checked;
      }
      param.name = "addToFront";
      param.value = "1";
      delete param.as;
      html.checkBox(param);
   }
   return;
}

Story.prototype.discussions_macro = function(param) {
   if (res.handlers.site.commentMode === Site.DISABLED) {
      return;
   }
   if (param.as === "editor") {
      if (req.data.publish || req.data.save) {
         param.checked = req.data.discussions;
      } else if (req.action !== "create") {
         param.checked = this.commentMode === Story.OPEN ? "checked" : null;
      } else {
         param.checked || (param.checked = "checked");
      }
      delete param.as;
      param.name = "discussions";
      param.value = "1";
      html.checkBox(param);
   } else {
      res.write(this.commentMode === Story.OPEN ? 
            gettext("yes") : gettext("no"));
   }
   return;
}

Story.prototype.editableby_macro = function(param) {
   if (param.as == "editor" && (session.user == this.creator || !this.creator)) {
      var options = [Story.PUBLIC, Story.SHARED, Story.OPEN];
      var labels = [gettext("content managers"), gettext("contributors"), 
            gettext("subscribers")];
      delete param.as;
      if (req.data.publish || req.data.save) {
         var selValue = req.data.status || null;
      } else {
         var selValue = this.status;
      }
      for (var i=0; i<options.length; i+=1) {
         html.radioButton({name: "editableby", 
               value: options[i], selectedValue: selValue});
         res.write("&nbsp;");
         res.write(labels[i]);
         res.write("&nbsp;");
      }
   } else {
      switch (this.status) {
         case Story.PUBLIC:
         res.write(gettext("Content managers of {0}", path.site.title));
         break;
         case Story.SHARED:
         res.write(gettext("Contributors to {0}", path.site.title));
         break;
         case Story.OPEN:
         res.write(gettext("Subscribers of and contributors to {0}", 
               path.site.title));
         break;
      }
   }
   return;
}

Story.prototype.editlink_macro = function(param) {
   res.push();
   if (param.image && this.site.images.get(param.image)) {
      var image = this.site.images.get(param.image);
      delete param.image;
      image && image.render_macro(param);
   } else {
      res.write(param.text || gettext("Edit"));
   }   
   return this.link_macro(param, "edit", res.pop());
}

Story.prototype.deletelink_macro = function(param) {
   res.push();
   if (param.image && this.site.images.get(param.image)) {
      renderImage(this.site.images.get(param.image), param);
   } else {
      res.write(param.text || gettext("Delete"));
   }   
   return this.link_macro(param, "delete", res.pop());
}

Story.prototype.viewlink_macro = function(param) {
   res.push();
   if (param.image && this.site.images.get(param.image)) {
      renderImage(this.site.images.get(param.image), param);
   } else {
      res.write(param.text || gettext("View"));
   }   
   return this.link_macro(param, ".", res.pop());
}

Story.prototype.commentlink_macro = function(param) {
   if (this.commentMode === Story.OPEN && 
         this.site.commentMode === Site.ENABLED) {
      html.link({href: this.href(param.to || "comment")},
                param.text || "comment");
   }
   return;
}

Story.prototype.onlinelink_macro = function(param) {
   return this.link_macro(param, "rotate");
}

Story.prototype.online_macro = function(param) {
   if (this.satus === Story.CLOSED) {
      res.write(param.no || gettext("offline"));
   } else if (this.status === Story.PUBLIC || this.status === Story.HIDDEN) {
      res.write(param.yes || gettext("online"));
   } return;
}

Story.prototype.createtime_macro = function(param) {
   if (param.as === "editor") {
      if (this.created) {
         param.value = formatDate(this.createtime, "yyyy-MM-dd HH:mm");
      } else {
         param.value = formatDate(new Date(), "yyyy-MM-dd HH:mm");
      }
      param.name = "created";
      html.input(param);
   } else if (this.created) {
      var text = formatDate(this.created, param.format);
      if (param.as === "link" && this.status === Story.PUBLIC) {
         var group = this.site.archive.get(this.created.format("yyyyMMdd"));
         var path = formatDate(group._id.toDate("yyyyMMdd"), "yyyy/MM/dd");
         html.link({href: this.site.archive.href() + path}, text);
      } else {
         res.write(text);
      }
   }
   return;
}

Story.prototype.commentcounter_macro = function(param) {
   if (this.site.commentMode === Site.DISABLED || 
         this.commentMode === Story.CLOSED ||
         this.commentMode === Story.READONLY) {
      return;
   }
   var commentCnt = this.comments.count();
   param.linkto || (param.linkto = "main");
   var linkflag = (param.as === "link" && param.as !== "text" || 
                   !param.as && commentCnt > 0);
   if (linkflag) {
      html.openTag("a", {href: this.href() + "#comments"});
   }
   if (commentCnt < 1) {
      res.write(param.no || gettext("no comments"));
   } else if (commentCnt < 2) {
      res.write(param.one || gettext("one comment"));
   } else {
      res.write(commentCnt + (param.more || " " + gettext("comments")));
   }
   if (linkflag) {
      html.closeTag("a");
   }
   return;
}

Story.prototype.reads_macro = function(param) {
   res.write(this.requests);
   return;
}
