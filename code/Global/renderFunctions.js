/**
 * renders prefix if it's given
 */

function renderPrefix(param) {
   if (param.prefix)
      res.write(param.prefix);
   return;
}

/**
 * renders sufffix if it's given
 */

function renderSuffix(param) {
   if (param.suffix)
      res.write(param.suffix);
   return;
}

/**
 * returns name of action file the user has called
 * Input params: none
 * returns: string (= name of .hac-file)
 */


function getActionName() {
   // return name of current action executed by user
   var rPath = req.path.split("/");
   if (path[path.length-1].__id__ == rPath[rPath.length-1] || path[path.length-1].__name__ == rPath[rPath.length-1])
      return "main";
   else
      return(rPath[rPath.length -1]);
}

