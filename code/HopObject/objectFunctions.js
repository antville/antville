/**
 * Return a name for the object to be used in the
 * global linkedpath macro
 * this function is overwritten by day-objects!
 * @see day.getNavigationName()
 * @see story.getNavigationName()
 * @see topic.getNavigationName()
 */
function getNavigationName () {
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
   var inputParam = new Object();
   inputParam.name = propName;
   for (var i in param)
      inputParam[i] = param[i];
   inputParam.value = encodeForm(this[propName]);
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
   } else if (url.indexOf("://") > -1 || url.indexOf("javascript") == 0)
      param.href = url;
   else {
      // check if link points to a subcollection
      if (url.indexOf("/") > -1)
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