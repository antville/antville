/**
 * additional check that is done for each item
 * in the system manager lists
 * @param Object item to render
 */
function renderManagerView(item) {
   item.renderSkin("sysmgr_listitem");
   if (req.data.selectedItem && item == req.data.selectedItem)
      item.renderSkin(req.data.action == "remove" ? "sysmgr_delete" : "sysmgr_edit");
   return;
}
