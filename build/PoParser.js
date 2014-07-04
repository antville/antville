// Jala Project [http://opensvn.csie.org/traccgi/jala]
//
// Copyright 2004 ORF Online und Teletext GmbH.
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

/**
 * @fileoverview
 * A parser script that converts GNU Gettext .po files into plain JavaScript objects
 * for use with jala.I18n. To run it either start the build script of HopKit
 * or call it directly using the JavaScript shell of Rhino:
 * <code>java -cp rhino.jar org.mozilla.javascript.tools.shell.Main PoParser.js <input> <output> [namespace]</code>
 *
 * The accepted arguments are:
 * <ul>
 * <li><code>input</code>: Either a single .po file or a directory containing multiple files</li>
 * <li><code>output</code>: The directory where to put the generated message files</li>
 * <li><code>namespace</code>: An optional namespace in which the generated message object will reside
 * (eg. if the namespace is called "jala", the messages will be stored in global.jala.messages)</li>
 * </ul>
 */


/**
 * Constructs a new PoParser instance.
 * @class Instances of this class can generate JavaScript message files out
 * of GNU Gettext .po files for use with jala.I18n (and possibly other internationalization
 * environments too).
 * @param {String} handler An optional namespace where the parsed messages should be stored
 * @returns A newly created instance of PoParser
 * @constructor
 */
var PoParser = function(namespace) {
  /**
   * An array containing the parsed messages
   * @type Array
   */
  this.messages = [];

  /**
   * The locale key string (eg. "de_AT") of the .po file
   * @type String
   */
  this.localeKey = null;

  /**
   * The namespace (optional) where to store the generated messages
   * @type String
   */
  this.namespace = namespace;
  return this;
};

/**
 * A regular expression for splitting the contents of a .po file into
 * single lines
 * @type RegExp
 */
PoParser.REGEX_LINES = /\r\n|\r|\n|\u0085|\u2028|\u2029/;

/**
 * A regular expression for parsing singular message keys
 * @type RegExp
 */
PoParser.REGEX_MSGID = /^\s*msgid(?!_plural)\s+\"(.*)\"\s*$/;

/**
 * A regular expression for parsing plural message keys
 * @type RegExp
 */
PoParser.REGEX_MSGID_PLURAL = /^\s*msgid_plural\s+\"(.*)\"\s*$/;

/**
 * A regular expression for parsing message key continuations
 * @type RegExp
 */
PoParser.REGEX_MSG_CONT = /^\s*\"(.*)\"\s*$/;

/**
 * A regular expression for parsing a message translation
 * @type RegExp
 */
PoParser.REGEX_MSGSTR = /^\s*msgstr(?:\[(\d)\])?\s+\"(.*)\"\s*$/;

/**
 * A regular expression used to detect lines other than whitespace
 * and comments
 * @type RegExp
 */
PoParser.REGEX_DATA = /^\s*msg/;

PoParser.isData = function(str) {
  return PoParser.REGEX_DATA.test(str);
};

/**
 * Reads the file passed as argument, assuming that it is UTF-8 encoded
 * @param {java.io.File} file The file to read
 * @returns The contents of the file
 * @type java.lang.String
 */
PoParser.readFile = function(file) {
  var inStream = new java.io.InputStreamReader(new java.io.FileInputStream(file), "UTF-8");
  var buffer = new java.lang.reflect.Array.newInstance(java.lang.Character.TYPE, 2048);
  var read = 0;
  var r = 0;
  while ((r = inStream.read(buffer, read, buffer.length - read)) > -1) {
    read += r;
    if (read == buffer.length) {
      // grow input buffer
      var newBuffer = new java.lang.reflect.Array.newInstance(java.lang.Character.TYPE, buffer.length * 2);
      java.lang.System.arraycopy(buffer, 0, newBuffer, 0, buffer.length);
      buffer = newBuffer;
    }
  }
  inStream.close();
  return new java.lang.String(buffer, 0, read);
}

/**
 * Parses the PO file passed as argument into the messages array
 * of this PoParser instance.
 * @param {java.io.File} file The .po file to parse
 */
PoParser.prototype.parse = function(file) {
  // parse the locale key out of the file name
  var fileName = file.getName();
  if (!(this.localeKey = fileName.substring(0, fileName.indexOf(".")))) {
    throw "Invalid PO file name: " + fileName;
  }

  // read the PO file content and parse it into messages
  var content = PoParser.readFile(file);
  var start = new Date();
  var lines = content.split(PoParser.REGEX_LINES);
  var idx = -1;
  var line = null;
  var m, value, nr;
  var msg;

  var hasMoreLines = function() {
    return idx < lines.length - 1;
  };

  var nextLine = function() {
    return (line = lines[idx += 1]) != null;
  };

  var getContinuation = function(str) {
    var nLine;
    while ((nLine = lines[idx + 1]) != null) {
      if ((m = nLine.match(PoParser.REGEX_MSG_CONT)) != null) {
        str += m[1];
        nextLine();
      } else {
        break;
      }
    }
    return str;
  }

  while (nextLine()) {
    if ((m = line.match(PoParser.REGEX_MSGID)) != null) {
      value = getContinuation(m[1]);
      if (value) {
        msg = this.messages[this.messages.length] = new Message(value);
      }
    } else if ((m = line.match(PoParser.REGEX_MSGID_PLURAL)) != null) {
      value = getContinuation(m[1]);
      if (value && msg != null) {
        msg.pluralKey = value;
      }
    } else if ((m = line.match(PoParser.REGEX_MSGSTR)) != null) {
      nr = m[1];
      value = getContinuation(m[2]);
      if (value && msg != null) {
        nr = parseInt(nr, 10);
        msg.translations[nr || 0] = value;
      }
    }
  }
  return;
};

/**
 * Converts the array containing the parsed messages into a message
 * catalog script file and saves it on disk.
 * @param {java.io.File} outputDir The directory where the message
 * file should be saved
 */
PoParser.prototype.writeToFile = function(output) {
  var buf = new java.lang.StringBuffer();
  // write header
  buf.append('/**\n');
  buf.append(' * Instantiate the messages namespace if it\'s not already existing\n');
  buf.append(' */\n');
	var objPath = "";
  if (this.namespace) {
    objPath += this.namespace;
    buf.append('if (!global.' + objPath + ') {\n');
    buf.append('  global.' + objPath + ' = {};\n');
    buf.append('}\n');
    objPath += ".";
  }
  objPath += "messages";
  buf.append('if (!global.' + objPath + ') {\n');
  buf.append('  global.' + objPath + ' = {};\n');
  buf.append('}\n\n');

  buf.append('/**\n');
  buf.append(' * Messages for locale "' + this.localeKey + '"\n');
  buf.append(' */\n');
  var fname = objPath + "." + this.localeKey + ".js";
  objPath += "['" + this.localeKey + "']";
  buf.append('global.' + objPath + ' = {\n');
  // write messages
  for (var i=0;i<this.messages.length; i++) {
    this.messages[i].write(buf);
  }
  // write footer
  buf.append('};\n');

  // write the message catalog into the outFile
  var file = new java.io.File(output, fname);
  var writer = new java.io.FileWriter(file);
  writer.write(new java.lang.String(buf.toString().getBytes("UTF-8")));
  writer.close();
  print("generated messages file " + file.getAbsolutePath());
  return;
};

/**
 * Constructs a new message object containing the singular- and
 * plural key plus their translations
 * @param {String} singularKey The singular key of the message
 * @returns A newly created Message instance
 * @constructor
 */
var Message = function(singularKey) {
  this.singularKey = singularKey;
  this.pluralKey = null;
  this.translations = [];
  return this;
}

/**
 * Dumps this message as JavaScript literal key-value pair(s)
 * @param {java.lang.StringBuffer} buf The buffer to append the dumped
 * string to
 */
Message.prototype.write = function(buf) {
  var writeLine = function(key, value) {
    buf.append('  "');
    buf.append(key);
    buf.append('": "');
    if (value !== null && value !== undefined) {
      buf.append(value);
    }
    buf.append('",\n');
  };

  if (this.singularKey != null) {
    writeLine(this.singularKey, this.translations[0]);
    if (this.pluralKey != null) {
      writeLine(this.pluralKey, this.translations[1]);
    }
  }
  return;
}

/**
 * Main script body
 */
if (arguments.length < 2) {
  print("Usage:");
  print("PoParser.js <input> <output> [namespace]");
  print("<input>: Either a single .po file or a directory containing .po files");
  print("<output>: The directory where the generated messages files should be stored");
  print("[namespace]: An optional global namespace where the messages should be");
  print("         stored (eg. a namespace like 'jala' will lead to messages");
  print("         stored in global.jala.messages by their locale.");
  quit();
}

var input = new java.io.File(arguments[0]);
var output = new java.io.File(arguments[1]);
var namespace = arguments[2];

// check if the output destination is a directory
if (output.isFile()) {
  print("Invalid arguments: the output destination must be a directory.");
  quit();
}

if (namespace && namespace.indexOf(".") != -1) {
  print("Invalid arguments: Please don't specify complex object paths, as this");
  print("would corrupt the messages file.");
  quit();
}

// parse the PO file(s) and create the message catalog files
var parser;
if (input.isDirectory()) {
  var files = input.listFiles();
  var file;
  for (var i=0;i<files.length;i++) {
    file = files[i];
    if (file.getName().endsWith(".po")) {
      parser = new PoParser(namespace);
      parser.parse(file);
      parser.writeToFile(output);
    }
  }
} else {
  parser = new PoParser(namespace);
  parser.parse(input);
  parser.writeToFile(output);
}
