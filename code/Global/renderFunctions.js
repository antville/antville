
/**
 * returns name of action file the user has called
 * Input params: none
 * returns: string (= name of .hac-file)
 */


function getActionName() {
   // return name of current action executed by user
   var rPath = req.path.split("/");
   if (path[path.length-1]._id == rPath[rPath.length-1] || path[path.length-1]._name == rPath[rPath.length-1])
      return "main";
   else
      return(rPath[rPath.length -1]);
}

/**
 * function tries to check if the color contains just hex-characters
 * if so, it renders the color-definition prefixed with a '#'
 * otherwise it assumes the color is a named one
 */

function renderColor(c) {
   if (c.length == 6) {
      var nonhex = new RegExp("[^0-9,a-f]");
      nonhex.ignoreCase = true;
      var found = c.match(nonhex);
      if (!found) {
         // color-string contains just hex-characters, so we prefix it with '#'
         res.write("#" + c);
         return;
      }
   }
   res.write(c);
}