/**
 * Return a name for the object to be used in the
 * global linkedpath macro. Not the cleanest way to do
 * this (lots of heuristics) but a simple one.
 *
 */
function getNavigationName () {
   var proto = this.__prototype__;
   if (proto == "weblog")
      return "Home";
   else if (proto == "topicmgr")
      return "Topics";
   else if (proto == "story" || proto == "comment")
      if (this.title)
         return this.title;
      else
         return proto;
   else if (this.groupname)
      return this.groupname;
   return this._name;
}

/**
 * creates parameter-object that will be passed to
 * function that renders the input
 */

function createInputParam(propName,param) {
   var inputParam = new Object();
   inputParam.name = propName;
   for (var i in param)
      inputParam[i] = param[i];
   inputParam.value = this[propName];
   return (inputParam);
}
