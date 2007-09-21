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
 * list all files of a site
 */
FileMgr.prototype.main_action = function() {
   res.data.filelist = renderList(this, "mgrlistitem", 10, req.data.page);
   res.data.pagenavigation = renderPageNavigation(this, this.href(), 10, req.data.page);
   res.data.title = getMessage("FileMgr.listTitle", {siteTitle: this._parent.title});
   res.data.body = this.renderSkinAsString("main");
   this._parent.renderSkin("page");
   return;
};

/**
 * list just my files
 */
FileMgr.prototype.myfiles_action = function() {
   var ms = this._parent.members.get(session.user.name);
   res.data.filelist = renderList(ms.files, "mgrlistitem", 10, req.data.page);
   res.data.pagenavigation = renderPageNavigation(ms.files, this.href(), 10, req.data.page);
   res.data.title = getMessage("FileMgr.listMyFilesTitle", {siteTitle: this._parent.title});
   res.data.body = this.renderSkinAsString("main");
   this._parent.renderSkin("page");
   return;
};

/**
 * action for creating new File objects
 */
FileMgr.prototype.create_action = function() {
   if (req.data.cancel)
      res.redirect(this.href());
   else if (req.data.save) {
      try {
         res.message = this.evalFile(req.data, session.user);
         res.redirect(this.href());
      } catch (err) {
         res.message = err.toString();
      }
   }
   
   res.data.action = this.href(req.action);
   res.data.title = getMessage("FileMgr.addFile", {siteTitle: this._parent.title});
   res.data.body = this.renderSkinAsString("new");
   this._parent.renderSkin("page");
   return;
};
/**
 * function checks if file fits to the minimal needs
 * @param Obj Object containing the properties needed for creating a new File
 * @param Obj User-Object creating this file
 * @return Obj Object containing two properties:
 *             - error (boolean): true if error happened, false if everything went fine
 *             - message (String): containing a message to user
 */
FileMgr.prototype.evalFile = function(param, creator) {
   if (param.uploadError) {
      // looks like the file uploaded has exceeded uploadLimit ...
      throw new Exception("fileFileTooBig");
   }
   if (!param.rawfile || param.rawfile.contentLength == 0) {
      // looks like nothing was uploaded ...
      throw new Exception("fileNoUpload");
   }
   var filesize = Math.round(param.rawfile.contentLength / 1024);
   if (this._parent.getDiskUsage() + filesize > this._parent.getDiskQuota()) {
      // disk quota has already been exceeded
      throw new Exception("siteQuotaExceeded");
   }
   var newFile = new File(creator);
   // if no alias given try to determine it
   if (!param.alias)
      newFile.alias = buildAliasFromFile(param.rawfile, this);
   else {
      if (!param.alias.isFileName())
         throw new Exception("noSpecialChars");
      newFile.alias = buildAlias(param.alias, this);
   }
   // store properties necessary for file-creation
   newFile.alttext = param.alttext;
   newFile.name = newFile.alias;
   newFile.filesize = param.rawfile.contentLength;
   newFile.mimetype = param.rawfile.contentType;
   newFile.description = param.description;
   var dir = this._parent.getStaticPath("files");
   newFile.name = param.rawfile.writeToFile(dir, newFile.name);
   if (!newFile.name)
      throw new Exception("fileSave");
   // the file is on disk, so we add the file-object
   if (!this.add(newFile))
      throw new Exception("fileCreate", newFile.alias);
   // send e-mail notification
   if (newFile.site.isNotificationEnabled())
      newFile.site.sendNotification("upload", newFile);
   newFile.site.diskusage += newFile.filesize;
   return new Message("fileCreate", newFile.alias, newFile);
};

/**
 * permission check (called by hopobject.onRequest())
 * @param String name of action
 * @param Obj User object
 * @param Int Membership level
 * @return Obj Exception object or null
 */
FileMgr.prototype.checkAccess = function(action, usr, level) {
   checkIfLoggedIn(this.href(req.action));
   try {
      this.checkAdd(session.user, res.data.memberlevel);
   } catch (deny) {
      res.message = deny.toString();
      res.redirect(this._parent.href());
   }
   return;
};

/**
 * check if user is allowed to add files
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return Obj Exception or null
 */
FileMgr.prototype.checkAdd = function(usr, level) {
   if (!this._parent.properties.get("usercontrib") && (level & MAY_ADD_FILE) == 0)
      throw new DenyException("fileAdd");
   return;
};
