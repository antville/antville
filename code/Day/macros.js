/**
 * macro writes storylist to response-object
 * kept for backwards-compatibility only
 */

function storylist_macro(param) {
   res.write(param.prefix)
   res.write(res.data.storylist);
   res.write(param.suffix)
   return;
}


/**
 *  Overwrite link macro to use groupname. No fancy options.
 */
function link_macro () {
   res.write ("<a href=\"");
   res.write (this.href());
   res.write ("\">");
   res.write (this.groupname);
   res.write ("</a>");
}