/**
 * macro renders imagepool as list
 */

function images_macro(param) {
   res.write(param.prefix)
   var size = this.size();
   var start = parseInt (req.data.start);
   if (isNaN (start)|| start >= size-1)
      start = 0;
   var end = Math.min (start+20, size);
   if (start > 0)
      res.write ("...&nbsp;<a href='"+this.href()+"?start="+Math.max(0, start-20)+"'>newer images</a><br>");
   for (var i=start; i<end; i++) {
      this.get(i).renderSkin("preview");
   }
   if (end < size)
      res.write ("<br><a href='"+this.href()+"?start="+end+"'>older images</a>&nbsp;...");
   res.write(param.suffix);
}


/**
 * macro renders editor for chosen image
 */

function imageeditor_macro(param) {
   res.write(param.prefix)
   res.write(param.suffix);
}
