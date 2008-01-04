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

ImageMgr.prototype.topicchooser_macro = function() {
   return Story.prototype.topicchooser_macro.apply(res.handlers.image || 
         new Image, arguments);
};

ImageMgr.prototype.link_macro = function(param) {
   if (this.getContext() === "Layout" && param.to === "myimages") {
      param.to = "default";
      param.text = "default images";
   }
   return HopObject.prototype.link_macro.apply(this, arguments);
};

Images.prototype.navigation_macro = function(param) {
   if (!this._parent.parent || !this._parent.parent.images.size())
      return;
   this.renderSkin(param.skin ? param.skin : "navigation");
   return;
};
