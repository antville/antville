/**
 * macro renders imagepool as list
 */

function images_macro(param) {
   renderPrefix(param);
   for (var i=0;i<this.size();i++) {
      this.get(i).renderSkin("preview");
   }
   renderSuffix(param);
}


/**
 * macro renders editor for chosen image
 */

function imageeditor_macro(param) {
   renderPrefix(param);
   renderSuffix(param);
}