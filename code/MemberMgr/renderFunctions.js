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
   res.data.title = title + " of " + this._parent.title;
   res.data.memberlist = renderList(collection, "mgrlistitem", 10, req.data.page);
   res.data.pagenavigation = renderPageNavigation(collection, this.href(req.action), 10, req.data.page);
   res.data.body = this.renderSkinAsString("main");
   res.handlers.context.renderSkin("page");
   return;
}