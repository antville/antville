/**
 * macro renders res.data.imagelist to response-object
 * left for backwards-compatibility only
 */

function images_macro(param) {
   res.write(res.data.imagelist);
   return;
}


/**
 * FIXME!
 *
 * macro renders editor for chosen image
 */

function imageeditor_macro(param) {
  return;
}
