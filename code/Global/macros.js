/**
 * macro renders the current timestamp
 */

function now_macro(param) {
   res.write(param.prefix)
   var now = new Date();
   if (param.format)
      res.write(now.format(param.format));
   else
      res.write(now.format("yyyy.MM.dd HH:mm"));
   res.write(param.suffix);
}
