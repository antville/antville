// The Antville Project
// http://code.google.com/p/antville
//
// Copyright 2001–2014 by the Workers of Antville.
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

Layout.prototype.convert_action = function() {
  if (req.isPost() && req.data.save && req.data.file) {
    var mime = req.data.file;
    var name = mime.normalizeFilename(mime.name);
    var prefix = "antville.layout.import.";
    var dir = java.io.File.createTempFile(prefix, "");
    dir["delete"]();
    dir.mkdir();
    var file = java.io.File.createTempFile(prefix, ".zip");
    mime.writeToFile(file.getParent(), file.getName());
    var zip = new helma.Zip(file);
    zip.extractAll(dir);
    Layout.convert(dir);
    zip = new helma.Zip;
    zip.add(dir);
    zip.close();
    //zip.save(java.io.File.createTempFile(prefix, ".converted.zip"));
    res.contentType = "application/zip";
    res.setHeader("Content-Disposition",
        "attachment; filename=" + name.replace(/(\..*)$/, ".converted$1"));
    res.writeBinary(zip.getData());
    return;
  }

  res.data.title = gettext("Convert Layout");
  res.data.body = this.renderSkinAsString("$Layout#convert");
  this.site.renderSkin("Site#page");
  return;
}

Layout.convert = function(fpath) {
  function runProcess(cmd, dir) {
    var runtime = java.lang.Runtime.getRuntime();
    var proc = runtime.exec(cmd, null, new java.io.File(dir.toString()));
    proc.waitFor();
    var result = new Object();
    result.error = proc.exitValue();
    return result;
  }

  // Code copied from global convert.js file in updater app
  // ******************************************************
  var styles = {
    "bgcolor": "background color",
    "linkcolor": "link color",
    "alinkcolor": "active link color",
    "vlinkcolor": "visited link color",
    "titlefont": "big font",
    "titlesize": "big font size",
    "titlecolor": "big font color",
    "textfont": "base font",
    "textsize": "base font size",
    "textcolor": "base font color",
    "smallfont": "small font",
    "smallsize": "small font size",
    "smallcolor": "small font color"
  }

  var values = function(metadata) {
    if (!metadata) {
      return;
    }

    var data = eval(metadata);
    res.push();
    for (var key in styles) {
      var name = styles[key];
      var value = String(data[key]).toLowerCase();
      if (key.endsWith("color") && !helma.Color.COLORNAMES[key] &&
          !value.startsWith("#")) {
        value = "#" + value;
      }
      value = value.replace(/([0-9]+) +px/, "$1px");
      res.writeln('<% value "' + name + '" "' + value + '" %>');
    }
    return res.pop();
  }

  var quote = function(str) {
    if (str === null) {
      return str;
    }
    return "'" + str.replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "'";
  }

  var clean = function(source) {
    if (source) {
      // Renaming prototype and skin names in skin macros
      var re = /(<%\s*)([^.]+)(\.skin\s+name="?)([^"\s]+)/g;
      source = source.replace(re, function() {
        var $ = arguments;
        var skin = rename($[2].capitalize(), $[4]);
        if (skin) {
          // THIS LINE DIFFERS FROM THE UPDATER APP!
          return $[1] + skin.prototype.toLowerCase() + $[3] +
              skin.prototype + "#" + skin.name;
        }
        return $[0];
      });
      // Replacing layout.* macros with corresponding value macros
      source = source.replace(/(<%\s*)layout\.([^\s]+)/g, function() {
        var value = styles[arguments[2]];
        if (value) {
          return arguments[1] + "value " + quote(value);
        }
        return arguments[0];
      });
      return source;
    }
  }
  // ***********************************
  // End of code copied from updater app

  var rename = function(proto, name) {
    var allowed = ["Comment", "Day", "File", "Global", "Image",
        "MemberMgr", "Membership", "Site", "Story", "Topic"];
    if (allowed.indexOf(proto) < 0) {
      return;
    }

    switch (proto) {
      case "Comment":
      name === "toplevel" && (name = "main");
      break;

      case "Day":
      proto = "Archive";
      break;

      case "MemberMgr":
      case "Membership":
      if (name === "statusloggedin") {
        name = "status";
      } else if (name === "statusloggedout") {
        name = "login";
      } else if (proto === "MemberMgr") {
        // FIXME: This return causes errors on Ubuntu?!?
        //return;
      }
      break;

      case "Site":
      if (name === "searchbox") {
        name = "search";
      } else if (name === "style") {
        name = "stylesheet";
      }
      break;

      case "Story":
      if (name === "dayheader") {
        name = "date";
      } else if (name === "display") {
        name = "content";
      } else if (name === "historyview") {
        name = "history";
      }
      break;

      case "Topic":
      proto = "Tag";
      break;
    }
    (proto === "MemberMgr") && (proto = "Membership");
    return {
      prototype: proto,
      name: name
    };
  }

  var convert2subskins = function(proto, dir) {
    res.push();
    for each (var fname in dir.list()) {
      var file = new helma.File(dir, fname);
      var name = fname.split(".")[0], skin;
      if (skin = rename(proto, name)) {
        res.writeln("<% #" + skin.name + " %>");
        var source = clean(file.readAll());
        if (skin.prototype === "Site" && skin.name === "stylesheet") {
          source = source.replace(/(\.calHead)/g,
              "table.calendar thead, $1");
          source = source.replace(/(\.calDay)/g,
              "table.calendar th, table.calendar tbody td.day, $1");
          source = source.replace(/(\.calSelDay)/g,
              "table.calendar tbody td.selected, $1");
          source = source.replace(/(\.calFoot)/g,
              "table.calendar tfoot td, $1");
        }
        res.writeln(source);
      }
    }
    var str = res.pop();
    if (!str) {
      return;
    }
    var target = new java.io.File(fpath, skin.prototype);
    target.mkdirs();
    target = new helma.File(target, skin.prototype + ".skin");
    target.open({append: true});
    target.write(str);
    target.close();
  }

  var convertImage = function(image) {
    var result = new HopObject;
    result.name = image.alias;
    result.width = image.width;
    result.height = image.height;
    result.created = image.exporttime;
    result.modified = image.exporttime;
    result.description = image.alltext;
    result.fileName = image.alias + "." + image.fileext,
    result.contentType = "image/" + image.fileext;
    result.contentLength = inventory[result.fileName].getLength();
    if (image.thumbnail) {
      result.thumbnailName = image.thumbnail.filename + "." + image.fileext;
      result.thumbnailWidth = image.thumbnail.width;
      result.thumbnailHeight = image.thumbnail.height;
    }
    return result;
  }

  var dir = new helma.File(fpath, "images");
  for each (var fname in dir.list()) {
    var file = new helma.File(dir, fname);
    file.move(new helma.File(fpath, fname));
  }

  var inventory = new function() {
    var dir = new helma.File(fpath);
    var result = {};
    for each (var fname in dir.list()) {
      var file = new helma.File(dir, fname);
      if (!file.isDirectory()) {
        // Where does the "image\" prefix come from in files from layouts.antville.org?
        var parts = fname.split("\\");
        var name = parts[parts.length-1];
        if (name !== fname) {
          res.debug(file);
          res.debug(new helma.File(fpath, name))
          file.renameTo(new helma.File(fpath, name));
        }
        result[name] = file;
      }
    }
    return result;
  }

  var xml = Xml.read(new helma.File(fpath, "preferences.xml"));
  var file = new helma.File(fpath, "Site");
  file.makeDirectory();
  file = new helma.File(file, "Site.skin");
  file.open();
  res.push();
  res.writeln("<% #values %>");
  res.write(values(xml.preferences));
  file.write(res.pop());
  file.close();

  dir = new helma.File(fpath, "skins");

  var skin;
  for each (var fname in dir.list()) {
    file = new helma.File(dir, fname);
    skin = convert2subskins(fname, file);
  }

  var data = new HopObject;
  data.images = new HopObject;

  var dir = new helma.File(fpath, "imagedata");
  for each (fname in dir.list()) {
    if (fname.endsWith(".xml")) {
      file = new helma.File(dir, fname);
      data.images.add(convertImage(Xml.read(file)));
    }
  }

  data.version = "1.2-compatible";
  data.origin = "Antville 1.2 Layout Converter";
  data.originated = new Date;
  data.originator = session.user;
  Xml.write(data, new helma.File(fpath, "data.xml"));

  (new helma.File(fpath, "preferences.xml")).remove();
  (new helma.File(fpath, "imagedata")).removeDirectory();
  (new helma.File(fpath, "skins")).removeDirectory();
  return;
}
