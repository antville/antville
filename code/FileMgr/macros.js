/**
 * macro renders goodiepool as list
 */

function goodies_macro(param) {
   res.write(param.prefix)
   var size = this.size();
   var start = parseInt (req.data.start);
   if (isNaN (start)|| start >= size-1)
      start = 0;
   var end = Math.min (start+20, size);
   if (start > 0)
      res.write ("...&nbsp;<a href='"+this.href()+"?start="+Math.max(0, start-20)+"'>newer goodies</a><br>");
   for (var i=start; i<end; i++) {
      this.get(i).renderSkin("preview");
   }
   if (end < size)
      res.write ("<br><a href='"+this.href()+"?start="+end+"'>older goodies</a>&nbsp;...");
   res.write(param.suffix);
}

