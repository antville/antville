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

HopObject.remove = function(collection) {
   var item;
   while (collection.size() > 0) {
      item = collection.get(0);
      if (item.constructor.remove) {
         item.constructor.remove.call(item, item);
      }
   }
   return;
}

HopObject.getFromPath = function(name, collection) {
   if (name) {
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
   }
   return null;
}

HopObject.prototype.map = function(values) {
   for (var i in values) {
      this[i] = values[i];
   }
   return;
}

HopObject.prototype.onRequest = function() {
   // Checking if we are on the correct host to prevent at least some XSS issues
   if (req.action !== "notfound" && req.action !== "error" && this.href().startsWith("http://") && 
         !this.href().toLowerCase().startsWith(req.servletRequest.scheme + 
         "://" + req.servletRequest.serverName.toLowerCase())) {   
      res.redirect(this.href(req.action === "main" ? String.EMPTY : req.action));
   }

   User.autoLogin();
   res.handlers.membership = User.getMembership();
   
   if (User.getCurrentStatus() === User.BLOCKED) {
      User.logout();
      res.status = 401;
      res.writeln(gettext("Sorry, your account has been blocked."));
      res.writeln(gettext("Please contact the maintainer of this site for further information."));
      res.stop();
   }
   
   if (res.handlers.site.status === Site.BLOCKED && 
         !User.require(User.PRIVILEGED)) {
      res.status = 401;
      res.writeln(gettext("Sorry, this site has been blocked."));
      res.writeln(gettext("Please contact the maintainer of this site for further information."));
      res.stop();
   }

   if (!this.getPermission(req.action)) {
      if (!session.user) {
         User.setLocation(root.href() + req.path);
         res.message = gettext("Please login first.");
         res.redirect(res.handlers.site.members.href("login"));
      }
      User.getLocation();
      res.status = 401;
      res.write(gettext("Sorry, you are not allowed to access this part of the site."));
      res.stop();
   }
   
   res.handlers.layout = res.handlers.site.layout || new Layout;
   res.skinpath = res.handlers.layout.getSkinPath();

   res.meta.values = {};
   res.handlers.site.renderSkinAsString("Site#values");
   return;
}

HopObject.prototype.getPermission = function() {
   return true;
}

HopObject.prototype.delete_action = function() {
   if (req.postParams.proceed) {
      try {
         var str = this.toString();
         var parent = this._parent;
         var url = this.constructor.remove.call(this, this) || parent.href();
         res.message = gettext("{0} was successfully deleted.", str);
         res.redirect(User.getLocation() || url);
      } catch(ex) {
         res.message = ex;
         app.log(ex);
      }
   }

   res.data.action = this.href(req.action);
   res.data.title = gettext("Confirm deletion of {0}", this);
   res.data.body = this.renderSkinAsString("$HopObject#confirm", {
      text: gettext('You are about to delete {0}.', this)
   });
   res.handlers.site.renderSkin("Site#page");
   return;
}

HopObject.prototype.touch = function() {
   return this.map({
      modified: new Date,
      modifier: session.user
   });
}

HopObject.prototype.log = function() {
   var entry = new LogEntry(this, "main");
   app.data.entries.push(entry);
   return;
}

HopObject.prototype.notify = function(action) {
   var site = res.handlers.site;
   if (site.notificationMode === Site.NOBODY) {
      return;
   }
   switch (action) {
      case "comment":
      action = "create"; break;
   }
   var membership;
   var currentMembership = res.handlers.membership;
   for (var i=0; i<site.members.size(); i+=1) {
      res.handlers.membership = membership = site.members.get(i);
      if (membership.require(site.notificationMode)) {
         sendMail(root.email, membership.creator.email,
               gettext("Notification of changes at site {0}", site.title),
               this.renderSkinAsString("$HopObject#notify_" + action));
      }
   }
   res.handlers.membership = currentMembership;
   return;
}

HopObject.prototype.getTags = function() {
   var tags = [];
   if (typeof this.tags === "object") {
      this.tags.list().forEach(function(item) {
         item.tag && tags.push(item.tag.name);
      });
   }
   return tags;
}

HopObject.prototype.setTags = function(tags) {
   if (typeof this.tags !== "object") {
      return String.EMPTY;
   }

   if (!tags) {
      tags = [];
   } else if (tags.constructor === String) {
      tags = tags.split(/\s*,\s*/);
   }
   
   var diff = {};
   var tag;
   for (var i in tags) {
      // Trim and remove troublesome characters  (like ../.. etc.)
      // We call getAccessName with a virgin HopObject to allow most names
      tag = tags[i] = this.getAccessName.call(new HopObject, File.getName(tags[i]));
      if (tag && diff[tag] == null) {
         diff[tag] = 1;
      }
   }
   this.tags.forEach(function() {
      if (!this.tag) {
         return;
      }
      diff[this.tag.name] = (tags.indexOf(this.tag.name) < 0) ? this : 0;
   });
   
   for (var tag in diff) {
      switch (diff[tag]) {
         case 0:
         // Do nothing (tag already exists)
         break;
         case 1:
         // Add tag to story
         this.addTag(tag);
         break;
         default:
         // Remove tag
         this.removeTag(diff[tag]);
      }
   }
   return;
}

HopObject.prototype.addTag = function(name) {
   this.tags.add(new TagHub(name, this, session.user));
   return;
}

HopObject.prototype.removeTag = function(tag) {
   var parent = tag._parent;
   if (parent.size() === 1) {
      parent.remove();
   }
   tag.remove();
   return;
}

HopObject.prototype.skin_macro = function(param, name) {
   if (!name) {
      return;
   }
   if (name.contains("#")) {
      this.renderSkin(name);
   } else {
      var prototype = this._prototype || "Global";
      this.renderSkin(prototype + "#" + name);
   }
   return;
}

HopObject.prototype.input_macro = function(param, name) {
   param.name = name;
   param.id = name;
   param.value = this.getFormValue(name);
   return html.input(param);
}

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
}

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
   html.checkBox(param);
   if (label) {
      html.element("label", label, {"for": name});
   }
   return;
}

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
}

HopObject.prototype.upload_macro = function(param, name) {
   param.name = name;
   param.id = name;
   param.value = this.getFormValue(name);
   renderSkin("$Global#upload", param);
   return;
}

HopObject.prototype.macro_macro = function(param, handler) {
   var ctor = this.constructor;
   if ([Story, Image, File, Poll].indexOf(ctor) > -1) {
      res.encode("<% ");
      res.write(handler || ctor.name.toLowerCase());
      res.write(String.SPACE);
      res.write(quote(this.name || this._id));
      res.encode(" %>");
   }
   return;
}

HopObject.prototype.kind_macro = function() {
   var type = this.constructor.name.toLowerCase();
   switch (type) {
      default:
      res.write(gettext(type));
      break;
   }
   return;
}

HopObject.prototype.getFormValue = function(name) {
   if (req.isPost()) {
      return req.postParams[name];
   } else {
      var value = this[name] || req.queryParams[name] || String.EMPTY;
      return value instanceof HopObject ? value._id : value;
   }
}

HopObject.prototype.getFormOptions = function(name) {
   return [{value: true, display: "enabled"}];
}

HopObject.prototype.self_macro = function() {
   return this;
}

HopObject.prototype.type_macro = function() {
   return res.write(this.constructor.name);
}

HopObject.prototype.link_macro = function(param, url, text) {
   url || (url = ".");
   var action = url.split(/#|\?/)[0];
   if (this.getPermission(action)) {
      text || (text = (action === "." ? this._id : action).capitalize());
      renderLink.call(global, param, url, gettext(text), this);
   }
   return;
}

HopObject.prototype.created_macro = function(param, format) {
   if (this.isPersistent()) {
      format || (format = param.format);
      res.write(formatDate(this.created, format));
   }
   return;
}

HopObject.prototype.modified_macro = function(param, format) {
   if (this.isPersistent()) {
      format || (format = param.format);
      res.write(formatDate(this.modified, format));
   }
   return;
}

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
}

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
}

HopObject.prototype.getTitle = function() {
   return this.title || this.__name__.capitalize();
}

HopObject.prototype.toString = function() {
   return this.constructor.name + " #" + this._id;
}

/*HopObject.prototype.valueOf = function() {
   return this._id;
};*/

HopObject.prototype.link_filter = function(value, param, action) {
   action || (action = ".");
   res.push();
   renderLink(param, action, value, this);
   return res.pop();
}

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
}
