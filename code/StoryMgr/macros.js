/**
 * macro writes storylist to response-object
 * kept for backwards-compatibility only
 */

function storylist_macro(param) {
   res.write(param.prefix)
   res.write(res.data.storylist);
   res.write(param.suffix);
   return;
}
