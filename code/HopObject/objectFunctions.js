/**
 * Return a name for the object to be used in the
 * global linkedpath macro
 * this function is overwritten by day-objects!
 * @see day.getNavigationName()
 * @see story.getNavigationName()
 * @see topic.getNavigationName()
 */
function getNavigationName() {
   var proto = this._prototype;
   var display;
   if (display = getDisplay(proto))
      return display;
   return this.__name__;
}


/**
 * creates parameter object that will be passed to
 * function that renders the input element
 */
function createInputParam(propName, param) {
   param.name = propName;
   // submitted values override property value
   // but only if there were not multiple form elements
   // with the same name submitted
   if (!req.data[propName + "_array"] && req.data[propName] != null)
      param.value = req.data[propName];
   else
      param.value = this[propName];
   delete param.as;
   return param;
}

/**
 * create a parameter object for checkboxes
 */
function createCheckBoxParam(propName, param) {
   param.name = propName;
   param.value = 1;
   if (req.data[propName] == 1 || this[propName] == 1)
      param.checked = "checked";
   delete param.as;
   return param;
}

/**
 * derives parameter object from an object that will
 * be passed to function that renders the link element
 */
function createLinkParam(param) {
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
}

/**
 * method for rendering any module navigation
 * by calling the module method renderSiteNavigation
 */
function applyModuleMethod(module, funcName, param) {
   if (module && module[funcName])
      module[funcName].apply(this, [param]);
   return;
};
