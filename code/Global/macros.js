/**
 * macro renders the current timestamp
 */

function now_macro(param) {
   renderPrefix(param);
   var now = new Date();
   if (param.format)
      res.write(now.format(param.format));
   else
      res.write(now.format("yyyy.MM.dd HH:mm"));
   renderSuffix(param);
}