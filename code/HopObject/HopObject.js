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

HopObject.prototype.map = function(values) {
   for (var i in values) {
      this[i] = values[i];
   }
   return;
};

HopObject.prototype.onRequest = function() {
   if (req.postParams.cancel) {
      switch (this.constructor) {
         case Admin:
         res.redirect(req.action + "?page=" + req.queryParams.page + 
               "#" + req.queryParams.id);
         case Members:
         case Membership:
         res.redirect(this._parent.href());
         case Skin:
         res.redirect(res.handlers.skins.href());
         case Skins:
         res.redirect("?skinset=" + req.postParams.skinset +
               "#" + req.postParams.key)
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
   
   if (!this.getPermission(req.action)) {
      res.status = 401;
      res.write("Sorry, you are not allowed to access this part of the site.");
      res.stop();
   }
   return;
};

HopObject.prototype.delete_action = function() {
   if (req.postParams.proceed) {
      try {
         var str = this.toString();
         this.constructor.remove.call(this, this);
         res.message = gettext("{0} was successfully deleted.", str);
         res.redirect(session.data.retrace || this._parent.href());
      } catch(ex) {
         res.message = ex;
         app.log(ex);
      }
   }

   res.data.action = this.href(req.action);
   res.data.title = gettext("Confirm deletion of " + this);
   res.data.body = this.renderSkinAsString("delete", {
      text: gettext('You are about to delete {0}.', this)
   });
   res.handlers.site.renderSkin("page");
   return;
};

HopObject.remove = function(collection) {
   var item;
   
/*   for (var i=0; i<collection.size(); i+=1) {
      item = collection.get(i);
      res.debug("call " + item.constructor.name + ".remove() for object " + item);
      if (item.constructor === HopObject) {
         item.constructor.remove.call(item, item);
      }
   }
return;
res.abort(); */

   while (collection.size() > 0) {
      item = collection.get(0);
      item.constructor.remove.call(item, item);
   }
   return;
};

HopObject.prototype.onUnhandledMacro = function(name) {
   return;
   
   switch (name) {
      default:
      return this[name];
   }
};

HopObject.prototype.touch = function() {
   return this.map({
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

HopObject.prototype.textarea_macro = function(param, name) {
   param.name = name;
   param.value = this.getFormValue(name);
   return html.textArea(param);
}

HopObject.prototype.select_macro = function(param, name) {
   param.name = name;
   var options = this.getFormOptions(name);
   if (options.length < 2) {
      param.disabled = "disabled";
   }
   return html.dropDown(param, options, this.getFormValue(name));
};

HopObject.prototype.checkbox_macro = function(param, name) {
   param.name = name;
   param.id = name;
   var options = this.getFormOptions(name);
   if (options.length < 2) {
      param.disabled = "disabled";
   }
   param.value = String(options[0].value);
   param.selectedValue = String(this.getFormValue(name));
   var label = param.label;
   delete param.label;
   //res.debug(name + ": " + param.value + " / " + this.getFormValue(name));
   html.checkBox(param);
   if (label) {
      html.element("label", label, {"for": name});
   }
   return;
};

HopObject.prototype.getFormValue = function(name) {
   if (req.isPost()) {
      return req.postParams[name];
   } else {
      var value = this[name];
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
   res.write(formatDate(this.created, format || param.format));
   return;
};

HopObject.prototype.modified_macro = function(param, format) {
   res.write(formatDate(this.modified, format || param.format));
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

HopObject.prototype.self_macro = function() {
   return this;
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

HopObject.prototype.toString = function() {
   return this.constructor.name + " #" + this._id;
};

/*HopObject.prototype.valueOf = function() {
   return this._id;
};*/

HopObject.prototype.link_filter = function(value, param, action) {
   return renderLink(param, action, value, this);
};

HopObject.prototype.handleMetadata = function(name) {
   this.__defineGetter__(name, function() {
      return this.metadata.get(name);
   });
   this.__defineSetter__(name, function(value) {
      return this.metadata.set(name, value);
   });
   return;
};
