/**
 *  Overwrite link macro to use groupname.
 *  FIXME: (???) No fancy options.
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
      return "[" + getMessage("error.invalidDatePattern") + "]";
   }
}
