//
// Jala Project [http://opensvn.csie.org/traccgi/jala]
//
// Copyright 2004 ORF Online und Teletext GmbH
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
// $HeadURL$
//


/**
 * @fileoverview 
 * MessageParser script that extracts all gettext message macros
 * out of skin files and all calls of gettext functions
 * (that is "gettext", "ngettext" and "_") out of function
 * files and directly generates a .pot file from it.
 * If an argument "-o" is given and it is followed by
 * a path to a file, the output is written to this file.
 * Any other argument is interpreted as directory or file
 * that should be parsed.
 */


/**
 * @constructor
 */
var Message = function(id, pluralId) {
   this.id = id && String(id);
   this.pluralId = pluralId && String(pluralId);
   this.locations = [];
   return this;
};

/**
 * Static method that constructs a message key by
 * which a message can be identified in the messages map.
 * @param {String} id The message Id
 * @param {String} pluralId The plural message Id
 * @returns The generated message key
 * @type String
 */
Message.getKey = function(id, pluralId) {
   if (id && pluralId) {
      return id + pluralId;
   } else {
      return id;
   }
};

/**
 * Encloses the string passed as argument in quotes
 * and wraps the string if it is longer than 80 characters.
 * @param {String} str The string to format
 * @param {Boolean} wrap If true the message string will be splitted in
 * parts where each one is max. 80 characters long
 * @returns The formatted string.
 * @type String
 */
Message.formatId = function(str, wrap) {
   var escapeQuotes = function(s) {
      return s.replace(/(^|[^\\])"/g, '$1\\"');
   };

   var len = 80;
   var buf = new java.lang.StringBuffer();
   if (wrap == true && str.length > len) {
      buf.append('""\n');
      var offset = 0;
      while (offset < str.length) {
         buf.append('"');
         buf.append(escapeQuotes(str.substring(offset, offset += len)));
         buf.append('"');
         buf.append("\n");
      }
      return buf.toString();
   } else {
      buf.append('"');
      buf.append(escapeQuotes(str));
      buf.append('"\n');
   }
   return buf.toString();
};

/**
 * Adds a new location to this Message instance.
 * @param {String} filePath The path to the file this message
 * is located in.
 * @param {Number} lineNum The line number at which this message
 * was found at
 */
Message.prototype.addLocation = function(filePath, lineNum) {
   this.locations.push(filePath + ":" + lineNum);
};

/**
 * Writes this Message instance as .po compatible string to
 * the StringBuffer passed as argument.
 * @param {java.lang.StringBuffer} buf The StringBuffer instance
 * to write into
 */
Message.prototype.write = function(buf) {
   for (var i=0;i<this.locations.length;i++) {
      buf.append("#: ");
      buf.append(this.locations[i]);
      buf.append("\n");
   }
   if (this.id.indexOf("{") > -1
       || (this.pluralId != null && this.pluralId.indexOf("{") > -1)) {
      buf.append("#, java-format\n");
   }
   buf.append('msgid ');
   buf.append(Message.formatId(this.id));
   if (this.pluralId != null) {
      buf.append('msgid_plural ');
      buf.append(Message.formatId(this.pluralId));
      buf.append('msgstr[0] ""\nmsgstr[1] ""\n')
   } else {
      buf.append('msgstr ""\n')
   }
   buf.append("\n");
   return;
};

/**
 * @constructor
 */
var MessageParser = function() {
   this.messages = {};
   return this;
};

/**
 * Object containing the accepted function names, currently
 * supported are "gettext", "ngettext" and "_". This is used
 * as a lookup map during function file parsing.
 * @type Object
 */
MessageParser.FUNCTION_NAMES = {
   "_": true,
   "gettext": true,
   "ngettext": true,
   "markgettext": true,
   "cgettext": true
};

/**
 * The name of the gettext macro
 * @type String
 */
MessageParser.MACRO_NAME = "message";

/**
 * The name of the macro attribute that will be interpreted
 * as gettext attribute.
 * @type String
 */
MessageParser.ATTRIBUTE_NAME = MessageParser.MACRO_NAME;

/**
 * A regular expression for parsing macros in a skin. The result
 * of this regular expression contains:
 * result[1] = macro handler name (can be empty for global macros)
 * result[2] = macro name
 * result[3] = the macro's attributes
 * @type RegExp
 */
MessageParser.REGEX_MACRO = /<%\s*(?:([\w]+)\.)?([\w]+)\s+([^%]+?)\s*%>/gm;

/**
 * A regular expression for parsing the attributes of a macro. The result
 * of this regular expression contains:
 * result[1] = attribute name
 * result[2] = attribute value
 * @type RegExp
 */
MessageParser.REGEX_PARAM = /([\w]*)\s*=\s*["'](.*?)["']\s*(?=\w+=|$)/gm;

/**
 * Calculates the line number in the string passed as argument
 * at which the specified index position is located.
 * @param {String} str The source string
 * @param {Number} idx The index position to get the line number for.
 * @returns The line number of the index position in the source string.
 * @type Number
 */
MessageParser.getLineNum = function(str, idx) {
   return str.substring(0, idx).split(/.*(?:\r\n|\n\r|\r|\n)/).length;
};

/**
 * Parses the file passed as argument. If the file
 * is a directory, this method recurses down the directory
 * tree and parses all skin and function files.
 * @param {java.io.File} file The file or directory to start at.
 * @param {String} encoding The encoding to use
 */
MessageParser.prototype.parse = function(file, encoding) {
   if (file.isDirectory()) {
      var list = file.list();
      for (var i=0;i<list.length;i++) {
         this.parse(new java.io.File(file, list[i]), encoding);
      }
   } else {
      var fName, dotIdx;
      fName = file.getName();
      if ((dotIdx = fName.lastIndexOf(".")) > -1) {
         switch (String(fName.substring(dotIdx+1))) {
            case "skin":
               print("Parsing skin file " + file.getCanonicalPath() + "...");
               this.parseSkinFile(file, encoding);
               break;
            case "hac":
            case "js":
               print("Parsing function file " + file.getCanonicalPath() + "...");
               this.parseFunctionFile(file, encoding);
               break;
            default:
               break;
         }
      }
   }
   return;
};

/** @ignore */
MessageParser.prototype.toString = function() {
   return "[Jala Message Parser]";
};

/**
 * Parses a .js file and creates Message instances for all
 * calls of "gettext", "ngettext", "markgettext" and "_".
 * @param {java.io.File} file The function file to parse
 * @param {String} encoding The encoding to use
 */
MessageParser.prototype.parseFunctionFile = function(file, encoding) {
   var fis = new java.io.FileInputStream(file);
   var isr = new java.io.InputStreamReader(fis, encoding || "UTF-8");
   var reader = new java.io.BufferedReader(isr);
   var tokenizer = new java.io.StreamTokenizer(reader);
   var messages = [], stack = [];
   var c;
   while ((c = tokenizer.nextToken()) != java.io.StreamTokenizer.TT_EOF) {
      switch (c) {
         case java.io.StreamTokenizer.TT_WORD:
            if (MessageParser.FUNCTION_NAMES[tokenizer.sval] == true) {
               stack.push({name: tokenizer.sval, lineNr: tokenizer.lineno()});
            } else if (stack.length > 0) {
               // it's something else than a string argument inside a gettext method call
               // so finalize the argument parsing here as we aren't interested in that
               messages.push(stack.pop());
            }
            break;
         case java.io.StreamTokenizer.TT_NUMBER:
            break;
         default:
            if (stack.length > 0) {
               if ("\u0028".charCodeAt(0) == c) {
                  // start of arguments (an opening bracket)
                  stack[stack.length-1].args = [];
               } else if ("\u0029".charCodeAt(0) == c) {
                  // end of arguments (a closing bracket)
                  messages.push(stack.pop());
               } else if ("\u0022".charCodeAt(0) == c || "\u0027".charCodeAt(0) == c) {
                  // a quoted string argument
                  stack[stack.length-1].args.push(tokenizer.sval);
               }
            }
            break;
      }
   }
   if (messages.length > 0) {
      var msgParam, key, msg;
      for (var i=0;i<messages.length;i++) {
         msgParam = messages[i];
         if (msgParam.args && msgParam.args.length > 0) {
            if (msgParam.name === "cgettext" || msgParam.name === "markgettext") {
               msgParam.args[0] = cgettext.getKey(msgParam.args[0], msgParam.args[1]);
               delete msgParam.args[1];
            } 
            key = Message.getKey(msgParam.args[0]);
            if (!(msg = this.messages[key])) {
               this.messages[key] = msg = new Message(msgParam.args[0], msgParam.args[1]);
            }
            if (!msg.pluralId && msgParam.args.length > 1) {
               msg.pluralId = msgParam.args[1];
            }
            msg.addLocation(file.getCanonicalPath(), msgParam.lineNr);
         }
      }
   }
   fis.close();
   isr.close();
   reader.close();
   return;
};

/**
 * =================================================
 * FIXME: This is a patched version of the method in
 * jala/util/HopKit/scripts/MessageParser.js
 * It needs skin/macro introspection features enabled
 * in Helma. See also the file Skin.java.patch.
 * ==================================================
 * Parses a skin file and creates Message instances for
 * all macros which name is either "message" or
 * that have attributes named "message" and optional
 * "plural"
 * @param {java.io.File} file The skin file to parse
 * @param {String} encoding The encoding to use
 */
MessageParser.prototype.parseSkinFile = function(file, encoding) {
   var self = this;
   var source = readFile(file.getAbsolutePath(), encoding || "UTF-8");

   var checkNestedMacros = function(iterator) {
      var macros = [];
      while (iterator.hasNext()) {
         macro = iterator.next();
         if (macro && macro.constructor !== String) {
            macros.push(macro);
         }
      }
      processMacros(macros);
   }

   var processMacros = function(macros) {
      var re = /(\s*)(?:\r|\n)\s*/g;
      var id, pluralId, name, args, param, key, msg;
      for each (var macro in macros) {
         id = pluralId = null;
         name = macro.getName();
         param = macro.getNamedParams();
         if (param) {
            checkNestedMacros(param.values().iterator());
            if (name === MessageParser.MACRO_NAME) {
               id = param.get("text");
               pluralId = param.get("plural");
            } else if (param.containsKey("message") === MessageParser.ATTRBUTE_NAME) {
               id = param.get("message");
               pluralId = param.get("plural");
            }
         }
         args = macro.getPositionalParams();
         if (args) {
            checkNestedMacros(args.iterator());
            if (name === "gettext") {
               id = cgettext.getKey(args.get(0), param && param.get("context"));
            } else if (name === "ngettext") {
               id = args.get(0);
               pluralId = args.get(1);
            }
         }
         if (id != null) {
            if (id.constructor !== String) {
               continue;
            }
            // create new Message instance or update the existing one
            id = id.replace(re, " ");
            pluralId && (pluralId = pluralId.replace(re, " "));
            key = Message.getKey(id);
            if (!(msg = self.messages[key])) {
               self.messages[key] = msg = new Message(id, pluralId, file.getCanonicalPath());
            }
            msg.addLocation(file.getCanonicalPath(), MessageParser.getLineNum(source, macro.start));
         }
      }
   }

   var skin = createSkin(source);
   if (skin.hasMainskin()) {
      processMacros(skin.getMacros());
   }
   for each (var name in skin.getSubskinNames()) {
      var subskin = skin.getSubskin(name);
      processMacros(subskin.getMacros());
   }
   return;
}

/**
 * FIXME: Patched with adequate header data
 * Prints a standard Header of a .po file
 * FIXME: why the hell is Plural-Forms ignored in poEdit?
 * @see http://drupal.org/node/17564
 */
MessageParser.prototype.getPotString = function() {
   var buf = new java.lang.StringBuffer();
   buf.append('##\n');
   buf.append('## The Antville Project\n');
   buf.append('## http://code.google.com/p/antville\n');
   buf.append('##\n');
   buf.append('## Copyright 2001-2007 by The Antville People\n');
   buf.append('##\n');
   buf.append("## Licensed under the Apache License, Version 2.0 (the ``License''\n");
   buf.append('## you may not use this file except in compliance with the License.\n');
   buf.append('## You may obtain a copy of the License at\n');
   buf.append('##\n');
   buf.append('##    http://www.apache.org/licenses/LICENSE-2.0\n');
   buf.append('##\n');
   buf.append('## Unless required by applicable law or agreed to in writing, software\n');
   buf.append("## distributed under the License is distributed on an ``AS IS'' BASIS,\n");
   buf.append('## WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n');
   buf.append('## See the License for the specific language governing permissions and\n');
   buf.append('## limitations under the License.\n');
   buf.append('##\n');
   buf.append('## $Revision$\n');
   buf.append('## $LastChangedBy$\n');
   buf.append('## $LastChangedDate$\n');
   buf.append('##\n\n');
   buf.append('#, fuzzy\n');
   buf.append('msgid ""\n');
   buf.append('msgstr ""\n');
   buf.append('"Project-Id-Version: Antville-' + Root.VERSION + '\\n"\n');
   buf.append('"Report-Msgid-Bugs-To: mail@antville.org\\n"\n');
   var sdf = new java.text.SimpleDateFormat("yyyy-MM-dd HH:mmZ");
   buf.append('"POT-Creation-Date: ' + sdf.format(new java.util.Date()) + '\\n"\n');
   buf.append('"PO-Revision-Date: ' + sdf.format(new java.util.Date()) + '\\n"\n');
   //buf.append('"Last-Translator: FULL NAME <EMAIL@ADDRESS>\\n"\n');
   buf.append('"Language-Team: The Antville People <mail@antville.org>\\n"\n');
   buf.append('"MIME-Version: 1.0\\n"\n');
   buf.append('"Content-Type: text/plain; charset=utf-8\\n"\n');
   buf.append('"Content-Transfer-Encoding: 8bit\\n"\n');
   buf.append('"Plural-Forms: nplurals=2; plural=(n != 1);\\n"\n');
   buf.append('\n');

   // sort all messages by their singular key
   var keys = [];
   for (var i in this.messages) {
      keys[keys.length] = this.messages[i].id;
   }
   keys.sort();
   // add all the messages
   for (var i=0;i<keys.length;i++) {
      this.messages[keys[i]].write(buf);
   }
   return new java.lang.String(buf);
};

/**
 * Write the parsed contents into the file passed as argument.
 * @param {java.io.File} file The file to write to
 */
MessageParser.prototype.writeToFile = function(file) {
   var writer = new java.io.FileWriter(file);
   writer.write(new java.lang.String(this.getPotString().getBytes("UTF-8")));
   writer.close();
   return;
};

/**
 * Main script body
 */
var toParse = [];
var arg, outFile, file, fileEncoding;

for (var i=0;i<arguments.length;i++) {
   arg = arguments[i];
   if (arg.indexOf("-o") === 0 && i < arguments.length -1) {
      outFile = new java.io.File(arguments[i += 1]);
   } else if (arg.indexOf("-e") === 0 && i < arguments.length -1) {
      fileEncoding = arguments[i += 1];
   } else {
      // add argument to list of files and directories to parse
      toParse.push(new java.io.File(arg));
   }
}

// start parsing
var parser = new MessageParser();
for (var i=0;i<toParse.length;i++) {
   parser.parse(toParse[i], fileEncoding);
}
if (outFile != null) {
   parser.writeToFile(outFile);
} else {
   print(parser.getPotString());
}
