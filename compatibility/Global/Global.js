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

HopObject.prototype.createtime_macro = function(param) {
   return this.created_macro.apply(this, arguments);
};

HopObject.prototype.modifytime_macro = function() {
   return this.modified_macro.apply(this, arguments);
};

HopObject.prototype.url_macro = function(param) {
   return this.href_macro(param);
};

HopObject.prototype.createInputParam = function(propName, param) {
   param.name = propName;
   // submitted values override property value
   // but only if there were not multiple form elements
   // with the same name submitted
   var multiple = req.data[propName + "_array"];
   if ((!multiple || multiple.length < 2) && req.data[propName] != null) {
      param.value = req.data[propName];
   } else {
      param.value = this[propName];
   }
   delete param.as;
   return param;
};

HopObject.prototype.createCheckBoxParam = function(propName, param) {
   param.name = propName;
   param.value = 1;
   if (req.data[propName] == 1 || this[propName]) {
      param.checked = "checked";
   }
   delete param.as;
   return param;
};

HopObject.prototype.createLinkParam = function(param) {
   // clone the param object since known non-html
   // attributes are going to be deleted
   var linkParam = Object.clone(param);
   var url = param.to ? param.to : param.linkto;
   if (!url || url == "main") {
      if (this._prototype != "Comment")
         linkParam.href = this.href();
      else
         linkParam.href = this.story.href() + "#" + this._id;
   } else if (url.contains("://") || url.startsWith("javascript"))
      linkParam.href = url;
   else {
      // check if link points to a subcollection
      if (url.contains("/"))
         linkParam.href = this.href() + url;
      else
         linkParam.href = this.href(url);
   }
   if (param.urlparam)
      linkParam.href += "?" + param.urlparam;
   if (param.anchor)
      linkParam.href += "#" + param.anchor;
   delete linkParam.to;
   delete linkParam.linkto;
   delete linkParam.urlparam;
   delete linkParam.anchor;
   delete linkParam.text;
   return linkParam;
};

Root.prototype.new_action = function() {
   res.redirect(this.href("create"));
   return;
};

Root.prototype.colorpicker_action = function() {
   if (!req.data.skin)
      req.data.skin = "colorpicker";
   renderSkin(req.data.skin);
   return;
};

Root.prototype.rss_action = function() {
   res.redirect(root.href("rss.xml"));
   return;
};

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
