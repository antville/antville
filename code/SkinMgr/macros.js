/**
 * macro renders a list of skinsets defined for this site
 */

function skinsets_macro(param) {
   var l = this.size();
   if (l == 0) {
      return "- no skinsets -";
   } else {
      this.renderSkin("skinsets");
   }
}

/**
 * macro renders a form for creating a new skinset
 */

function skinsetchooser_macro(param) {
   var sets = new Array(["", "default skinset"]);
   var l = this.size();
   for (var i=0; i<l; i++) {
      var sks = this.get(i);
      sets[sets.length] = [sks._id, sks.name];
   }
   Html.dropDown("skinset", sets, param.selected, "Choose Skinset");
}
