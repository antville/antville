// The Antville Project
// http://code.google.com/p/antville
//
// Copyright 2007-2011 by Tobi Schäfer.
//
// Copyright 2001–2007 Robert Gaggl, Hannes Wallnöfer, Tobi Schäfer,
// Matthias & Michael Platzer, Christoph Lincke.
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
// $Author$
// $Date$
// $URL$

/**
 * @fileoverview Defines the Antville Connect Feature.
 */

app.addRepository(app.dir + "/../extra/connect/scribe-1.2.0.jar");

// FIXME: Connecting with Twitter and Google currently does not return an e-mail address.
// Instead, noreplay@antville.org is used – which is very poor and should be fixed ASAP.

// FIXME: Might be good to somehow define the action together with its permissions...
Members.prototype.connect_action = function() {
   try {
      var connect = Feature.get("connect");
      switch (req.data.type) {
         case "facebook":
         connect.facebook(req);
         break;
         case "google":
         case "twitter":
         connect.scribe(req.data.type);
         break;
         case "google-dev":
         connect.google(req);
         break;
      }
   } catch (ex) {
      session.logout();
      res.message = String(ex);
      res.redirect(res.handlers.members.href("login"));
   }
   JSON.sendPaddedResponse(this._parent.stories.getPermission("create"));
   res.redirect(User.getLocation() || res.handlers.site.href());
   return;
}

Members.prototype.disconnect_action = function() {
   switch (req.data.type) {
      case "facebook":
      case "google":
      case "twitter":
      res.handlers.membership.user.deleteMetadata(req.data.type + "_id");
      break;
   }
   res.redirect(req.data.http_referer);
   return;
}

Feature.add("connect", "http://code.google.com/p/antville/wiki/ConnectFeature", {
   _getPermission: function(action) {
      if (this.constructor === Members) {
         switch (action) {
            case "connect":
            return true;
            case "disconnect":
            return User.require(User.REGULAR);
         }
      }
   },

   main: function(options) {
      var defaultDomain = getProperty("domain.*");
      if (defaultDomain && defaultDomain !== req.data.http_host) {
         return;
      }
      var suffix = options.context ? "_" + options.context : "";
      getProperty("connect.facebook.id") && renderSkin("connect#facebook" + suffix);
      getProperty("connect.google.id") && renderSkin("connect#google" + suffix);
      getProperty("connect.twitter.id") && renderSkin("connect#twitter" + suffix);
   },

   getUserByConnection: function(type, id) {
      var user;
      var connections = root.connections.get(id);
      if (connections) {
         connections.list().some(function(metadata, index) {
            if (metadata.name === type + "_id") {
               user = metadata.parent;
            }
         });
      }
      return user;
   },

   scribe: function(type) {
      var name = type.titleize();
      var appId = getProperty("connect." + type + ".id");
      var secret = getProperty("connect." + type + ".key");

      if (!secret || req.data.denied) {
         throw Error(gettext("Connecting with {0} failed. {1} Please try again.", name,
               gettext("You denied the request.")));
      }

      if (req.isPost()) {
         try {
            User.login(req.postParams);
         } catch (ex) { }
      }

      var scribe = Packages.org.scribe;
      var provider, requestUrl, scope, getValues;
      var headers = {};

      switch (type) {
         case "google":
         provider = scribe.builder.api.GoogleApi;
         requestUrl = "http://www-opensocial.googleusercontent.com/api/people/@me/@self";
         scope = "http://www-opensocial.googleusercontent.com/api/people/";
         headers["GData-Version"] = "3.0";
         getValues = function(data) {
            data = data.entry;
            return {
               id: data.id,
               name: data.displayName,
               email: data.email,
               url: data.url
            }
         }
         break;

         case "twitter":
         provider = scribe.builder.api.TwitterApi;
         requestUrl = "https://api.twitter.com/1/account/verify_credentials.json";
         getValues = function(data) {
            return {
               id: data.id_str,
               name: data.screen_name,
               email: data.email,
               url: data.profileUrl
            }
         }
         break;
      }

      var url = res.handlers.members.href(req.action) + "?type=" + type;

      var service = new scribe.builder.ServiceBuilder()
            .provider(provider)
            .apiKey(appId)
            .apiSecret(secret)
            .callback(url);

      if (scope) {
         service.scope(scope);
      }

      var oauth = service.build();
      
      var verifier = req.data.oauth_verifier;
      if (!verifier) {
         // Because the service provider will redirect back to this URL the
         // request token needs to be stored in the session object
         session.data.requestToken = oauth.getRequestToken();
         res.redirect(oauth.getAuthorizationUrl(session.data.requestToken));
      }

      try {
         var accessToken = oauth.getAccessToken(session.data.requestToken,
               new scribe.model.Verifier(verifier));
      } catch (ex) {
         throw Error(gettext("Connecting with {0} failed. {1} Please try again.", name,
               gettext("Something went wrong.")));
      }

      var request = new scribe.model.OAuthRequest(scribe.model.Verb.GET, requestUrl);
      oauth.signRequest(accessToken, request);
      for (let name in headers) {
         request.addHeader(name, headers[name]);
      }
      var response = request.send();

      var data = getValues(JSON.parse(response.getBody()));
      var user = this.getUserByConnection(type, data.id);
      if (!user) {
         if (!session.user) {
            var name = root.users.getAccessName(data.name);
            user = User.register({
               name: name,
               hash: session.data.requestToken.getToken(),
               email: data.email || root.replyTo,
               url: data.url
            });
            session.login(user);
         } else {
            user = session.user;
         }
         user.setMetadata(type + "_id", data.id);
      } else if (user !== session.user) {
         session.login(user);
      }

      return;
  },

   facebook: function(req) {
      var appId = getProperty("connect.facebook.id");
      var secret = getProperty("connect.facebook.key");
      if (!secret || req.data.error) {
         throw Error(gettext("Could not connect with Facebook. ({0})", -1));
      }

      if (req.isPost()) {
         try {
            User.login(req.postParams);
         } catch (ex) { }
      }

      var url = res.handlers.members.href(req.action) + "?type=facebook";

      var code = req.data.code;
      if (!code) {
         res.redirect("https://www.facebook.com/dialog/oauth?client_id=" + appId +
               "&scope=email&redirect_uri=" + url);
         return;
      }

      var mime = getURL("https://graph.facebook.com/oauth/access_token?client_id=" + appId +
            "&redirect_uri=" + url + "&client_secret=" + secret + "&code=" + code);

      if (!mime || !mime.text) {
         throw Error(gettext("Could not connect with Facebook. ({0})", -3));
      }

      var token = mime.text;
      mime = getURL("https://graph.facebook.com/me?" + token);

      if (!mime || !mime.text) {
         throw Error(gettext("Could not connect with Facebook. ({0})", -4));
      }

      var data = JSON.parse(mime.text);
      var user = this.getUserByConnection("facebook", data.id);
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
         user.setMetadata("facebook_id", data.id);
      } else if (user !== session.user) {
         session.login(user);
      }

      return;
   },
   
   google: function(req) {
      var url = encodeURIComponent("http://macke.antville.org/helma/antville/members/connect?type=google2");
      if (req.data.code) {
         var http = new helma.Http();
         http.setMethod("POST");
         http.setContent("code=" + encodeURIComponent(req.data.code) + 
               "&client_id=1098119775742.apps.googleusercontent.com&client_secret=ZfK_TVq6ruwoN_upS7x1CScV&" + 
               "redirect_uri=" + url + "&grant_type=authorization_code");
         var response = http.getUrl("https://accounts.google.com/o/oauth2/token");
         var data = JSON.parse(response.content);
         res.debug(data.toSource());
         var mime = getURL("https://www.google.com/m8/feeds/contacts/default/full?oauth_token=" + 
               encodeURIComponent(data.access_token));
         var xml = Packages.org.apache.commons.io.IOUtils.toString(mime.inputStream);
         var data = Xml.getFromString(xml);
         res.debug(data.toSource());
         res.debug(xml);
         res.abort()
      } else if (req.data.error) {

      } else {
         res.redirect("https://accounts.google.com/o/oauth2/auth?" + 
               "client_id=1098119775742.apps.googleusercontent.com&" + 
               "redirect_uri=" + url + "&" +
               "scope=https://www.google.com/m8/feeds/&" +
               "response_type=code");
      }      
   }
});
