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

// FIXME: Modular extension currently cannot modify the version string anymore!
//Root.VERSION += "-compatible";

Root.prototype.rss_action = function() {
   return res.redirect(root.href("rss.xml"));
}

Root.prototype.url_macro = function(param) {
   return this.href_macro(param);
}

Root.prototype.sitecounter_macro = function(param) {
   if (param.count === "all") {
      var size = root.size();
   } else {
      var size = root.sites.size();
   }
   if (size < 1) {
      res.write(param.no || size);
   } else if (size < 2) {
      res.write(param.one || size);
   } else {
      res.write(size + (param.more || String.EMPTY));
   }
   return;
}


