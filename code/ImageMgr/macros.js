/**
 * macro renders imagepool as list
 */

function images_macro(param) {
   res.write(param.prefix)
   for (var i=0;i<this.size();i++) {
      this.get(i).renderSkin("preview");
   }
   res.write(param.suffix);
}


/**
 * macro renders editor for chosen image
 */

function imageeditor_macro(param) {
   res.write(param.prefix)
   res.write(param.suffix);
}
