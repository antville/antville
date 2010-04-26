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

app.addRepository("modules/helma/Color.js");

var disableAction = function(msg) {
   res.data.title = msg + " :(";
   res.data.body = msg + ". " + "Sorry.";
   this.renderSkin("Site#page");
   return;
}

var relocateProperty = function(proto, name, key) {
   if (!proto || !name) {
      return;
   }
   key || (key = name);
   proto.prototype.__defineGetter__(name, function() {
      return this[key];
   });
   proto.prototype.__defineSetter__(name, function(value) {
      this[key] = value;
      return;
   });
   return addPropertyMacro.apply(this, arguments);
}

var addPropertyMacro = function(proto, name, key) {
   // These two are managed by the HopObject prototype already
   if (name === "createtime" || name === "modifytime") {
      return;
   }
   key || (key = name);
   proto.prototype[name + "_macro"] = function(param) {
      if (param.as === "editor") {
         this.input_macro(param, key);
      } else {
         res.write(this[key]);
      }
   };
   return;
}

var formatTimestamp = function() {
   return formatDate.apply(this, arguments);
}

var linkedpath_macro = breadcrumbs_macro;

function link_macro() {
   var param = arguments[0];
   if (param.to) {
      param.url = param.to;
      delete param.to;
   }
   return renderLink.apply(this, arguments);
}

function logo_macro(param, name) {
   param.linkto = "http://antville.org"; 
   image_macro.call(global, param, "/" + (name || param.name || "smallchaos"));
   return;
}

function input_macro(param) {
   switch (param.type) {
      case "button":
      break;
      
      case "radio":
      param.selectedValue = req.data[param.name]; break;
      
      default:
      param.value = param.name && req.data[param.name] ? 
            req.data[param.name] : param.value;
   }

   switch (param.type) {
      case "textarea" :
      html.textArea(param); break;
      
      case "checkbox" :
      html.checkBox(param); break;
      
      case "button" :
      // FIXME: this is left for backwards compatibility
      html.submit(param); break;
      
      case "submit" :
      html.submit(param); break;
      
      case "password" :
      html.password(param); break;
      
      case "radio" :
      html.radioButton(param); break;
      
      case "file" :
      html.file(param); break;
      
      default :
      html.input(param);
   }
   return;
}

// FIXME: This method deserves some more compatibility pampering
// (eg. itempre/suffix)
function storylist_macro(param) {
   var id = param.of ? param.of + "/stories" : "stories";
   return list_macro(param, id, param.limit);
}

function sitelist_macro(param) {
   param.limit || (param.limit = 10);
   return list_macro(param, "updates", Math.min(param.limit, 25));
}

// FIXME: This method deserves some more compatibility pampering
// (eg. itempre/suffix, as="thumbnail")
function imagelist_macro(param) {
   var id = param.of ? param.of + "/images" : "images";
   return list_macro(param, id, param.limit);
}

// FIXME: This method deserves some more compatibility pampering
// (eg. itempre/suffix, limit)
function topiclist_macro(param) {
   var site = param.of ? root.get(param.of) : res.handlers.site;
   if (site) {
      site.tags.list_macro(param, param.skin);
   }
   return;
}

function username_macro(param) {
   if (!session.user) {
      return;
   }
   if (session.user.url && param.as === "link") {
      html.link({href: session.user.url}, session.user.name);
   } else if (session.user.url && param.as === "url") {
      res.write(session.user.url);
   } else {
      res.write(session.user.name);
   }
   return;
}

function spacer_macro(param) {
   param.width || (param.width = 2);
   param.height || (param.height = 2);
   param.border || (param.border = 0);
   param.alt = "";
   param.name = "/pixel.gif";
   return image_macro(param);
}

function fakemail_macro(param) {
	var tldList = ["com", "net", "org", "mil", "edu", "de", "biz", "de", "ch", 
	      "at", "ru", "de", "tv", "com", "st", "br", "fr", "de", "nl", "dk", 
	      "ar", "jp", "eu", "it", "es", "com", "us", "ca", "pl"];
   var nOfMails = param.number ? (param.number <= 50 ? param.number : 50) : 20;
   for (var i=0;i<nOfMails;i++) {
   	var tld = tldList[Math.floor(Math.random()*tldList.length)];
   	var mailName = "";
      var serverName = "";
   	var nameLength = Math.round(Math.random()*7) + 3;
   	for (var j=0;j<nameLength;j++)
   		mailName += String.fromCharCode(Math.round(Math.random()*25) + 97);
   	var serverLength = Math.round(Math.random()*16) + 8;
   	for (var j=0;j<serverLength;j++)
   		serverName += String.fromCharCode(Math.round(Math.random()*25) + 97);
      var addr = mailName + "@" + serverName + "." + tld;
      html.link({href: "mailto:" + addr}, addr);
      if (i+1 < nOfMails)
         res.write(param.delimiter ? param.delimiter : ", ");
   }
	return;
}

// FIXME: This cannot be working...
function imageoftheday_macro(param) {
   var images = res.handlers.site.images;
   delete param.topic;
   var img = pool.get(0);
   param.name = img.alias;
   return image_macro(param);
}

var support_macro = new Function;

function renderColorAsString(c) {
   return c && c.isHexColor() ? "#" + c : c;
}

function renderColor(c) {
   return res.write(renderColorAsString(c));
}
