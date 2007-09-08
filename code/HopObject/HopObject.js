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

HopObject.prototype.input_macro = function(param, name) {
   param.name = name;
   param.value = this.getFormValue(name);
   return html.input(param);
};

HopObject.prototype.checkbox_macro = function(param, name) {
   param.name = name;
   param.id = name;
   param.value = String(this.getFormOptions(name)[0].value);
   param.selectedValue = String(this.getFormValue(name));
   //res.debug(name + ": " + param.value + " / " + this.getFormValue(name));
   return html.checkBox(param);
};

HopObject.prototype.select_macro = function(param, name) {
   param.name = name;
   return html.dropDown(param, this.getFormOptions(name), 
         this.getFormValue(name));
};

HopObject.prototype.getFormValue = function(name) {
   //res.debug(name + ": " + req.data[name] + " / " + ((value = req.data[name]) !== null))
   if (req.isPost()) {
      return req.postParams[name];
   } else {
      var value = this.value(name);
      return value instanceof HopObject ? value._id : value;
   }
   return "";
};

HopObject.prototype.getFormOptions = function(name) {
   return [{value: true, display: "enabled"}];
};

/**
 * macro creates an html link
 */
HopObject.prototype.link_macro = function(param, url, text) {
   return renderLink.call(global, param, url, text, this);
};

/**
 * macro renders the time the object was created
 */
HopObject.prototype.created_macro = function(param, format) {
   res.write(formatDate(this.value("created"), format || param.format));
   return;
};

/**
 * macro rendering modifytime
 */
HopObject.prototype.modified_macro = function(param, format) {
   res.write(formatDate(this.value("modified"), format || param.format));
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
 * method for rendering any module navigation
 * by calling the module method renderSiteNavigation
 */
HopObject.prototype.applyModuleMethod = function(module, funcName, param) {
   if (module && module[funcName])
      module[funcName].apply(this, [param]);
   return;
};

/**
 * function checks if there's a site in path
 * if true it checks if the site or the user is blocked
 */
HopObject.prototype.onRequest = function() {
   if (req.postParams.cancel) {
      switch (this.constructor) {
         case MemberMgr:
         res.redirect(this._parent.href());
         default:
         res.redirect(this.href());
      }
   }
   
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

HopObject.prototype.toString = function() {
   return this.constructor.name + " #" + this._id;
};

/*HopObject.prototype.valueOf = function() {
   return this._id;
};*/

HopObject.prototype.link_filter = function(value, param, action) {
   return renderLink(param, action, value, this);
   param.href = this.href(action || "");
   return html.link(param, value);
};
