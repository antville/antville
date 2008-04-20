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
// $Revision:3427 $
// $LastChangedBy:piefke3000 $
// $LastChangedDate:2008-04-12 19:31:20 +0200 (Sat, 12 Apr 2008) $
// $URL:https://antville.googlecode.com/svn/trunk/updater/Global/Global.js $
//

app.data.out = new java.lang.StringBuffer();
app.data.status = "idle";

var server = Packages.helma.main.Server.getServer();

var antville = function() {
   return new Packages.helma.framework.core.ApplicationBean(server.
         getApplication("antville"));
}

var db = function() {
   app.data.db || (app.data.db = new Packages.helma.scripting.rhino.extensions.
         DatabaseObject(antville().getDbSource("antville")));
   return app.data.db;
}

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

var version = function() {
   try {
      var rootSite = antville().__app__.getDataRoot();
      var metadata = eval(rootSite.metadata_source);
      return metadata.version || "";
   } catch (ex) {
      return "";
   }
}

var init = function() {
   var currentVersion = version();
   if (app.data.status === "running") {
      msg("Updater is already running");
      return false;
   } else if (getProperty("version.to") == currentVersion) {
      msg("Antville installation is already up-to-date");
      app.data.status = "finished";
      return false;
   } else if (getProperty("version.from") != currentVersion) {
      msg("Updater cannot upgrade version " + currentVersion);
      app.data.status = "failed";
      return false;
   } else {
      app.data.status = "running";
   }
  return true; 
}

var finalize = function() {
   var rootSite = antville().__app__.getDataRoot();
   var metadata = eval(rootSite.metadata_source);
   metadata.version = getProperty("version.to");
   rootSite.metadata_source = metadata.toSource();
   app.data.status = "finished";
   return;
}

var out = function() {
   var str;
   if (app.data.out.length() > 0) {
      str = app.data.out.toString();
      app.data.out.setLength(0);
   }
   res.write({
      status: app.data.status,
      log: str
   }.toSource());
   return;
}

var log = function(str) {
   app.log(str);
   return;
}

var msg = function(str) {
   if (str !== undefined) {
      var now = "[" + new Date + "] ";
      //app.data.out.insert(0, now + encodeForm(str) + "\n");
      app.data.out.append(now + encodeForm(str) + "\n");
      log(str);
   }
   return;
}

var error = function(exception) {
   var error = exception || db().getLastError();
   if (error) {
      msg(error);
      app.data.status = "failed";
      res.abort();
   }
   return;
};

var quote = function(str) {
   return "'" + str.replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "'";
}

var query = function(type) {
   var param = {};
   for (var i=1; i<arguments.length; i+=1) {
      param["value" + i] = arguments[i];
   } 
   return renderSkinAsString("convert#" + type, param).replace(/\n|\r/g, " ");   
}

var clean = function(str) {
   if (!str) {
      return;
   }
   return str.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, "");
}

var update = function(tableName) {
   msg("Updating table " + tableName);
   var sql = renderSkinAsString("convert#" + tableName);
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

   var parts = sql.split("#!");
   execute(parts[0]);
   if (parts[1]) {
      var index = parts[1].indexOf("\n");
      convert(parts[1].substr(0, index));
      execute(parts[1].substr(index));
   }
   return;
   
}

var id = function() {
   app.data.id || (app.data.id = 0);
   return (app.data.id += 1);
};

var count = function(sql) {
   var count = 0;
   sql = "select count(*) from " + sql;
   log(sql);
   result = db().executeRetrieval(sql);
   if (result.next()) {
      count = result.getColumnItem("count(*)");
      msg("Converting " + count + " records");
   }
   result.release();
   return count;
}

var execute = function(sql) {
   log(sql.contains("\n") ? sql.substr(0, sql.indexOf("\n")) + " ..." : sql);
   try {
      db().executeCommand(sql);
      error();
   } catch (ex) {
      error(ex);
   }
   return;
}

var retrieve = function(sql) {
   app.data.query = sql;
   return;
}

var traverse = function(callback) {
   if (!app.data.query || !callback) {
      return;
   }
   var STEP = 5000;
   var sql, rows, offset = 0;      
   while (true) {
      sql = app.data.query + " limit " + STEP + " offset " + offset;
      result = db().executeRetrieval(sql);
      error();
      msg(sql);
      // FIXME: The hasMoreRows() method does not work as expected
      rows = result.next();
      if (!rows) {
         result.release();
         break;
      }
      do {
         var wrapper = new ResultWrapper(result);
         wrapper.update(result);
         callback.call(wrapper.values, result);
      } while (rows = result.next());
      offset += STEP;
      result.release();
   }
   return;
}

var archive = function() {
   var staticDir = new helma.File(app.dir + "/../static");
   for each (var siteName in staticDir.list()) {
      var site = siteName !== "www" ? root.get(siteName) : root;
      if (!site) {
         continue;
      }
      var dir = new helma.File(staticDir, siteName + "/layouts");
      for each (var layoutName in dir.list()) {
         if (layoutName.startsWith(".")) {
            continue;
         }
         var layout = new Layout(site);
         for each (var image in dir.listRecursive(/\.(jpg|gif|png)$/)) {
            var name = image.split("/").pop().split(".")[0];
            retrieve(query("archive", name, layoutName, siteName));
            traverse(function() {
               var img = new Image(this);
               log(img);
            });
         }
      }
   }
}
