/**
 * evaluating new weblog
 */

function evalNewWeblog() {
   var newLog = new weblog();
   if (req.data.title && req.data.alias) {
      newLog.title = req.data.title;
      newLog.alias = req.data.alias;
      if (this.checkIfExists(newLog.alias)) {
         res.message = "Sorry, we already have a weblog with this alias!";
         newLog.error = true;
      } else if (!isClean(newLog.alias)) {
         res.message = "Please don't use any special characters in the alias!";
         newLog.error = true;
      } else {
         // now we can safely create a new weblog
         this.createNewWeblog(newLog);
      }
   } else {
      newLog.error = true;
      newLog.title = newLog.alias = "";
      if (!res.message) res.message = "Please fill in the form to create your new Weblog!";
   }
   return (newLog);
}


/**
 * check if alias is already in use
 */

function checkIfExists(alias) {
   if (this.get(alias))
      return true;
   return false;
}

/**
 * create a new weblog
 */

function createNewWeblog(newLog) {
   newLog.creator = user;
   newLog.createtime = new Date();
   newLog.online = 0;
   newLog.discussions = 1;
   newLog.usercontrib = 0;
   newLog.usersignup = 1;
   newLog.archive = 1;
   newLog.blocked = 0;
   newLog.birthdate = new Date();
   newLog.bgcolor = "FFFFFF";
   newLog.textfont = "Arial, Helvetica, sans-serif";
   newLog.textsize = "10pt";
   newLog.textcolor = "000000";
   newLog.linkcolor = "0000FF";
   newLog.alinkcolor = "FF0000";
   newLog.vlinkcolor = "0000CC";
   newLog.titlefont = "Arial, Helvetica, sans-serif";
   newLog.titlesize = "12pt";
   newLog.titlecolor = "CC0000";
   newLog.days = 3;
   newLog.language = "en";
   newLog.country = "US";
   newLog.createImgDirectory()
   this.add(newLog);
   // create member-object for connecting user <-> weblog with admin-rights
   newLog.createMember(2);
   res.message = "Your weblog was created successfully! Have fun!";
   res.redirect(newLog.href());
}

/**
 * alias of image has changed, so we remove it and add it again with it's new alias
 */

function changeAlias(currImg) {
   // var oldAlias = currImg.alias;
   currImg.setParent(this);
   this.remove(currImg);
   this.set(currImg.alias,null);
   currImg.alias = req.data.alias;
   this.add(currImg);
   return;
}

