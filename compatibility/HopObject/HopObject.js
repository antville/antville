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
