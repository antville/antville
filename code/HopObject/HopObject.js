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
         case Skins:
         res.redirect(Skins.getRedirectUrl(req.postParams));
         default:
         res.redirect(this.href());
      }
   }

   User.autoLogin();
   res.handlers.membership = User.getMembership();
   if (User.getCurrentStatus() === User.BLOCKED) {
      session.logout();
      res.message = new Error(gettext("Sorry, your account has been disabled. Please contact the maintainer of this site for further information."));
      res.redirect(root.href());
   }
   
   if (!this.getPermission(req.action)) {
      res.status = 401;
      res.write("Sorry, you are not allowed to access this part of the site.");
      res.stop();
   }

   if (session.data.layout) {
      // Test-drive a layout
      res.handlers.layout = session.data.layout;
      res.message = session.data.layout.renderSkinAsString("testdrive");
   } else {
      res.handlers.layout = res.handlers.site.layout || new Layout;
   }
   res.skinpath = res.handlers.layout.getSkinPath();
   return;
};

HopObject.prototype.delete_action = function() {
   if (req.postParams.proceed) {
      //try {
         var str = this.toString();
         var href = this._parent.href();
         this.constructor.remove.call(this, this);
         res.message = gettext("{0} was successfully deleted.", str);
         res.redirect(session.data.retrace || href);
      /*} catch(ex) {
         res.message = ex;
         app.log(ex);
      }*/
   }

   res.data.action = this.href(req.action);
   res.data.title = gettext("Confirm deletion of " + this);
   res.data.body = this.renderSkinAsString("HopObject#delete", {
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
   param.id = name;
   param.value = this.getFormValue(name);
   return html.input(param);
};

HopObject.prototype.textarea_macro = function(param, name) {
   param.name = name;
   param.id = name;
   param.value = this.getFormValue(name);
   return html.textArea(param);
}

HopObject.prototype.select_macro = function(param, name) {
   param.name = name;
   param.id = name;
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
   param.value = String((options[1] || options[0]).value);
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

HopObject.prototype.radiobutton_macro = function(param, name) {
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
   html.radioButton(param);
   if (label) {
      html.element("label", label, {"for": name});
   }
   return;
};

HopObject.prototype.upload_macro = function(param, name) {
   param.name = name;
   param.id = name;
   param.value = this.getFormValue(name);
   html.input(param);
   var id = name + "_upload";
   html.file({name: id, id: id});
   return;
};

HopObject.prototype.macro_macro = function(param, handler) {
   var ctor = this.constructor;
   if ([Story, Image, File, Poll].indexOf(ctor) > -1) {
      var quote = function(str) {
         if (/\s/.test(str)) {
            str = '"' + str + '"';
         }
         return str;
      };
      res.encode("<% ");
      res.write(handler || ctor.name.toLowerCase());
      res.write(String.SPACE);
      res.write(quote(this.name) || this._id);
      res.encode(" %>");
   }
   return;
};

HopObject.prototype.getFormValue = function(name) {
   if (req.isPost()) {
      return req.postParams[name];
   } else {
      var value = this[name] || req.queryParams[name] || String.EMPTY;
      return value instanceof HopObject ? value._id : value;
   }
};

HopObject.prototype.getFormOptions = function(name) {
   return [{value: true, display: "enabled"}];
};

HopObject.prototype.self_macro = function() {
   return this;
};

HopObject.prototype.type_macro = function() {
   return res.write(this.constructor.name);
};

HopObject.prototype.link_macro = function(param, url, text) {
   url || (url = ".");
   var action = url.split(/#|\?/)[0];
   if (this.getPermission(action)) {
      text || (text = (action === "." ? this._id : action));
      renderLink.call(global, param, url, gettext(text), this);
   }
   return;
};

HopObject.prototype.created_macro = function(param, format) {
   if (this.created && !this.isTransient()) {
      res.write(formatDate(this.created, format || param.format));
   }
   return;
};

HopObject.prototype.modified_macro = function(param, format) {
   if (this.modified && !this.isTransient()) {
      res.write(formatDate(this.modified, format || param.format));
   }
   return;
};

HopObject.prototype.creator_macro = function(param, mode) {
   if (!this.creator || this.isTransient()) {
      return;
   }
   mode || (mode = param.as);
   if (mode === "link" && this.creator.url) {
      html.link({href: this.creator.url}, this.creator.name);
   } else if (mode === "url") {
      res.write(this.creator.url);
   } else {
      res.write(this.creator.name);
   } return;
};

HopObject.prototype.modifier_macro = function(param, mode) {
   if (!this.modifier || this.isTransient()) {
      return;
   }
   mode || (mode = param.as);
   if (mode === "link" && this.modifier.url) {
      html.link({href: this.modifier.url}, this.modifier.name);
   } else if (mode === "url") {
      res.write(this.modifier.url);
   } else {
      res.write(this.modifier.name);
   }
   return;
};

HopObject.prototype.getTitle = function() {
   return this.title || this.__name__.capitalize();
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
   this[name + "_macro"] = function(param) {
      var value;
      if (value = this[name]) {
         res.write(value);
      }
      return;
   };
   return;
};

HopObject.getFromPath = function(name, collection) {
   var site;
   if (name.contains("/")) {
      var parts = name.split("/");
      site = root.get(parts[0]);
      name = parts[1];
   } else {
      site = res.handlers.site;
   }
   if (site && site.getPermission("main")) {
      return site[collection].get(name);
   }
   return null;
};
