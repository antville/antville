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

var print = function(str) {
   app.data.out || (app.data.out = new java.lang.StringBuffer());
   app.data.out.append(str);
   return;
}

var println = function(str) {
   return print(str + "\n"); 
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
      println(error);
      res.abort();
   }
   return;
};

var count = function(sql) {
   var count = 0;
   sql = "select count(*) from " + sql;
   println(sql);
   result = db.executeRetrieval(sql);
   if (result.next()) {
      count = result.getColumnItem("count(*)");
   }
   result.release();
   return count;
}
   
var execute = function(sql) {
   println(sql);
   db.executeCommand(sql);
   error();
   return;
}

var retrieve = function(sql) {
   query = sql;
   println(query);
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
