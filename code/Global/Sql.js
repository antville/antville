// The Antville Project
// http://code.google.com/p/antville
//
// Copyright 2007-2011 by Tobi Schäfer.
//
// Copyright 2001–2007 Robert Gaggl, Hannes Wallnöfer, Tobi Schäfer,
// Matthias & Michael Platzer, Christoph Lincke.
//
// Licensed under the Apache License, Version 2.0 (the ``License'');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an ``AS IS'' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// $Revision$
// $LastChangedBy$
// $LastChangedDate$
// $URL$

/**
 * @fileOverview Defines the Sql prototype, a utility for relational queries
 */

/**
 * @constructor
 */
var Sql = function(options) {
   options || (options = {});
   var db = getDBConnection("antville");
   var query;

   var log = new function() {
      var fname = getProperty("sqlLog", "helma." + app.getName() + ".sql");
      return Packages.org.apache.commons.logging.LogFactory.getLog(fname);
   }

   var SqlData = function(result) {
      var columns = [];
      this.values = {};
      
      for (var i=1; i<=result.getColumnCount(); i+=1) {
         columns.push(result.getColumnName(i).toLowerCase());
      }
   
      this.next = function() {
         for each (var key in columns) {
            this.values[key] = result.getColumnItem(key);
         }
         return;
      }
      
      return this;
   }

   var quote = function(str) {
      if (!options.quote || str === null) {
         return str;
      }
      return str.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
   }

   var value = function(obj) {
      if (obj === null) {
         return obj;
      }
      if (obj === undefined) {
         obj = String(obj);
      }
      switch (obj.constructor) {
         case Number:
         return obj;
         case String:
         return quote(obj);
         case Date:
         return "from_unixtime(" + (obj.getTime() / 1000) + ")";
         case HopObject:
         case Object:
         return quote(obj.toSource());
      }
      return quote(String(obj));
   }

   var resolve = function(args) {
      var sql = args[0];
      if (args.length > 1) {
         var values = Array.prototype.splice.call(args, 1);
         if (typeof values[0] === "object") {
            values = values[0];
         }
         sql = sql.replace(/\$(\w*)/g, function() {
            return value(values[arguments[1]]);
         });
      }
      return sql;
   }
   
   /**
    * 
    * @param {String} sql
    * @returns {Object}
    */
   this.execute = function(sql) {
      sql = resolve(arguments);
      log.info(sql);
      if (options.test) {
         return app.log(sql);
      }
      var error;
      var result = db.executeCommand(sql);
      if (error = db.getLastError()) {
         app.log(error);
      }
      return result;
   }
   
   /**
    * @returns {String}
    */
   this.retrieve = function() {
      return log.info(query = resolve(arguments));
   }
   
   /**
    * 
    * @param {Function} callback
    */
   this.traverse = function(callback) {
      var rows = db.executeRetrieval(query);
      if (rows && rows.next()) {
         do {
            var sql = new SqlData(rows);
            sql.next();
            if (!options.test) {
               callback.call(sql.values, rows);
            }
         } while (record = rows.next());
         rows.release();
      }
      return;
   }
   
   /**
    * @return {String}
    */
   this.toString = function() {
      return query;
   }
   
   return this;
}

/** @constant */
Sql.COUNT = "select count(*) as count from $0";

/** @constant */
Sql.REFERRERS = "select referrer, count(*) as requests from " +
      "log where context_type = '$0' and context_id = $1 and action = " +
      "'main' and created > now() - interval '2 days' group " +
      "by referrer order by requests desc, referrer asc"; 

/** @constant */
Sql.PURGEREFERRERS = "delete from log where action = 'main' and " +
      "created < now() - interval '2 days'";

/** @constant */
Sql.SEARCH = "select content.id from content, site, metadata where site.id = $0 and " +
      "site.id = content.site_id and content.status in ('public', 'shared', 'open') and " +
      "content.id = metadata.parent_id and metadata.name in ('title', 'text') and " +
      "lower(metadata.value) like lower('%$1%') group by content.id, content.created " +
      "order by content.created desc limit $2";

/** @constant */
Sql.MEMBERSEARCH = "select name from account where name $0 '$1' " +
      "order by name asc limit $2";

/** @constant */
Sql.ARCHIVE = "select id from content where site_id = $0 and prototype = 'Story' and " +
      "status in ('public', 'shared', 'open') $1 $2 limit $3 offset $4";

/** @constant */
Sql.ARCHIVESIZE = "select count(*) as count from content where site_id = $0 " +
      "and prototype = 'Story' and status in ('public', 'shared', 'open') $1";

/** @constant */
Sql.ARCHIVEPART = " and extract($0 from created) = $1";

/** @constant */
Sql.ARCHIVEORDER = "order by created desc";
