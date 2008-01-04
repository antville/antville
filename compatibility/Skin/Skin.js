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

relocateProperty(Skin, "createtime", "created");
relocateProperty(Skin, "modifytime", "modified");
relocateProperty(Skin, "proto", "prototype");

delete Skin.prototype.createtime_macro;
delete Skin.prototype.modifytime_macro;

Skin.prototype.deletelink_macro = function(param) {
   if (path.Layout != this.layout)
      return;
   Html.link({href: this.href("delete")}, param.text ? param.text : "delete");
   return;
};

Skin.prototype.difflink_macro = function(param) {
   if (this.custom == 1 && !this.layout.skins.getOriginalSkin(this.proto, this.name))
      return;
   Html.link({href: this.href("diff")}, param.text ? param.text : "diff");
   return;
};

