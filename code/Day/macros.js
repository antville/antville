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
   Html.link({href: this.href()}, this.groupname);
   return;
}


/**
 * return the groupname as formatted date
 */
function date_macro(param) {
   var ts = this.groupname.toDate("yyyyMMdd", this._parent.getTimeZone());
   try {
      return formatTimestamp(ts, param.format);
   } catch (err) {
      return "[invalid format pattern]";
   }
}
