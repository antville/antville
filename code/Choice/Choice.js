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
 * render the title of a choice, either as editor
 * or as plain text
 */
Choice.prototype.title_macro = function(param) {
   if (param.as = "editor")
      Html.input(this.createInputParam("title", param));
   else
      res.write(this.title);
   return;
};
/**
 * constructor function for choice objects
 */
Choice.prototype.constructor = function(title) {
   this.title = title;
   this.createtime = this.modifytime = new Date();
   return this;
};

/**
 * function removes all votes from a choice
 */
Choice.prototype.deleteAll = function() {
   for (var i=this.size();i>0;i--)
      this.get(i-1).remove();
   return true;
};
