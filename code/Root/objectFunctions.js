/**
 * evaluating new weblog
 */

function evalWeblog(title,alias,creator) {
   var result = new Object();
   if (!alias) {
      result.message = "Please choose an alias for your weblog!";
      result.error = true;
   } else if (this.get(alias)) {
      result.message = "Sorry, we already have a weblog with this alias!";
      result.error = true;
   } else if (!isClean(alias)) {
      result.message = "Please don't use any special characters in the alias!";
      result.error = true;
   } else {
      // check if alias is similar to an action-name (which is reserved)
      var reserved = eval("this." + alias + "_action");
      if (reserved) {
         result.message = "Sorry, this alias is reserved!";
         result.error = true;
      }
   }
   if (!title) {
      result.message = "Please choose a title for your weblog!";
      result.error = true;
   }
   if (!result.error) {
      result.weblog = this.createNewWeblog(title,alias,creator);
      if (!result.weblog) {
         result.message = "Couldn't create your weblog!";
         result.error = true;
      } else
         result.message = "Your weblog was created successfully!";
   }
   return (result);
}


/**
 * create a new weblog
 */

function createNewWeblog(title,alias,creator) {
   var newLog = new weblog();
   newLog.title = title;
   newLog.alias = alias;
   newLog.creator = creator;
   newLog.createtime = newLog.lastoffline = newLog.birthdate = new Date();
   newLog.email = creator.email;
   newLog.online = 0;
   newLog.discussions = 1;
   newLog.usercontrib = 0;
   newLog.usersignup = 1;
   newLog.archive = 1;
   newLog.blocked = 0;
   newLog.trusted = (creator.isTrusted() ? 1 : 0);
   newLog.bgcolor = "FFFFFF";
   newLog.textfont = "Verdana,Helvetica,Arial,sans-serif";
   newLog.textsize = "13px";
   newLog.textcolor = "000000";
   newLog.linkcolor = "FF3300";
   newLog.alinkcolor = "FF0000";
   newLog.vlinkcolor = "FF3300";
   newLog.titlefont = "Verdana,Helvetica,Arial,sans-serif";
   newLog.titlesize = "15px";
   newLog.titlecolor = "CC0000";
   newLog.smallfont = "Arial,Helvetica,sans-serif";
   newLog.smallsize = "12px";
   newLog.smallcolor = "999999";
   newLog.days = 3;
   newLog.language = "en";
   newLog.country = "US";
   newLog.longdateformat = "EEEE, dd. MMMM yyyy, h:mm a";
   newLog.shortdateformat = "yyyy.MM.dd, HH:mm";
   newLog.enableping = 0;
   newLog.createImgDirectory()
   if (this.add(newLog)) {
      // create member-object for connecting user <-> weblog with admin-rights
      newLog.members.addMember(creator,getAdminLvl());
      return (newLog);
   } else
      return null;
}

/**
 * function removes a weblog completely
 * including stories, comments, members
 * @param Object weblog to remove
 */

function deleteWeblog(weblog) {
   var result = new Object();
   weblog.deleteAll();
   this.remove(weblog);
   // add syslog-entry
   this.manage.syslogs.add(new syslog("weblog",weblog.alias,"removed weblog",session.user));
   result.message = "The weblog " + weblog.alias + " was removed successfully!";
   return (result);
}

/**
 *  Search one or more (public) weblogs. Returns an array containing weblog-aliases and
 *  story ids of matching items.
 *
 * @param query The unprocessed query string
 * @param wlogid ID of weblog in which to search, null searches all
 * @return The result array
 */
function searchWeblogs (query, wlogid) {

    // reuse search result container if it already exists
    var result = result = new Array();

    // break up search string
    var unquote = new RegExp("\'");
    unquote.global = true;
    var qarr = query.replace(unquote, "''").split(" ");

    // construct query
    var where = "select TEXT.ID, WEBLOG.ALIAS from TEXT, WEBLOG where "+
                "TEXT.WEBLOG_ID = WEBLOG.ID and "+
                "TEXT.ISONLINE > 0 and WEBLOG.ISONLINE > 0 and ";
    for (var i in qarr) {
        where += "(LOWER(TEXT.TITLE) like '%"+qarr[i].toLowerCase()+
                 "%' or LOWER(TEXT.TEXT) like '%"+qarr[i].toLowerCase()+"%') "
        if (i < qarr.length-1)
            where += "and ";
    }
    // search only in the specified weblgs
    if (wlogid)
        where += "and WEBLOG.ID = "+wlogid+" ";
    where += "order by TEXT.CREATETIME desc";
    writeln (where);
    var dbcon = getDBConnection ("antville");
    var dbres = dbcon.executeRetrieval(where);
    if (dbres) {
       while (dbres.next()) {
          var item = new Object();
          item.sid = dbres.getColumnItem (1).toString();
          item.weblogalias = dbres.getColumnItem (2);
          result[result.length] = item;
       }
    }
    dbres.release();
    return result;
}
