/**
 * main action
 */
function main_action() {
   if (this._prototype == "Day" && !path.Site.preferences.getProperty("archive"))
      res.redirect(path.Site.href());
   
   res.data.title = path.Site.title + ": ";
   this.renderStorylist(parseInt(req.data.start, 10));
   if (this._prototype == "Day") {
      var ts = this.groupname.toDate("yyyyMMdd", this._parent.getTimeZone());
      res.data.title += formatTimestamp(ts, "yyyy-MM-dd");
   } else
      res.data.title += this.groupname;
   if (this._parent._prototype == "PictureTopicMgr")
      res.data.body = this.renderSkinAsString("imagetopic");
   else
      res.data.body = this.renderSkinAsString("main");
   path.Site.renderSkin("page");
   return;
}

/**
 * rss feed for specific days and topics
 */
function rss_action() {
  req.data.show = this._prototype;
  req.data[this._prototype] = this.groupname;
  path.Site.rss_action();
  return;
}
