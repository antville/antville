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
   if (DISPLAY[proto])
      return DISPLAY[proto];
   return this.__name__;
}


/**
 * creates parameter object that will be passed to
 * function that renders the input element
 */
function createInputParam(propName, param) {
   var inputParam = ObjectLib.clone(param);
   inputParam.name = propName;
   // submitted values override property value
   // but only if there were not multiple form elements
   // with the same name submitted
   if (!req.data[propName + "_array"] && req.data[propName] != null)
      inputParam.value = req.data[propName];
   else
      inputParam.value = this[propName];
   delete inputParam.as;
   return (inputParam);
}


/**
 * derives parameter object from an object that will
 * be passed to function that renders the link element
 */
function createLinkParam(param) {
   var url = param.to ? param.to : param.linkto;
   if (!url || url == "main") {
      if (this._prototype != "comment")
         param.href = this.href();
      else
         param.href = this.story.href() + "#" + this._id;
   } else if (url.contains("://") || url.startsWith("javascript"))
      param.href = url;
   else {
      // check if link points to a subcollection
      if (url.contains("/"))
         param.href = this.href() + url;
      else
         param.href = this.href(url);
   }
   if (param.urlparam)
      param.href += "?" + param.urlparam;
   if (param.anchor)
      param.href += "#" + param.anchor;
   delete param.to;
   delete param.linkto;
   delete param.urlparam;
   delete param.anchor;
   delete param.text;
   delete param.prefix;
   delete param.suffix;
   return(param);
}