/**
 * function renders a nice pagewise-navigationbar
 * @param String collection to work on
 * @param String url of action to link to
 * @param Int Page the user is currently viewing
 * @return String rendered Navigationbar
 */

function renderPageNavigation(collection,url,pageIdx) {
   var size = this[collection].size();
   var itmsPerPage = 20;
   var totalPages = Math.ceil(size/itmsPerPage);
   // init property
   res.data.pagenav = "";
   // check if the passed page-index is correct
   if (isNaN (pageIdx)|| pageIdx > Math.ceil(size/itmsPerPage) || pageIdx < 0)
      pageIdx = 0;
   if (size) {
      // assign the summary to res.data.summary
      res.data.display = ((pageIdx*itmsPerPage)+1) + "-" + (Math.min((pageIdx*itmsPerPage)+itmsPerPage,size));
      res.data.total = "(of " + size + ")";
   }
   // if we have just one page, there's no need for navigation
   if (totalPages <= 1)
      return;
   // build the navigation-bar
   if (pageIdx > 0)
      res.data.pagenav += "<a href=\"" + url + "?page=" + (pageIdx-1) + "\">prev</a>&nbsp;";
   var offset = Math.floor(pageIdx/10)*10;
   if (offset > 0)
      res.data.pagenav += "<a href=\"" + url + "?page=" + (offset-1) + "\">[..]</a>&nbsp;";
   for (var i=0;i<10;i++) {
      var page = offset+i;
      if (page >= totalPages)
         break;
      if (page == pageIdx)
         res.data.pagenav += "[" + (page+1) + "]&nbsp;";
      else
         res.data.pagenav += "<a href=\"" + url + "?page=" + page + "\">[" + (page+1) + "]</a>&nbsp;";
   }
   if (page < totalPages-1)
      res.data.pagenav += "<a href=\"" + url + "?page=" + (offset+10) + "\">[..]</a>&nbsp;";
   if (pageIdx < totalPages-1)
      res.data.pagenav += "<a href=\"" + url + "?page=" + (pageIdx+1) + "\">next</a>";
   return;
}

/**
 * function renders the list of stories for day-pages
 * and assigns the rendered list to res.data.storylist
 * scrollnavigation-links to previous and next page(s) are also
 * assigned to res.data (res.data.prevpage, res.data.nextpage)
 * using this separate renderFunction instead of doing the stuff
 * in storylist_macro() was necessary for completely independent
 * placement of the prevpage- and nextpage-links
 * @param Int Index-position to start with
 * @param String String indicating what kind of stories to show
 */

function renderList(collection,reqItem,reqAction,pageIdx) {
   var size = this[collection].size();
   var itmsPerPage = 20;
   var totalPages = Math.ceil(size/itmsPerPage);

   if (isNaN (pageIdx)|| pageIdx > totalPages || pageIdx < 0)
      pageIdx = 0;

   var start = pageIdx*itmsPerPage;
   var stop = Math.min(start+itmsPerPage,size);

   res.data.list = "";
   for (var i=start;i<stop;i++) {
      var itm = this[collection].get(i);
      res.data.list += itm.renderSkinAsString("sysmgr_listitem");
      if (reqItem == itm.__name__) {
         if (reqAction == "remove")
            res.data.list += itm.renderSkinAsString("sysmgr_delete");
         else
            res.data.list += itm.renderSkinAsString("sysmgr_edit");
      }
   }
   return;
}
