//
// The Antville Project
// http://code.google.com/p/antville
//
// Copyright 2001-2011 by The Antville People
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
 * @fileoverview Defines the Antville Connect Feature.
 */

// FIXME: Remove ASAP (testing only)
Feature.remove();

var connect = new Feature("Antville Connect", "http://code.google.com/p/antville/wiki/connect",
      "Connecting Antville with Facebook");

connect.handle("getPermission", function(action) {
   if (action === "connect") {
      return true;
   }
});

Members.prototype.connect_action = function() {
   switch (req.data.type) {
      case "facebook":
      return connect[req.data.type].call(this, req);
      break;
   }
   return null;
}

connect.facebook = function(req) {
   var url = path.href(req.action) + "?type=facebook";
   var loginUrl = res.handlers.members.href("login");

   var appId = 160722163980484;
   var secret = getProperty("connect.facebook.secret");

   if (!secret) {
      res.message = gettext("Could not connect with Facebook. ({0})", 1);
      res.redirect(loginUrl);
   }

   if (req.isPost()) {
      try {
         var user = User.login(req.postParams);
      } catch (ex) {
         // If login fails just continue and try to authenticate with Facebook
      }
      res.redirect("https://www.facebook.com/dialog/oauth?client_id=" + appId +
            "&scope=email&redirect_uri=" + url);
      return;
   }

   var code = req.data.code;

   if (code) {
      var response = getURL("https://graph.facebook.com/oauth/access_token?client_id=" + appId +
            "&redirect_uri=" + url + "&client_secret=" + secret + "&code=" + code);

      if (!response || !response.text) {
         res.message = gettext("Could not connect with Facebook. ({0})", 2);
         session.logout();
         res.redirect(loginUrl);
         return;
      }

      var token = response.text;
      response = getURL("https://graph.facebook.com/me?" + token);

      if (response && response.text) {
         var data = response.text.parseJSON();
         var connection = root.connections.get(data.id);
         var user = connection && connection.parent;
         if (!user) {
            if (!session.user) {
               var name = root.users.getAccessName(data.name);
               user = User.register({
                  name: name,
                  hash: token,
                  email: data.email,
                  url: data.link,
               });
               session.login(user);
            } else {
               user = session.user;
            }
            user.setMetadata({"connection_type": "facebook", "connection_id": data.id});
         } else if (user !== session.user) {
            session.login(user);
         }
         res.handlers.membership = User.getMembership();
      }
      res.redirect(User.getLocation() || res.handlers.site.href());
   }

   if (req.data.error) {
      res.message = gettext("Could not connect with Facebook. ({0})", 3);
   }
   session.logout()
   res.redirect(loginUrl);
   return;
}

// FIXME: Maybe useful for future autoLogin via cookie?
/*if (!token) {
   var cookie = req.cookies["fbs_" + appId];
   if (cookie) {
      var parts = cookie.split("&");
      for each (let part in parts) {
         let pair = part.split("=");
         if (pair[0] === "access_token") {
            token = pair[1];
            break;
         }
      }
   }
}*/
