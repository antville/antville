/**
 * main action
 */
function main_action() {
   if (this._prototype == "day" && !path.site.preferences.getProperty("archive"))
      res.redirect(path.site.href());
   
   res.data.title = path.site.title + ": ";
   this.renderStorylist(parseInt(req.data.start, 10));
   if (this._prototype == "day") {
      var ts = this.groupname.toDate("yyyyMMdd", this._parent.getTimeZone());
      res.data.title += formatTimestamp(ts, "yyyy-MM-dd");
   } else
      res.data.title += this.groupname;
   res.data.body = this.renderSkinAsString("main");
   path.site.renderSkin("page");
}