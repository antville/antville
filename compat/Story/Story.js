// The Antville Project
// http://code.google.com/p/antville
//
// Copyright 2001–2014 by the Workers of Antville.
//
// Licensed under the Apache License, Version 2.0 (the ``License'');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an ``AS IS'' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

relocateProperty(Story, "createtime", "created");
relocateProperty(Story, "modifytime", "modified");

Story.ALLOWED_MACROS = Story.ALLOWED_MACROS.concat([
  "fakemail",
  "imageoftheday",
  "logo",
  "spacer",
  "storylist",
  "thumbnail",

  "site.image",
  "site.link",
  "site.thumbnail",

  "story.image",
  "story.thumbnail",
  "story.topic",

  "this.image",
  "this.link",
  "this.thumbnail",
  "this.topic"
]);

Story.prototype.rotate_action = function() {
  if (this.status === Story.CLOSED) {
    this.status = this.cache.status || Story.PUBLIC;
  } else if (this.mode === Story.FEATURED) {
    this.mode = Story.HIDDEN;
  } else {
    this.cache.status = this.status;
    this.mode = Story.FEATURED;
    this.status = Story.CLOSED;
  }
  return res.redirect(req.data.http_referer || this._parent.href());
}

/**
 *
 * @param {Object} param
 * @param {String} action
 * @param {String} text
 */
Story.prototype.link_macro = function(param, action, text) {
  switch (action) {
    case 'rotate':
    if (this.status === Story.CLOSED) {
      text = param.publish || gettext('Publish');
    } else if (this.mode === Story.FEATURED) {
      text = param.hide || gettext('Hide');
    } else {
      text = param.close || gettext('Close');
    }
    delete param.publish;
    delete param.hide;
    delete param.close;
  }
  return HopObject.prototype.link_macro.call(this, param, action, text);
}

Story.prototype.backlinks_macro = Story.prototype.referrers_macro;

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
    HopObject.confirmConstructor(Comment);
    var comment = new Comment;
    comment.story = this;
    comment.renderSkin("Comment#edit");
  } else {
    html.link({href: this.site.members.href("login")},
        param.text || "Please login to add a comment");
  }
  return;
}

Story.prototype.content_macro = function(param) {
  // Clone param and remove non-HTML attributes from param:
  var options = Object.clone.call(param, {});
  var noAttr = 'as clipping delimiter fallback limit part';
  for each (let key in noAttr.split(String.SPACE)) {
    delete param[key];
  }

  switch (options.as) {
    case "editor":
    if (param.cols || param.rows) {
      this.textarea_macro(param, options.part);
    } else {
      this.input_macro(param, options.part);
    }
    break;

    case "image":
    var part = this.getMetadata(options.part);
    part && res.write(this.format_filter(part, param, "image"));
    break;

    default:
    var part = this.getRenderedContentPart(options.part, options.as);
    if (!part && options.fallback) {
      part = this.getRenderedContentPart(options.fallback, options.as);
    }
    if (options.limit) {
      part = part.stripTags().head(options.limit,
          options.clipping, options.delimiter || String.SPACE);
    }
    if (options.as === "link") {
      res.write(this.link_filter(part || "...", param));
    } else {
      res.write(part);
    }
  }
  return;
}

Story.prototype.getRenderedContentPart = function(name, mode) {
  var part = this.getMetadata(name);
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
    res.write("site"); break;

    default:
    if (this.tags.size() > 0) {
      html.link({href: this.tags.get(0).tag.href()}, "topic");
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
  if (!tag) {
    return;
  }
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
    res.write(this.commentMode === Story.OPEN ? "yes" : "no");
  }
  return;
}

Story.prototype.editableby_macro = function(param) {
  if (param.as == "editor" && (session.user == this.creator || !this.creator)) {
    var options = [Story.PUBLIC, Story.SHARED, Story.OPEN];
    var labels = ["content managers", "contributors", "subscribers"];
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
      res.write("Content managers of " + path.site.title);
      break;
      case Story.SHARED:
      res.write("Contributors to " + path.site.title);
      break;
      case Story.OPEN:
      res.write("Subscribers of and contributors to " + path.site.title);
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
    res.write(param.text || "edit");
  }
  return this.link_macro(param, "edit", res.pop());
}

Story.prototype.deletelink_macro = function(param) {
  res.push();
  if (param.image && this.site.images.get(param.image)) {
    var image = this.site.images.get(param.image);
    delete param.image;
    image && image.render_macro(param);
  } else {
    res.write(param.text || "delete");
  }
  return this.link_macro(param, "delete", res.pop());
}

Story.prototype.viewlink_macro = function(param) {
  res.push();
  if (param.image && this.site.images.get(param.image)) {
    var image = this.site.images.get(param.image);
    delete param.image;
    image && image.render_macro(param);
  } else {
    res.write(param.text || "view");
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
    res.write(param.no || "offline");
  } else if (this.status === Story.PUBLIC || this.status === Story.HIDDEN) {
    res.write(param.yes || "online");
  } return;
}

Story.prototype.createtime_macro = function(param) {
  if (param.as === "editor") {
    if (this.created) {
      param.value = formatDate(this.created, "yyyy-MM-dd HH:mm");
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
    res.write(param.no || "no comments");
  } else if (commentCnt < 2) {
    res.write(param.one || "one comment");
  } else {
    res.write(commentCnt + (param.more || " " + "comments"));
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
