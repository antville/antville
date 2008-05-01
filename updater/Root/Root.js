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

app.addRepository("modules/core/HopObject.js");
app.addRepository("modules/core/Object.js");
app.addRepository("modules/core/String.js");
app.addRepository("modules/helma/Color.js");
app.addRepository("modules/helma/File.js");

Root.prototype.main_action = function() {
   app.invokeAsync(global, function() {
      if (init()) {
         //update("size"); // DEBUG
         //update("legacy");
         update("tag");
         update("tag_hub");
         update("AV_ACCESSLOG");
         update("AV_CHOICE");
         update("AV_FILE");
         update("AV_IMAGE");
         update("AV_LAYOUT");
         update("AV_MEMBERSHIP");
         update("AV_POLL");
         update("AV_SITE");
         update("AV_SKIN");
         update("AV_TEXT");
         update("AV_USER");
         update("AV_VOTE");
         update("AV_SYSLOG"); // This table has to go last!
         convert("folders");
         convert("root");
         finalize();
      }
      return;
   }, [], -1);
   this.renderSkin("Root");
   return;
}

Root.prototype.out_action = function() {
   res.contentType = "text/plain";
   return out();
}

