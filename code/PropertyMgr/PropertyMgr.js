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

/**
  * returns the property of this object, creates the cache object
  * if necessary or reloads it if the raw content field was changed
  * (this can happen when if the parent object was edited somewhere
  * else and got invalidated in this app).
  * @arg key
  * @returns content
  */
PropertyMgr.prototype.getProperty = function(key) {
   this.evalCache();
   return this.cache.content[key];
};

/**
  * sets a property of the cache object and updates the xml-content
  * at the parent object.
  * @arg key only values starting with letters are accepted
  * @arg value
  * @returns false if key is invalid
  */
PropertyMgr.prototype.setProperty = function(key, value) {
   if (!key)
      return false;
   this.evalCache();
   this.cache.content[key] = value.trim();
   this._parent[this.getDataField ()] = Xml.writeToString (this.cache.content);
};

/**
  * deletes a property of the cache object and updates the xml-content
  * at the parent object
  * @param key
  */
PropertyMgr.prototype.deleteProperty = function(key) {
   this.evalCache();
   this.cache.content[key] = null;
   delete this.cache.content[key];
   this._parent[this.getDataField()] = Xml.writeToString(this.cache.content);
};

/**
  * @returns an array of all keys in this object
  */
PropertyMgr.prototype.keys = function() {
   this.evalCache();
   var arr = new Array();
   for (var i in this.cache.content) {
      arr[arr.length] = i;
   }
   return arr;
};

/**
  * deletes this object's cache
  */
PropertyMgr.prototype.reset = function() {
   this.cache.content = null;
   this.cache.rawcontent = null;
};

/**
  * checks if the cache is still up to date and
  * (re-)creates the cache if necessary
  */
PropertyMgr.prototype.evalCache = function() {
   if (this.cache.content == null ||
       this.cache.content.__lastModified__.getTime() < this._parent.__lastModified__.getTime()) {
      var fieldName = this.getDataField();
      // cache is either outdated or not existing, so (re-)create it
      if (this._parent[fieldName] && this._parent[fieldName].trim() != "") {
         this.cache.rawcontent = this._parent[fieldName];
         this.cache.content = Xml.readFromString(this.cache.rawcontent);
      } else {
         this.cache.rawcontent = "";
         this.cache.content = new HopObject();
      }
   }
   return;
};

/**
  * get the field of the parent object that holds the xml-content
  * for this object. The name of the xml-field is constructed out of
  * the name of the mountpoint (this.__name__) and "_xml".
  */
PropertyMgr.prototype.getDataField = function() {
   return this.__name__ + "_xml";
};

/**
  * for debugging
  * @returns the content of this object as text with linebreaks
  */
PropertyMgr.prototype.toString = function() {
   res.push();
   var arr = this.keys();
   arr.sort();
   for (var i in arr) {
      res.write("property ");
      res.write(arr[i]);
      res.write(" = ");
      res.write(this.getProperty(arr[i]));
      res.write("\n");
   }
   return res.pop();
};

/**
 * creates parameter object based on xml-encoded property
 * that will be passed to function that renders the input element
 * @see hopobject.createInputParam
 * @param String Name of the xml-encoded property
 * @param Obj Parameter-Object containing optional attributes for rendering
 * @return Obj Parameter-Object for Input
 */
PropertyMgr.prototype.createInputParam = function(propName, param) {
   param.name = this.__name__ + "_" + propName;
   if (!req.data[param.name + "_array"] && req.data[param.name] != null)
      param.value = req.data[param.name];
   else
      param.value = this.getProperty(propName);
   delete param.as;
   return param;
};

/**
 * create a parameter object for checkboxes
 */
PropertyMgr.prototype.createCheckBoxParam = function(propName, param) {
   param.name = this.__name__ + "_" + propName;
   param.value = 1;
   if (req.data[param.name] == 1 || this.getProperty(propName) == 1)
      param.checked = "checked";
   delete param.as;
   return param;
};

/**
 * function returns the whole xml encoded HopObject
 */
PropertyMgr.prototype.getAll = function() {
   this.evalCache();
   return this.cache.content;
};

/**
 * function replaces the whole xml encoded HopObject with
 * a new one passed as argument
 * @param Obj HopObject to store xml encoded
 * @param Boolean true in case of no error, false otherwise
 */
PropertyMgr.prototype.setAll = function(obj) {
   if (!obj)
      return false;
   this._parent[this.getDataField()] = Xml.writeToString(obj);
   this.cache.content = obj;
   return true;
};

/**
 * return the last modified timestamp of the content cache
 */
PropertyMgr.prototype.getLastModified = function() {
   return this.cache.__lastModified__;
};
