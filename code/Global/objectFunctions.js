/**
 * check if email-adress is syntactically correct
 */

function checkEmail(address) {
   var m = new Mail();
   m.addTo(address);
   if (m.status)
      return false;
   return true;
}


/**
 * function checks if req.data.date[Year|Month|Date|Hours|Minutes] is valid
 * if correct, creates dateobject and returns it
 * otherwise false
 */

function checkDate() {
   if (req.data.dateYear && req.data.dateMonth && req.data.dateDate && req.data.dateHours && req.data.dateMinutes) {
      var ts = new Date();
      ts.setYear(parseInt(req.data.dateYear));
      ts.setMonth(parseInt(req.data.dateMonth));
      ts.setDate(parseInt(req.data.dateDate));
      ts.setHours(parseInt(req.data.dateHours));
      ts.setMinutes(parseInt(req.data.dateMinutes));
      ts.setSeconds(0);
      return (ts);
   } else
      return false;
}

/**
 * functin checks if the string passed contains special characters like
 * spaces, brackets etc.
 */

function isClean(str) {
   var validChar = new RegExp("[^a-z,^A-Z,^0-9]");
   if (validChar.exec(str))
      return false;
   return true;
}

/**
 * function checks if there is a weblog-object in path
 * if true, it sets the skin of response to "page" and returns the weblog-object found
 * if false, it uses root and it's page-skin
 */

function setLayout() {
   if (path.weblog) {
      res.skin = "weblog.page";
      return (path.weblog);
   } else {
      res.skin = "root.page";
      return (root);
   }
}

/**
 * function creates macro-tags out of plain urls in text
 * does this with three replace-operations
 */

function formatLinks(str) {
   var pre = "<% this.link to=\"";
   var mid = "\" text=\"";
   var post = "\" %>";
   var l0 = new RegExp("<a href\\s*=\\s*\"?([^\\s\"]+)?\"?[^>]*?>([^<]*?)</a>");
   var l1 = new RegExp("([fhtpsr]+:\\/\\/[^\\s]+?)([\\.,;\\)\\]\"]?(\\s|$))");
   var l2 = new RegExp("(<%[^%]*?)" + pre + "(.*?)" + mid + ".*?" + post + "([^%]*?%>)");
   l0.ignoreCase = l1.ignoreCase = l2.ignoreCase = true;
   l0.global = l1.global = l2.global = true;
   
   str = str.replace(l0, pre + "$1" + mid + "$2" + post);
   str = str.replace(l1, pre + "$1" + mid + "$1" + post + "$3");
   str = str.replace(l2, "$1$2$3");
   /* old version:
   var pre = "<% this.link to=\"";
   var mid = "\" text=\"";
   var post = "\" %>";
   var l0 = new RegExp("<\\s*a\\s*href\\s*=\\s*\"?([^\\s\"]+)?\"?[^>]*?>([^<]*?)</a>");
   var l1 = new RegExp("([fhtpsr]+:\\/\\/[^\\s]+?)([\\.,;\\)\\]\"]?(\\s|$))");
   var l2 = new RegExp("(<%[^%]*?)" + pre + "(.*?)" + mid + ".*?" + post + "([^%]*?%>)");
   l0.ignoreCase = l1.ignoreCase = l2.ignoreCase = true;
   l0.global = l1.global = l2.global = true;
   
   str = str.replace(l0, pre + "$1" + mid + "$2" + post);
   str = str.replace(l1, pre + "$1" + mid + "link" + post + "$2");
   str = str.replace(l2, "$1$2$3");
   */
   return (str);
}

/**
 * function activates URLs to HTML link tags
 */
function activateLinks (str) {
   var pre = "<a href=\"";
   var mid = "\">";
   var post = "</a>";

   var l1 = new RegExp("(^|\\s)([fhtpsr]+:\\/\\/[^\\s]+?)([\\.,;\\)\\]\"]?(\\s|$))");
   l1.ignoreCase = true;
   l1.global = true;
   
   // this is odd, but we have to run the regexp twice to catch URLs 
   // which imediately follow each other. This is because the leading 
   // and trailing whitespaces are part of the expression, and if there's only 
   // one whitespace character between two URLs, the first match eats it up 
   // and the second URL doesn't match.
   str = str.replace(l1, "$1" + pre + "$2" + mid + "$2" + post + "$4");
   str = str.replace(l1, "$1" + pre + "$2" + mid + "$2" + post + "$4");
   return (str);
}

/**
 * function checks if url is correct
 * if not it assumes that http is the protocol
 */

function evalURL(url) {
   if (url.indexOf("://") < 0)
      return ("http://" + url);
   return (url);
}

/**
 * function checks if user has permanent cookies
 * storing username and password
 */

function autoLogin() {
   if (user.uid)
      return;
   var name = req.data.avUsr;
   var pw = req.data.avPw;
   if (!name || !pw)
      return;
   var u = getUser(name);
   if (!u)
      return;
   if (calcMD5(u.password) != pw)
      return;
   else {
      if (user.login(name,u.password)) {
         user.lastVisit = new Date();
         res.message = "Welcome to Antville, " + user.name + "! Have fun!";
      } else
         return;
   }
}

/**
 * function checks if weblog or root should handle the image-rendering
 * by checking if there's a slash in the name of the image
 * returns an Object containing the handler that should render the image
 * and the image-object
 */

function imgDispatch(imgName) {
   var dp = new Object();
   if (imgName.indexOf("/") >= 0) {
      var imgPath = imgName.split("/");
      dp.handler = (!imgPath[0] || imgPath[0] == "root") ? root : root.get(imgPath[0]);
      dp.imgName = imgPath[1];
   } else {
      dp.handler = path.weblog;
      dp.imgName = imgName;
   }
   if (!dp.handler)
      return null;
   dp.img = dp.handler.images.get(dp.imgName);
   if (!dp.img)
      return null;
   return (dp);
}

/**
 * This function parses a string for <img> tags and turns them
 * into <a> tags.  
 */ 
function convertHtmlImageToHtmlLink(str) {
   var re = new RegExp("<img src\\s*=\\s*\"?([^\\s\"]+)?\"?[^>]*?(alt\\s*=\\s*\"?([^\"]+)?\"?[^>]*?)?>");
   re.ignoreCase = true;
   re.global = true;
   str = str.replace(re, "[<a href=\"$1\" title=\"$3\">Image</a>]");
 	return(str);
}
