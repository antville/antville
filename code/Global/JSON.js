// Do not enumerate the new JSON methods.
// (These lines are not included in the original code by Crockford.)
Object.prototype.dontEnum('toJSONString');
Object.prototype.dontEnum('parseJSON');

/**
 * Create a JSONP-compatible response from the callback name and the desired data.
 * @param {String} callback The name of the JSONP callback method
 * @param {Object} data An arbitrary JavaScript object
 */
JSON.pad = function(data, callback) {
  if (!callback) {
    return;
  }
  return callback + '(' + JSON.stringify(data) + ')';
}

/**
 * Send a JSONP-compatible response if a the request contains callback data.
 * This works out-of-the-box with jQuery but can be customized using the key argument.
 * @param {Object} data An arbitrary JavaScript object
 * @param {String} key The name of the property in req.data containing the JSONP callback method name
 * @param {Boolean} resume Switch to define whether further processing should be continued or not
 */
JSON.sendPaddedResponse = function(data, key, resume) {
  var callback = req.data[key || 'callback'];
  if (callback) {
    res.contentType = 'text/javascript';
    res.write(JSON.pad(data, callback));
    resume || res.stop();
  }
  return;
}
