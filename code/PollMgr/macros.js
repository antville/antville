/**
 * macro writes storylist to response-object
 * kept for backwards-compatibility only
 */

function pollList_macro(param) {
   res.write(res.data.pollList);
   return;
}
