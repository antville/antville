/**
 * macro renders res.data.goodielist to response-object
 * left for backwards-compatibility only
 */

function goodies_macro(param) {
   res.write(res.data.goodielist);
   return;
}

