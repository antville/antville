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
 * render a link to image-edit
 * calls image.editlink_macro, but only
 * if the layout in path is the one this image
 * belongs to
 */
LayoutImage.prototype.editlink_macro = function(param) {
   if (path.Layout == this.layout)
      Image.prototype.editlink_macro.apply(this, [param]);
   return;
};


/**
 * render a link to delete action
 * calls image.deletelink_macro, but only
 * if the layout in path is the one this image
 * belongs to
 */
LayoutImage.prototype.deletelink_macro = function(param) {
   if (path.Layout == this.layout)
      Image.prototype.deletelink_macro.apply(this, [param]);
   return;
};
/**
 * return the url of the layout image (overwrites
 * getUrl() of image)
 * @see image/objectFunctions.js
 */
LayoutImage.prototype.getUrl = function() {
   res.push();
   this.layout.staticUrl();
   res.write(this.filename);
   res.write(".");
   res.write(this.fileext);
   return res.pop();
};

/**
 * return the image file on disk
 * @return Object File object
 */
LayoutImage.prototype.getFile = function() {
   return new Helma.File(this.layout.getStaticPath(), this.filename + "." + this.fileext);
};
/**
 * check if user is allowed to edit a layout image
 * (overwrites Image.checkEdit())
 * @see Image/securityFunctions.js
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return Obj Exception or null (if allowed)
 */
LayoutImage.prototype.checkEdit = function(usr, level) {
   this.layout.images.checkAdd(usr, level);
   return;
};

/**
 * check if user is allowed to delete a Image
 * (overwrites Image.checkEdit())
 * @see Image/securityFunctions.js
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return Obj Exception or null (if allowed)
 */
LayoutImage.prototype.checkDelete = function(usr, level) {
   this.layout.images.checkAdd(usr, level);
   return;
};
