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

HopObject.prototype.value = function(key, value, getter, setter) {
   getter || (getter = function() { 
      return this[key]; 
   });
   setter || (setter = new Function);
   if (value === undefined) {
      if (key.constructor === Object) {
         for (var i in key) {
            this.value(i, key[i]);
         }
         return;
      }
      return getter();
   }
   setter();
   return;
};

/**
 * user-friendly wrapper for href_macro
 */
HopObject.prototype.url_macro = function(param) {
   this.href_macro(param);
   return;
};

/**
 * macro creates an html link
 */
HopObject.prototype.link_macro = function(param) {
   Html.openTag("a", this.createLinkParam(param));
   res.write(param.text ? param.text : param.to);
   Html.closeTag("a");
   return;
};

/**
 * macro renders the time the object was created
 */
HopObject.prototype.createtime_macro = function(param) {
   if (this.createtime)
      res.write(formatTimestamp(this.createtime, param.format));
   return;
};

/**
 * macro rendering modifytime
 */
HopObject.prototype.modifytime_macro = function(param) {
   if (this.modifytime)
      res.write(formatTimestamp(this.modifytime, param.format));
   return;
};

/**
 * macro renders the name of the creator of an object
 * either as link or as plain text
 */
HopObject.prototype.creator_macro = function(param) {
   if (!this.creator)
      return;
   if (param.as == "link" && this.creator.url)
      Html.link({href: this.creator.url}, this.creator.name);
   else if (param.as == "url")
      res.write(this.creator.url);
   else
      res.write(this.creator.name);
   return;
};

/**
 * macro renders the name of the modifier
 */
HopObject.prototype.modifier_macro = function(param) {
   if (!this.modifier)
      return;
   if (param.as == "link" && this.modifier.url)
      Html.link({href: this.modifier.url}, this.modifier.name);
   else if (param.as == "url")
      res.write(this.modifier.url);
   else
      res.write(this.modifier.name);
   return;
};
/**
 * Return a name for the object to be used in the
 * global linkedpath macro
 * this function is overwritten by day-objects!
 * @see day.getNavigationName()
 * @see story.getNavigationName()
 * @see topic.getNavigationName()
 */
HopObject.prototype.getNavigationName = function() {
   var proto = this._prototype;
   var display;
   if (display = getDisplay(proto))
      return display;
   return this.__name__;
};


/**
 * creates parameter object that will be passed to
 * function that renders the input element
 */
HopObject.prototype.createInputParam = function(propName, param) {
   param.name = propName;
   // submitted values override property value
   // but only if there were not multiple form elements
   // with the same name submitted
   var multiple = req.data[propName + "_array"];
   if ((!multiple || multiple.length < 2) && req.data[propName] != null) {
      param.value = req.data[propName];
   } else {
      param.value = this.value(propName);
   }
   delete param.as;
   return param;
};

/**
 * create a parameter object for checkboxes
 */
HopObject.prototype.createCheckBoxParam = function(propName, param) {
   param.name = propName;
   param.value = 1;
   if (req.data[propName] == 1 || this.value(propName)) {
      param.checked = "checked";
   }
   delete param.as;
   return param;
};

/**
 * derives parameter object from an object that will
 * be passed to function that renders the link element
 */
HopObject.prototype.createLinkParam = function(param) {
   // clone the param object since known non-html
   // attributes are going to be deleted
   var linkParam = Object.clone(param);
   var url = param.to ? param.to : param.linkto;
   if (!url || url == "main") {
      if (this._prototype != "Comment")
         linkParam.href = this.href();
      else
         linkParam.href = this.story.href() + "#" + this._id;
   } else if (url.contains("://") || url.startsWith("javascript"))
      linkParam.href = url;
   else {
      // check if link points to a subcollection
      if (url.contains("/"))
         linkParam.href = this.href() + url;
      else
         linkParam.href = this.href(url);
   }
   if (param.urlparam)
      linkParam.href += "?" + param.urlparam;
   if (param.anchor)
      linkParam.href += "#" + param.anchor;
   delete linkParam.to;
   delete linkParam.linkto;
   delete linkParam.urlparam;
   delete linkParam.anchor;
   delete linkParam.text;
   return linkParam;
};

/**
 * method for rendering any module navigation
 * by calling the module method renderSiteNavigation
 */
HopObject.prototype.applyModuleMethod = function(module, funcName, param) {
   if (module && module[funcName])
      module[funcName].apply(this, [param]);
   return;
};


HopObject.prototype.onCodeUpdate = function(prototype) {
   return onCodeUpdate(prototype);
};

/**
 * function checks if there's a site in path
 * if true it checks if the site or the user is blocked
 */
HopObject.prototype.onRequest = function() {
   if (app.data.redirectPostRequests && path.site && req.isPost())
      res.redirect(app.data.redirectPostRequests);
   autoLogin();
   // defining skinpath, membershipLevel
   res.data.memberlevel = null;
   // if root.sys_frontSite is set and the site is online
   // we put it into res.handlers.site to ensure that the mirrored
   // site works as expected
   if (!path.Site && root.sys_frontSite && root.sys_frontSite.online)
      res.handlers.site = root.sys_frontSite;
   if (res.handlers.site) {
      if (res.handlers.site.blocked)
         res.redirect(root.href("blocked"));
      if (session.user)
         res.data.memberlevel = res.handlers.site.members.getMembershipLevel(session.user);
      // set a handler that contains the context
      res.handlers.context = res.handlers.site;
   } else {
      // set a handler that contains the context
      res.handlers.context = root;
   }

   if (session.data.layout) {
      // test drive a layout
      res.handlers.layout = session.data.layout;
      res.message = session.data.layout.renderSkinAsString("testdrive");
   } else {
      // define layout handler
      res.handlers.layout = res.handlers.context.getLayout();
   }

   // set skinpath
   res.skinpath = res.handlers.layout.getSkinPath();

   if (session.user && session.user.blocked) {
      // user was blocked recently, so log out
      session.logout();
      res.message = new Exception("accountBlocked");
      res.redirect(res.handlers.context.href());
   }
   // check access, but only if user is *not* a sysadmin
   // sysadmins are allowed to to everything
   if (!session.user || !session.user.sysadmin)
      this.checkAccess(req.action, session.user, res.data.memberlevel);
   return;
};

/**
 * basic permission check function
 * this method is overwritten by most of the other prototypes
 */
HopObject.prototype.checkAccess = function() {
   return;
};
