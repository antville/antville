Layouts.prototype.layoutchooser_macro = function(param) {
   var options = [];
   var size = this.size();
   for (var i=0;i<size;i++) {
      var l = this.get(i);
      options.push({value: l.alias, display: l.title});
   }
   Html.dropDown({name: "layout"}, options, param.selected, param.firstOption);
   return;
};
