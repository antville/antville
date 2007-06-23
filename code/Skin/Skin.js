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
 * action rendering the differences between the original skin
 * and the modified one
 */
Skin.prototype.diff_action = function() {
   // get the modified and original skins
   var originalSkin = this.layout.skins.getOriginalSkinSource(this.proto, this.name);

   if (originalSkin == null) {
      res.data.status = getMessage("Skin.diff.noDiffAvailable");
   } else {
      var diff = originalSkin.diff(this.skin ? this.skin : "");
      if (!diff) {
         res.data.status = getMessage("Skin.diff.noDiffFound");
      } else {
         res.push();
         var sp = new Object();
         for (var i in diff) {
            var line = diff[i];
            sp.num = line.num;
            if (line.deleted) {
               sp.status = "DEL";
               sp["class"] = "removed";
               for (var j=0;j<line.deleted.length;j++) {
                  sp.num = line.num + j;
                  sp.line = encode(line.deleted[j]);
                  this.renderSkin("diffline", sp);
               }
            }
            if (line.inserted) {
               sp.status = "ADD";
               sp["class"] = "added";
               for (var j=0;j<line.inserted.length;j++) {
                  sp.num = line.num + j;
                  sp.line = encode(line.inserted[j]);
                  this.renderSkin("diffline", sp);
               }
            }
            if (line.value != null) {
               sp.status = "&nbsp;";
               sp["class"] = "line";
               sp.line = encode(line.value);
               this.renderSkin("diffline", sp);
            }
         }
         res.data.diff = res.pop();
      }
   }
   res.data.body = this.renderSkinAsString("diff");
   res.data.title = getMessage("Skin.diff.displayTitle", {skinProto: this.proto, skinName: this.name, layoutTitle: this.layout.title});
   this.layout.skins.renderSkin("page");
   return;
};

/**
 * delete action
 */
Skin.prototype.delete_action = function() {
   if (req.data.cancel)
      res.redirect(this.layout.skins.href());
   else if (req.data.remove) {
      try {
         res.message = this.layout.skins.deleteSkin(this);
         res.redirect(this.layout.skins.href());
      } catch (err) {
         res.message = err.toString();
      }
   }

   res.data.action = this.href(req.action);
   res.data.title = res.handlers.context.getTitle();
   var skinParam = {
      description: getMessage("Skin.deleteDescription"),
      detail: this.name
   };
   res.data.body = this.renderSkinAsString("delete", skinParam);
   res.handlers.context.renderSkin("page");
   return;
};
/**
 * drop the "global" prototype to
 * display correct macro syntax 
 */
Skin.prototype.proto_macro = function() {
   if (this.proto.toLowerCase() != "global")
      res.write(this.proto);
   return;
};

/**
 * link to delete action
 */
Skin.prototype.deletelink_macro = function(param) {
   if (path.Layout != this.layout)
      return;
   Html.link({href: this.href("delete")}, param.text ? param.text : "delete");
   return;
};

/**
 * link to diff action
 */
Skin.prototype.difflink_macro = function(param) {
   if (this.custom == 1 && !this.layout.skins.getOriginalSkin(this.proto, this.name))
      return;
   Html.link({href: this.href("diff")}, param.text ? param.text : "diff");
   return;
};
/**
 * constructor function for skin objects
 */
Skin.prototype.constructor = function(layout, proto, name, creator) {
   this.layout = layout;
   this.proto = proto;
   this.name = name;
   this.custom = 0;
   this.creator = this.modifier = creator;
   this.createtime = new Date();
   this.modifytime = new Date();
   return this;
};
/**
 * permission check (called by hopobject.onRequest())
 * @param String name of action
 * @param Obj User object
 * @param Int Membership level
 * @return Obj Exception object or null
 */
Skin.prototype.checkAccess = function(action, usr, level) {
   checkIfLoggedIn(this.href(req.action));
   try {
      this.checkDelete(usr, level);
   } catch (deny) {
      res.message = deny.toString();
      res.redirect(this.site.skins.href());
   }
   return;
};


/**
 * check if user is allowed to delete this skin
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */
Skin.prototype.checkDelete = function(usr, level) {
   if ((level & MAY_EDIT_LAYOUTS) == 0)
      throw new DenyException("skinDelete");
   return;
};

