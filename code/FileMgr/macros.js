/**
 * macro renders res.data.filelist to response-object
 * left for backwards-compatibility only
 */

function files_macro(param) {
   res.write(res.data.filelist);
   return;
}

