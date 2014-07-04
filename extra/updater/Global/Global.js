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
//   http://www.apache.org/licenses/LICENSE-2.0
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

app.data.out = new java.lang.StringBuffer();
app.data.status = "idle";

var server = Packages.helma.main.Server.getServer();

var status = function(type) {
  if (type) {
    app.data.status = type;
    return;
  } else {
    return app.data.status;
  }
}

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
  if (status() === "running") {
    msg("Updater is already running");
    return false;
  } else if (getProperty("version.to") == currentVersion) {
    msg("Antville installation is already up-to-date");
    status("finished");
    return false;
  } else if (getProperty("version.from") != currentVersion) {
    msg("Updater cannot upgrade version " + currentVersion);
    status("failed")
    return false;
  } else {
    status("running");
  }
  return true;
}

var finalize = function() {
  var rootSite = antville().__app__.getDataRoot();
  var metadata = eval(rootSite.metadata_source);
  metadata.version = getProperty("version.to");
  rootSite.metadata_source = metadata.toSource();
  status("finished");
  return;
}

var out = function() {
  var str;
  if (app.data.out.length() > 0) {
    str = app.data.out.toString();
    app.data.out.setLength(0);
  }
  res.write({
    status: status(),
    log: str
  }.toSource());
  return;
}

var log = function(str) {
  app.log(str);
  return;
}

var msg = function(str1 /* , str2, str2, ... */) {
  var str = "";
  for (var i=0; i<arguments.length; i+=1) {
    str += String(arguments[i]) + " ";
  }
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
    status("failed");
    res.abort();
  }
  return;
}

var quote = function(str) {
  if (str === null) {
    return str;
  }
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
}

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

var stringf = function(str /*, value1, ..., valueN */) {
  var values = Array.prototype.slice.call(arguments, 1);
  if (values.length > 0) {
    var callback;
    if (typeof values[values.length - 1] === "function") {
      callback = values.pop();
    }
    if (typeof values[0] === "object") {
      values = values[0];
    }
    str = str.replace(/\$(\w*)/g, function(str, key) {
      return callback ? callback(values[key]) : values[key];
    });
  }
  return str;
}

var retrieve = function(sql /*, value1, ..., valueN */) {
  // Add callback for global value() method to stringf() arguments
  Array.prototype.push.call(arguments, value);
  app.data.query = stringf.apply(null, arguments);
  return;
}

var traverse = function(callback, noOffset, idName) {
  if (!app.data.query || !callback) {
    return;
  }
  var STEP = 5000, start = Date.now();
  var sql, rows, offset = 0;
  while (true) {
    start = Date.now();
    if (noOffset) {
      sql = app.data.query.replace(/\$min/, offset);
      sql = sql.replace(/\$max/, offset += noOffset);
      msg(sql);
    } else {
      sql = app.data.query + " limit " + STEP;
      sql += " offset " + offset;
      offset += STEP;
      msg(sql);
    }
    result = db().executeRetrieval(sql);
    error();
    msg("Select statement took " + (Date.now() - start) + " millis");
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
    result.release();
    msg("Update took " + (Date.now() - start) + " millis");
  }
  return;
}

var execute = function(sql /*, value1, ..., valueN */) {
  // Add callback for global value() method to stringf() arguments
  Array.prototype.push.call(arguments, value);
  sql = stringf.apply(null, arguments);
  log(sql.contains("\n") ? sql.substr(0, sql.indexOf("\n")) + " ..." : sql);
  try {
    db().executeCommand(sql);
    error();
  } catch (ex) {
    error(ex);
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
