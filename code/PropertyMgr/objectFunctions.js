/**
  * returns the property of this object, creates the cache object
  * if necessary or reloads it if the raw content field was changed
  * (this can happen when if the parent object was edited somewhere
  * else and got invalidated in this app).
  * @arg key
  * @returns content
  */
function getProperty(key) {
   this.evalCache();
   return this.cache.content[key];
}

/**
  * sets a property of the cache object and updates the xml-content
  * at the parent object.
  * @arg key only values starting with letters are accepted
  * @arg value
  * @returns false if key is invalid
  */
function setProperty(key, value) {
   if (!key)
      return false;
   this.evalCache();
   this.cache.content[key] = value.trim();
   this._parent[this.getDataField ()] = Xml.writeToString (this.cache.content);
}


/**
  * deletes a property of the cache object and updates the xml-content
  * at the parent object
  * @param key
  */
function deleteProperty(key) {
   this.evalCache();
   this.cache.content[key] = null;
   delete this.cache.content[key];
   this._parent[this.getDataField()] = Xml.writeToString(this.cache.content);
}



/**
  * @returns an array of all keys in this object
  */
function keys() {
   this.evalCache();
   var arr = new Array();
   for (var i in this.cache.content) {
      arr[arr.length] = i;
   }
   return arr;
}



/**
  * deletes this object's cache
  */
function reset() {
   this.cache.content = null;
   this.cache.rawcontent = null;
}




/**
  * checks if the cache is still up to date and
  * (re-)creates the cache if necessary
  */
function evalCache() {
   if (this.cache.content == null) {
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
}



/**
  * get the field of the parent object that holds the xml-content
  * for this object. The name of the xml-field is constructed out of
  * the name of the mountpoint (this.__name__) and "_xml".
  */
function getDataField() {
   return (this.__name__ + "_xml");
}




/**
  * for debugging
  * @returns the content of this object as text with linebreaks
  */
function toString() {
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
}




/**
 * creates parameter object based on xml-encoded property
 * that will be passed to function that renders the input element
 * @see hopobject.createInputParam
 * @param String Name of the xml-encoded property
 * @param Obj Parameter-Object containing optional attributes for rendering
 * @return Obj Parameter-Object for Input
 */
function createInputParam(propName, param) {
   var inputParam = ObjectLib.clone(param);
   inputParam.name = this.__name__ + "_" + propName;
   if (!req.data[inputParam.name + "_array"] && req.data[inputParam.name] != null)
      inputParam.value = req.data[inputParam.name];
   else
      inputParam.value = this.getProperty(propName);
   delete inputParam.as;
   return inputParam;
}

/**
 * function returns the whole xml encoded HopObject
 */
function getAll() {
   this.evalCache();
   return this.cache.content;
}

/**
 * function replaces the whole xml encoded HopObject with
 * a new one passed as argument
 * @param Obj HopObject to store xml encoded
 * @param Boolean true in case of no error, false otherwise
 */
function setAll(obj) {
   if (!obj)
      return false;
   this._parent[this.getDataField()] = Xml.writeToString(obj);
   this.cache.content = obj;
   return true;
}