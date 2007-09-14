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

HopObject.prototype.onRequest = function() {
   if (req.postParams.cancel) {
      switch (this.constructor) {
         case Membership:
         case Members:
         res.redirect(this._parent.href());
         default:
         res.redirect(this.href());
      }
   }
   
   // FIXME: do we still need this?
   if (app.data.redirectPostRequests && path.site && req.isPost())
      res.redirect(app.data.redirectPostRequests);

   autoLogin();
   res.handlers.membership = User.getMembership();
   
   // FIXME: this can go, soon
   res.data.memberlevel = Membership.getLevel();

   // FIXME: context has to go in the end
   res.handlers.context = res.handlers.site;
   
/*
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
*/

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
   if (!session.user || !session.user.sysadmin) {
      this.checkAccess(req.action, session.user, res.data.memberlevel);
   }
      
   if (!this.getPermission(req.action)) {
      res.status = 401;
      res.write("Sorry, you are not allowed to access this part of the site.");
      res.stop();
   }
   return;
};

HopObject.prototype.onUnhandledMacro = function(name) {
   switch (name) {
      default:
      return this.value(name);
   }
};

HopObject.prototype.touch = function() {
   return this.value({
      modified: new Date,
      modifier: session.user
   });
};

HopObject.prototype.getPermission = function() {
   return true;
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

HopObject.prototype.link_macro = function(param, url, text) {
   if (this.getPermission(url)) {
      renderLink.call(global, param, url, text, this);
   }
   return;
};

HopObject.prototype.created_macro = function(param, format) {
   res.write(formatDate(this.value("created"), format || param.format));
   return;
};

HopObject.prototype.modified_macro = function(param, format) {
   res.write(formatDate(this.value("modified"), format || param.format));
   return;
};

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

HopObject.prototype.getNavigationName = function() {
   var proto = this._prototype;
   var display;
   if (display = getDisplay(proto))
      return display;
   return this.__name__;
};

HopObject.prototype.applyModuleMethod = function(module, funcName, param) {
   if (module && module[funcName])
      module[funcName].apply(this, [param]);
   return;
};

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
};

HopObject.prototype.removeChildren = function() {
   while (this.size() > 0) {
      this.get(0).remove();
   }
   return;
};
