/**
 * macro rendering loginStatus of user
 * valid params:  -  loginSkin
 *                -  logoutSkin
 */

function loginstatus_macro(param) {
   if (user.uid)
      this.members.renderSkin("statusloggedin");
   else if (getActionName() != "login")
      this.members.renderSkin("statusloggedout");
}

/**
 * macro basically renders a list of weblogs
 * but first it checks which collection to use
 */
function webloglist_macro(param) {
   if (param.show == "all")
      var collection = this.allWeblogs;
   else
      var collection = this;

   var size = collection.size();
   if (!size)
      return;

   res.write(param.prefix);
   var start = parseInt (req.data.start,10);
   var limit = parseInt(param.limit,10);
   var scroll = (!param.scroll || param.scroll == "no" ? false : true);
   if (isNaN(start) || start > size-1)
      start = 0;
   if (!scroll)
      var end = Math.min((limit ? limit : size),size);
   else {
      var end = Math.min (start+(limit ? limit : 10), size);
      if (start > 0) {
	      var sp = new Object();
	      sp.url = this.href("list") + "?start=" + Math.max(0, start-limit);
	      sp.text = "previous weblogs";
	      res.write(renderSkinAsString("prevpagelink",sp) + "<br>");
      }
   }
   for (var i=start;i<end;i++)
      collection.get(i).renderSkin("preview");
   if (scroll && end < size) {
      var sp = new Object();
      sp.url = this.href("list") + "?start=" + end;
      sp.text = "more weblogs";
      res.write("<br>" + renderSkinAsString("nextpagelink",sp));
   }
   res.write(param.suffix);
}


/**
 * macro renders the number of weblogs
 */

function weblogcounter_macro(param) {
   res.write(param.prefix)
   res.write(this.size());
   res.write(param.suffix);
}
