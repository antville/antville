/**
 * render the list of members of a site
 */
function renderMemberlist() {
   var currLvl = null;
   res.push();
   for (var i=0;i<this.size();i++) {
      var m = this.get(i);
      if (m.level != currLvl) {
         this.renderSkin("membergroup", {group: getRole(m.level)});
         currLvl = m.level;
      }
      m.renderSkin("mgrlistitem");
   }
   return res.pop();
}

/**
 * render the whole page containing a list of members
 * @param Object collection to work on
 * @param String Title to use
 */
function renderView(collection, title) {
   if (this._parent != root) {
      res.data.title = getMessage("MemberMgr.viewListTitle", {titel: title, siteName: this._parent.title});
      res.data.memberlist = renderList(collection, "mgrlistitem", 10, req.data.page);
      res.data.pagenavigation = renderPageNavigation(collection, this.href(req.action), 10, req.data.page);
      res.data.body = this.renderSkinAsString("main");
      res.handlers.context.renderSkin("page");
   }
   return;
}

/**
 * render the whole page containing a list of sites (subscriptions)
 * @param Object collection to work on
 * @param String page title
 */
function renderSubscriptionView(collection, title) {
   var sitelist = collection.list();
   var sorter = function(a, b) {
      var str1 = a.site.title.toLowerCase();
      var str2 = b.site.title.toLowerCase();
      if (str1 > str2)
         return 1;
      else if (str1 < str2)
         return -1;
      return 0;
   }
   sitelist.sort(sorter);
   res.data.title = getMessage("MemberMgr.subscriptionsTitle", {titel: title, userName: session.user.name});
   res.data.sitelist = renderList(sitelist, "subscriptionlistitem");
   res.data.body = session.user.renderSkinAsString("subscriptions");
   res.handlers.context.renderSkin("page");
   return;
}
