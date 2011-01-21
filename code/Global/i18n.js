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

/**
 * @fileOverview Contains redefined or additional methods for 
 * internationalization and localization.
 */

/**
 * This method is called from the build script to extract gettext call strings 
 * from scripts and skins.
 * @param {String} script
 * @param {String} scanDirs
 * @param {String} potFile
 */
Root.prototype.extractMessages = function(script, scanDirs, potFile) {
   var temp = {print: global.print, readFile: global.readFile};
   global.print = function(str) {app.log(str);}
   global.readFile = function(fpath, encoding) {
      res.push();
      var file = new helma.File(fpath);
      file.open({charset: encoding || "UTF-8"});
      var str;
      while ((str = file.readln()) !== null) {
         res.writeln(str);
      }
      file.close();
      return res.pop();
   }
   var args = ["-o", potFile, "-e", "utf-8"];
   for each (var dir in scanDirs.split(" ")) {
      args.push(app.dir + "/../" + dir);
   }
   var file = new helma.File(script);
   var MessageParser = new Function(file.readAll());
   MessageParser.apply(global, args);
   global.print = temp.print;
   global.readFile = temp.readFile;
   return;
}

/**
 * This method is useful for disambiguation of messages (single words most of
 * the time) that have different meanings depending on the context.
 * Example: comment (the verb "to comment" vs the noun "a comment")
 * @param {Object} key The message ID
 * @param {Object} context The context of the message
 * @returns String
 */
function cgettext(key, context) {
   var msgId = cgettext.getKey(key, context);
   var text = jala.i18n.translate(msgId);
   return text === msgId ? key : text;
}

/**
 * Helper method to define the message ID depending on the context.
 * @param {Object} key
 * @param {Object} context
 * @returns String
 */
cgettext.getKey = function(key, context) {
   return context ? key + " // " + context : key;
}

/**
 * 
 * @param {Object} param
 * @param {String} text
 * @returns String
 * @see jala.i18n.gettext
 */
function gettext_macro(param, text /*, value1, value2, ...*/) {
   if (!text) {
      return;
   }
   var re = /\s+/g;
   var args = [text.replace(re, String.SPACE)];
   for (var i=2; i<arguments.length; i+=1) {
      args.push(arguments[i]);
   }
   if (param.context) {
      return cgettext.call(this, args[0], param.context);
   }
   return gettext.apply(this, args);
}

/**
 * 
 * @param {Object} param
 * @param {String} singular
 * @param {String} plural
 * @returns String
 * @see jala.i18n#ngettext
 */
function ngettext_macro(param, singular, plural /*, value1, value2, ...*/) {
   if (!singular || !plural) {
      return;
   }
   var re = /\s+/g;
   var args = [singular.replace(re, String.SPACE), plural.replace(re, String.SPACE)];
   for (var i=3; i<arguments.length; i+=1) {
      args.push(arguments[i]);
   }
   return ngettext.apply(this, args);
}

/**
 * 
 * @param {Object} param
 * @param {Object} singular
 * @param {Object} plural
 * @see jala.i18n#markgettext
 */
function markgettext_macro(param, singular, plural) {
   return markgettext.call(this, singular, plural);
}
