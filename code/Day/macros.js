/**
 * macro writes storylist to response-object
 * kept for backwards-compatibility only
 */

function storylist_macro(param) {
   res.write(res.data.storylist);
   return;
}


/**
 *  Overwrite link macro to use groupname. No fancy options.
 */
function link_macro () {
   var attr = new Object();
   attr.href = this.href();
   openMarkupElement("a", attr);
   res.write(this.groupname);
   closeMarkupElement("a");
}
