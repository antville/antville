/**
 * additional check that is done for each item
 * in the system manager lists
 * @param Object item to render
 */
function renderManagerView(item) {
   var result = item.renderSkinAsString("sysmgr_listitem");
   if (req.data.selectedItem && item == req.data.selectedItem) {
      if (req.data.action == "remove")
         result += item.renderSkinAsString("sysmgr_delete");
      else
         result += item.renderSkinAsString("sysmgr_edit");
   }
   return result;
}
