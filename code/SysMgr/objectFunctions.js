/**
 * function manipulates the weblogs-collection
 */

function searchWeblogs(show,sort,order,keywords) {
   // construct the sql-clause for manual subnodeRelation
   var sql = "";
   if (!show || show == "1")
      sql += "WHERE ISONLINE=1 AND ISBLOCKED=0 ";
   else if (show == "2")
      sql += "WHERE ISONLINE=0 AND ISBLOCKED=0 ";
   else if (show == "3")
      sql += "WHERE ISBLOCKED=1 ";
   else if (show == "4")
      sql += "WHERE ISTRUSTED=1 ";
   if (keywords) {
      // additional keywords are given, so we're using them
      var kArray = keywords.split(" ");
      for (var i in kArray) {
         var k = kArray[i];
         sql += sql.length > 0 ? "AND " : "WHERE ";
         sql += "(ALIAS LIKE '%" + k + "%' OR TITLE LIKE '%" + k + "%' OR TAGLINE LIKE '%" + k + "%') ";
      }
   }
   if (!sort || sort == "0")
      sql += "ORDER BY LASTUPDATE ";
   else if (sort == "1")
      sql += "ORDER BY CREATETIME ";
   else if (sort == "2")
      sql += "ORDER BY ALIAS ";
   else if (sort == "3")
      sql += "ORDER BY TITLE ";
   if (!order || order == "0")
      sql += "desc ";
   else if (order == "1")
      sql += "asc ";

   // now do the actual search with a manual subnodeRelation
   this.weblogs.subnodeRelation = sql;
   return;
}

/**
 * function manipulates the users-collection
 */

function searchUsers(show,sort,order,keywords) {
   // construct the sql-clause for manual subnodeRelation
   var sql = "";
   if (show == "1")
      sql += "WHERE ISBLOCKED=1 ";
   else if (show == "2")
      sql += "WHERE ISTRUSTED=1 ";
   else if (show == "3")
      sql += "WHERE ISSYSADMIN=1 ";
   if (keywords) {
      // additional keywords are given, so we're using them
      if (keywords.charAt(0) == "@") {
         // searching for email-addresses
         sql += sql.length > 0 ? "AND " : "WHERE ";
         sql += "EMAIL LIKE '%" + keywords + "%' ";
      } else {
         // doing normal keyword-search
         var kArray = keywords.split(" ");
         for (var i in kArray) {
            var k = kArray[i];
            sql += sql.length > 0 ? "AND " : "WHERE ";
            sql += "USERNAME LIKE '%" + k + "%' ";
         }
      }
   }
   if (!sort || sort == "0")
      sql += "ORDER BY LASTVISIT ";
   else if (sort == "1")
      sql += "ORDER BY REGISTERED ";
   else if (sort == "2")
      sql += "ORDER BY USERNAME ";
   if (!order || order == "0")
      sql += "desc ";
   else if (order == "1")
      sql += "asc ";

   // now do the actual search with a manual subnodeRelation
   this.users.subnodeRelation = sql;
   return;
}

/**
 * function manipulates the weblogs-collection
 */

function searchSyslog(show,order,keywords) {
   // construct the sql-clause for manual subnodeRelation
   var sql = "";
   if (!show || show == "1")
      sql += "WHERE TYPE = 'weblog' ";
   else if (show == "2")
      sql += "WHERE TYPE = 'user' ";
   else if (show == "3")
      sql += "WHERE TYPE = 'system' ";
   if (keywords) {
      // additional keywords are given, so we're using them
      var kArray = keywords.split(" ");
      for (var i in kArray) {
         var k = kArray[i];
         sql += sql.length > 0 ? "AND " : "WHERE ";
         sql += "(OBJECT LIKE '%" + k + "%' OR LOGENTRY LIKE '%" + k + "%') ";
      }
   }
   if (!order || order == "0")
      sql += "ORDER BY CREATETIME desc, ID desc ";
   else if (order == "1")
      sql += "ORDER BY CREATETIME asc, ID asc ";

   // now do the actual search with a manual subnodeRelation
   this.syslogs.subnodeRelation = sql;
   return;
}

/**
 * function stores updated weblog-preferences
 */

function updateWeblog(param,admin) {
   var result = new Object();
   var weblog = this.weblogs.get(param.item);
   if (!weblog) {
      result.message = "Please choose a weblog to edit!";
      result.error = true;
   } else {
      var trust = parseInt(param.trusted,10);
      var block = parseInt(param.blocked,10);
      if (trust > weblog.trusted)
         this.syslogs.add(new syslog("weblog",weblog.alias,"granted trust",admin));
      else if (trust < weblog.trusted)
         this.syslogs.add(new syslog("weblog",weblog.alias,"revoked trust",admin));
      if (block > weblog.blocked)
         this.syslogs.add(new syslog("weblog",weblog.alias,"blocked weblog",admin));
      else if (block < weblog.blocked)
         this.syslogs.add(new syslog("weblog",weblog.alias,"unblocked weblog",admin));
      weblog.trusted = trust;
      weblog.blocked = block;
      result.message = "Changes to " + weblog.alias + " where saved successfully!";
   }
   return (result);
}

/**
 * function stores updated user
 */

function updateUser(param,admin) {
   var result = new Object();
   var u = this.users.get(param.item);
   if (!u) {
      result.message = "Please choose a user to edit!";
      result.error = true;
   } else if (u == admin) {
      result.message = "You can't modify your own account!";
      result.error = true;
   } else {
      result.message = "Changes to " + u.name + " where saved successfully!";
      // check if this is an attempt to remove the last sysadmin
      var sysadmin = parseInt(param.sysadmin,10);
      var trust = parseInt(param.trusted,10);
      var block = parseInt(param.blocked,10);
      if (this.sysadmins.size() == 1 && !sysadmin)
         result.message = "This system needs at least one system administrator!";
      else {
         //logging
         if (sysadmin > u.sysadmin)
            this.syslogs.add(new syslog("user",u.name,"granted sysadmin-rights",admin));
         else if (sysadmin < u.sysadmin)
            this.syslogs.add(new syslog("user",u.name,"revoked sysadmin-rights",admin));
         u.sysadmin = parseInt(param.sysadmin,10);
      }
      if (trust > u.trusted)
         this.syslogs.add(new syslog("user",u.name,"granted trust",admin));
      else if (trust < u.trusted)
         this.syslogs.add(new syslog("user",u.name,"revoked trust",admin));
      if (block > u.blocked)
         this.syslogs.add(new syslog("user",u.name,"blocked user",admin));
      else if (block < u.blocked)
         this.syslogs.add(new syslog("user",u.name,"unblocked user",admin));
      u.trusted = trust;
      u.blocked = block;
   }
   return (result);
}
