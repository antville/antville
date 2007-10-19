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

var db = getDBConnection("antville");
var query, result;

var ResultWrapper = function(result) {
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

var log = function(str) {
   var now = "[" + new Date + "] ";
   app.data.out || (app.data.out = new java.lang.StringBuffer());
   app.data.out.insert(0, now + encodeForm(str) + "\n");
   return;
}

var debug = function(str) {
   if (app.properties.debug === "true") {
      log(str);
   }
   return;
}

var quote = function(str) {
   return "'" + str.replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "'";
}

var sql = function(type) {
   var param = {};
   for (var i=1; i<arguments.length; i+=1) {
      param["value" + i] = arguments[i];
   } 
   return renderSkinAsString("sql#" + type, param).replace(/\n|\r/g, " ");   
}

var update = function(tableName) {
   log("Updating table " + tableName);
   var sql = renderSkinAsString("sql#" + tableName);
   sql.split(/\n|\r|\n\r/).forEach(function(line) {
      if (!line) {
         return;
      } else if (line.indexOf("#!") === 0) {
         convert(line.substr(2));
      } else {
         execute(line);
      }
      return;
   });
   return;
}

var id = function() {
   app.data.id || (app.data.id = 0);
   return (app.data.id += 1);
};

var error = function() {
   var error = db.getLastError()
   if (error) {
      log(error);
      res.abort();
   }
   return;
};

var count = function(sql) {
   var count = 0;
   sql = "select count(*) from " + sql;
   debug(sql);
   result = db.executeRetrieval(sql);
   if (result.next()) {
      count = result.getColumnItem("count(*)");
   }
   result.release();
   return count;
}
   
var execute = function(sql) {
   debug(sql);
   db.executeCommand(sql);
   error();
   return;
}

var retrieve = function(sql) {
   debug(sql);
   query = sql;
   return;
}

var traverse = function(callback) {
   if (!query || !callback) {
      return;
   }
   var STEP = 10000;
   var rows, offset = 0;      
   while (true) {
      result = db.executeRetrieval(query + 
            " limit " + STEP + " offset " + offset);
      error();
      // FIXME: The hasMoreRows() method does not work as expected
      rows = result.next();
      if (!rows) {
         break;
      }
      do {
         var wrapper = new ResultWrapper(result);
         wrapper.update(result);
         callback.call(wrapper.values, result);
      } while (rows = result.next());
      offset += STEP;
   }
   result.release();
   return;
}
