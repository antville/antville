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
 * internationalization and localization as well as markgettext() calls to 
 * complete i18n.
 */

/**
 * This method is useful for disambiguation of messages (single words most of
 * the time) that have different meanings depending on the context.
 * Example: cgettext("comment", "verb") vs cgettext("comment", "noun")
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
   var re = /(\s*)(?:\r|\n)\s*/g;
   var args = [text.replace(re, "$1")];
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
   var re = /(\s*)(?:\r|\n)\s*/g;
   var args = [singular.replace(re, "$1"), plural.replace(re, "$1")];
   for (var i=3; i<arguments.length; i+=1) {
      args.push(arguments[i]);
   }
   return ngettext.apply(this, args);
}

markgettext("Abandoned");
markgettext("Any");
markgettext("Ascending");

markgettext("Blocked");
markgettext("Both");

markgettext("Close");
markgettext("Closed");
markgettext("Compare");
markgettext("Contact");
markgettext("Contributor");
markgettext("Contributors");
markgettext("Creation Date");

markgettext("Delete");
markgettext("Deleted");
markgettext("Descending");
markgettext("Disabled");

markgettext("Edit");
markgettext("Enabled");
markgettext("Export");

markgettext("Featured");
markgettext("Files");

markgettext("Galleries");

markgettext("Hidden");
markgettext("Hide");

markgettext("Images");
markgettext("Import");

markgettext("Last Update");
markgettext("Logout");

markgettext("Name");
markgettext("Nobody");
markgettext("None");

markgettext("Manager");
markgettext("Managers");
markgettext("Members");
markgettext("Modified");

markgettext("Open");
markgettext("Owner");
markgettext("Owners");

markgettext("Polls");
markgettext("Privileged");
markgettext("Public");
markgettext("public");
markgettext("Publish");

markgettext("Referrers");
markgettext("Registration");
markgettext("Regular");
markgettext("Reset");
markgettext("Restricted");
markgettext("Root");
markgettext("Running");

markgettext("Setup");
markgettext("Shared");
markgettext("Show");
markgettext("Sites");
markgettext("Skins");
markgettext("Stories");
markgettext("Subscriber");
markgettext("Subscribers");

markgettext("Tags");
markgettext("Trusted");

markgettext("Users");
