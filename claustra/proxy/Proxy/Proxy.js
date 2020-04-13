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
 * @fileoverview Defines the Antville proxy Feature.
 */

"http://code.google.com/p/antville/wiki/ProxyFeature"

Proxy.prototype.main_action = function () {
  const url = req.data.url;

  if (!url) return;

  const callback = req.data.callback;
  const http = new helma.Http();

  http.setBinaryMode(true);

  http.setHeader('Accept', '*/*');
  http.setHeader('Accept-Encoding', 'gzip');
  http.setHeader('Cache-Control', 'no-cache');
  http.setHeader('Pragma', 'no-cache');
  http.setHeader('User-Agent', req.data.http_browser);

  const data = http.getUrl(url);

  if (!data.content) {
    throw Error('Failed to retrieve URL.');
  }

  if (callback) {
    res.contentType = 'application/javascript';

    let content = new java.lang.String(data.content, 'utf-8');

    if (!data.type.startsWith('text/')) {
      content = new java.lang.String(content.enbase64());
    }

    // The String() call prevents stack overflow
    res.write(JSON.pad(String(content), callback));
  } else {
    res.contentType = data.type;

    if (data.type.startsWith('text/')) {
      res.write(java.lang.String(data.content, 'utf-8'));
    } else {
      res.writeBinary(data.content);
    }
  }
};

Proxy.prototype.getPermission = function() {
  return User.require(User.REGULAR);
};
