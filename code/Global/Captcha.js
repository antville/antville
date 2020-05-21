// The Antville Project
// http://code.google.com/p/antville
//
// Copyright 2001–2014 by the Workers of Antville.
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

/**
 * @fileoverview Defines the Antville Captcha prototype.
 * @see https://hcaptcha.com
 */

Captcha = {};

Captcha.verify = function (data) {
  const secret = getProperty('captcha.secret');

  if (session.user || !secret) return;

  const response = req.postParams['h-captcha-response'];
  const http = new helma.Http();

  http.setMethod('POST');

  http.setContent({
    response: response,
    secret: secret
  });

  const request = http.getUrl('https://hcaptcha.com/siteverify');
  const validation = JSON.parse(request.content);

  if (!validation.success) {
    throw Error(gettext('Do Androids dream of electric sheep?'));
  }
};

Captcha.render = function(context, skin) {
  const secret = getProperty('captcha.secret');
  if (session.user || !context || !secret) { return; }
  if (!skin) { skin = '$Members#captcha'; }
  return context.renderSkinAsString(skin);
};
