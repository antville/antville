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
//   http://www.apache.org/licenses/LICENSE-2.0
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
 * @fileoverview Defines the Antville reCAPTCHA Feature.
 * @see http://www.google.com/recaptcha
 */

Feature.add("recaptcha", "http://code.google.com/p/antville/wiki/RecaptchaFeature", new function() {
  var key = getProperty("recaptcha.key");

  return {
    main: function() {
      if (key && !session.user) {
        renderSkin("recaptcha", {id: getProperty("recaptcha.id")});
      }
      return;
    },

    verify: function(data) {
      if (session.user) {
        return;
      }
      var http = new helma.Http;
      http.setTimeout(200);
      http.setReadTimeout(300);
      http.setMethod("POST");
      http.setContent({
        privatekey: key,
        remoteip: req.data.http_remotehost,
        challenge: data.recaptcha_challenge_field,
        response: data.recaptcha_response_field
      });
      var request = http.getUrl("http://www.google.com/recaptcha/api/verify");
      if (request.code === 200 && !request.content.startsWith("true")) {
        throw Error(gettext("Please enter the correct words in the CAPTCHA box."));
      }
      return;
    }
  }
});
