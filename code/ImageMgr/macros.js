/**
 * macro renders res.data.imagelist to response-object
 * left for backwards-compatibility only
 */

function images_macro(param) {
   res.write(param.prefix)
   res.write(res.data.imagelist);
   res.write(param.suffix);
   return;
}


/**
 * macro renders editor for chosen image
 */

function imageeditor_macro(param) {
   res.write(param.prefix)
   res.write(param.suffix);
}
