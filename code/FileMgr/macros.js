/**
 * macro renders res.data.goodielist to response-object
 * left for backwards-compatibility only
 */

function goodies_macro(param) {
   res.write(param.prefix)
   res.write(res.data.goodielist);
   res.write(param.suffix);
   return;
}

