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

// Apply with enabled updater repository via ant patch -Dpatch.id=20101209

root.forEach(function() {
   var site = this;
   var locale = site.locale;
   // Update locales to new format
   if (locale.contains("_")) {
      site.locale = locale.substr(0, locale.lastIndexOf("_"));
   }
   // Update time zones to new format
   var timeZone = site.timeZone;
   switch (timeZone) {
      case "CET":
      site.timeZone = "Europe/Vienna";
      break;
      case "GMT":
      site.timeZone = "Europe/London";
      break;
   }
});
