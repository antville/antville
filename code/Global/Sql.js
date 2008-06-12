//
// The Antville Project
// http://code.google.com/p/antville
//
// Copyright 2001-2007 by The Antville People
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
//

var Sql = function() {
   var db = getDBConnection("antville");
   var query;

   var SqlData = function(result) {
      var columns = [];
      this.values = {};
      
      for (var i=1; i<=result.getColumnCount(); i+=1) {
         columns.push(result.getColumnName(i));
      }
   
      this.update = function() {
         for each (var key in columns) {
            this.values[key] = result.getColumnItem(key);
         }
         return;
      }
      
      return this;
   }

   var quote = function(str) {
      if (str === null) {
         return str;
      }
      return "'" + str.replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "'";
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
   
   this.execute = function(sql) {
      sql = resolve(arguments);
      var error;
      var result = db.executeCommand(sql);
      if (error = db.getLastError()) {
         app.log(error);
      }
      return result;
   }
   
   this.retrieve = function() {
      return query = resolve(arguments);
   }
   
   this.traverse = function(callback) {
      var rows = db.executeRetrieval(query);
      if (rows && rows.next()) {
         do {
            var sql = new SqlData(rows);
            sql.update();
            callback.call(sql.values, rows);
         } while (record = rows.next());
         rows.release();
      }
      return;
   }
   
   this.toString = function() {
      return query;
   }
   
   return this;
}
