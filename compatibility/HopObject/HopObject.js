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

(function() {
   return; // FIXME!
   
   var renderSkin = HopObject.prototype.renderSkin;

   HopObject.prototype.renderSkin = function(name, param) {
      var constraint = res.contentType === "text/html" && 
            name.constructor === String;
      if (constraint) {
         var prototype = this.constructor === Root ? 
               "Site" : this.constructor.name;
         var skin = name.replace(/.*#/, "");
         res.write('<div class="debug skin">');
         res.write('<div class="debug title">');
         skin = new Skin(prototype, skin);
         html.link({href: skin.href()}, skin.prototype + "." + skin.name);
         res.write("</div>");
      }
      renderSkin.call(this, name, param);
      constraint && (res.write("</div>"));
   }

   HopObject.prototype.renderSkinAsString = function(name, param) {
      res.push();
      this.renderSkin(name, param);
      return res.pop();
   }

})();

HopObject.prototype.createtime_macro = function() {
   return this.created_macro.apply(this, arguments);
};

HopObject.prototype.modifytime_macro = function() {
   return this.modified_macro.apply(this, arguments);
};

HopObject.prototype.url_macro = function(param) {
   return this.href_macro(param);
};
