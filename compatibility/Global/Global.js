Metadata.prototype.getProperty = Metadata.prototype.get;
Metadata.prototype.setProperty = Metadata.prototype.set;
Metadata.prototype.setAll = Metadata.prototype.setData;

Metadata.prototype.createInputParam = function(propName, param) {
   param.name = this.__name__ + "_" + propName;
   if (!req.data[param.name + "_array"] && req.data[param.name] != null)
      param.value = req.data[param.name];
   else
      param.value = this.get(propName);
   delete param.as;
   return param;
};

Metadata.prototype.createCheckBoxParam = function(propName, param) {
   param.name = this.__name__ + "_" + propName;
   param.value = 1;
   if (req.data[param.name] == 1 || this.get(propName) == 1)
      param.checked = "checked";
   delete param.as;
   return param;
};

ImageMgr.prototype.link_macro = function(param) {
   if (this.getContext() === "Layout" && param.to === "myimages") {
      param.to = "default";
      param.text = "default images";
   }
   return HopObject.prototype.link_macro.apply(this, arguments);
};

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
   if (!this.online || this.tags.size() < 1)
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
   var topics = site[this.constructor === Story ? "tags" : "slideshows"];
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

Story.prototype.setTopic = function(input) {
   var site = this.site || res.handlers.site;
   if (input) {
       // FIXME: this should be solved more elegantly
      if (String.URLPATTERN.test(input)) {
         throw new Exception("topicNoSpecialChars");
      }
      if (site.tags[input] || site.tags[input + "_action"]) {
         throw new Exception("topicReservedWord");
      }
   }
   return input;
};

Image.prototype.topicchooser_macro = function() {
   return Story.prototype.topicchooser_macro.apply(this, arguments);
};

Image.prototype.topic_macro = function() {
   return Story.prototype.topic_macro.apply(this, arguments);
};
