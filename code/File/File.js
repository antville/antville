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
 * main action simply redirects to "view" url
 */
File.prototype.main_action = function() {
   res.redirect(this.site.href("getfile") + "?name=" + this.alias);
   return;
};


/**
 * edit action
 */
File.prototype.edit_action = function() {
   if (req.data.cancel)
      res.redirect(this.site.files.href());
   else if (req.data.save) {
      res.message = this.evalFile(req.data, session.user);
      res.redirect(this._parent.href());
   }
   
   res.data.action = this.href(req.action);
   res.data.title = getMessage("File.editTitle", {fileAlias: this.alias});
   res.data.body = this.renderSkinAsString("edit");
   this.site.renderSkin("page");
   return;
};

/**
 * delete action
 */
File.prototype.delete_action = function() {
   if (req.data.cancel)
      res.redirect(this.site.files.href());
   else if (req.data.remove) {
      try {
         var url = this._parent.href();
         res.message = this.site.files.deleteFile(this);
         res.redirect(url);
      } catch (err) {
         res.message = err.toString();
      }
   }
   
   res.data.action = this.href(req.action);
   res.data.title = getMessage("File.deleteTitle", {fileAlias: this.alias});
   var skinParam = {
      description: getMessage("File.deleteDescription"),
      detail: this.alias
   };
   res.data.body = this.renderSkinAsString("delete", skinParam);
   this.site.renderSkin("page");
   return;
};
/**
 * macro rendering alias
 */
File.prototype.alias_macro = function(param) {
   if (param.as == "editor")
      Html.input(this.createInputParam("alias", param));
   else if (param.as == "link") {
      param.to = "getfile"
      param.urlparam = "name=" + escape(this.alias);
      param.title = encodeForm(this.description);
      Html.openTag("a", this.site.createLinkParam(param));
      res.write(this.alias);
      Html.closeTag("a");
   } else
      res.write(this.alias);
   return;
};

/**
 * macro rendering description
 */
File.prototype.description_macro = function(param) {
   if (param.as == "editor")
      Html.textArea(this.createInputParam("description", param));
   else if (this.description)
      res.write(this.description);
   return;
};

/**
 * macro renders the url of this file
 */
File.prototype.url_macro = function(param) {
   return this.getUrl();
};

/**
 * macro renders a link for editing a file
 */
File.prototype.editlink_macro = function(param) {
   if (session.user) {
      try {
         this.checkEdit(session.user, req.data.memberlevel);
      } catch (deny) {
         return;
      }
      Html.link({href: this.href("edit")}, param.text ? param.text : getMessage("generic.edit"));
   }
   return;
};

/**
 * macro rendering a link to delete
 * if user is creator of this file
 */
File.prototype.deletelink_macro = function(param) {
   if (session.user) {
      try {
         this.checkEdit(session.user, req.data.memberlevel);
      } catch (deny) {
         return;
      }
      Html.openLink({href: this.href("delete")});
      if (param.image && this.site.images.get(param.image))
         renderImage(this.site.images.get(param.image), param);
      else
         res.write(param.text ? param.text : getMessage("generic.delete"));
      Html.closeLink();
   }
   return;
};

/**
 * macro rendering a link to view the file
 */
File.prototype.viewlink_macro = function(param) {
   if (session.user) {
      param.to = "getfile"
      param.urlparam = "name=" + escape(this.alias);
      param.title = encodeForm(this.description);
      Html.openTag("a", this.site.createLinkParam(param));
      res.write(param.text ? param.text : getMessage("generic.view"));
      Html.closeTag("a");
   }
   return;
};

/**
 * macro rendering filesize
 */
File.prototype.filesize_macro = function(param) {
   res.write((this.filesize / 1024).format("###,###") + " KB");
   return;
};

/**
 * macro rendering the mimetype
 */
File.prototype.mimetype_macro = function(param) {
   res.write(this.mimetype);
   return;
};

/**
 * macro rendering the file extension from the name
 */
File.prototype.filetype_macro = function(param) {
   if (this.mimetype)
      res.write(this.mimetype.substring(this.mimetype.indexOf("/") + 1));
   else {
      var i = this.name.lastIndexOf(".");
      if (i > -1)
         res.write(this.name.substring(i+1, this.name.length));
   }
   return;
};

/**
 * macro rendering the number of requests so far
 * for a file-object
 */
File.prototype.clicks_macro = function(param) {
   if (!this.requestcnt)
      res.write(param.no ? param.no : getMessage("File.download.no"));
   else if (this.requestcnt == 1)
      res.write(param.one ? param.one : getMessage("File.download.one"));
   else {
      res.write(this.requestcnt);
      res.write(param.more ? param.more : " " + getMessage("File.download.more"));
   }
   return;
};
/**
 * constructor function
 */
File.prototype.constructor = function(creator) {
   this.requestcnt = 0;
   this.creator = creator;
   this.createtime = new Date();
   return this;
};


/**
 * function checks if new property-values for a file are correct
 * @param Obj Object containing form-values
 * @param Obj User-Object modifying file
 * @return Obj Object containing two properties:
 *             - error (boolean): false
 *             - message (String): containing a message to user
 */
File.prototype.evalFile = function(param, modifier) {
   this.description = param.description;
   this.modifier = modifier;
   this.modifytime = new Date();
   return new Message("update");
};

/**
 * return the url of the file
 */
File.prototype.getUrl = function() {
   res.push();
   this.site.staticUrl("files/");
   res.write(this.name);
   return res.pop();
};
/**
 * permission check (called by hopobject.onRequest())
 * @param String name of action
 * @param Obj User object
 * @param Int Membership level
 * @return Obj Exception object or null
 */
File.prototype.checkAccess = function(action, usr, level) {
   try {
      switch (action) {
         case "edit" :
            checkIfLoggedIn(this.href(req.action));
            this.checkEdit(usr, level);
            break;
         case "delete" :
            checkIfLoggedIn();
            this.checkDelete(usr, level);
            break;
      }
   } catch (deny) {
      res.message = deny.toString();
      res.redirect(this.site.files.href());
   }
   return;
};

/**
 * check if user is allowed to edit a file
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */
File.prototype.checkEdit = function(usr, level) {
   if (this.creator != usr && (level & MAY_EDIT_ANYFILE) == 0)
      throw new DenyException("fileEdit");
   return;
};


/**
 * check if user is allowed to delete a file
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */
File.prototype.checkDelete = function(usr, level) {
   if (this.creator != usr && (level & MAY_DELETE_ANYIMAGE) == 0)
      throw new DenyException("fileDelete");
   return;
};
