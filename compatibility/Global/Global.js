Metadata.prototype.getProperty = Metadata.prototype.get;
Metadata.prototype.setProperty = Metadata.prototype.set;
Metadata.prototype.setAll = Metadata.prototype.setData;

Metadata.prototype.createInputParam = function(propName, param) {
   param.name = this.__name__ + "_" + propName;
   if (!req.data[param.name + "_array"] && req.data[param.name] != null)
      param.value = req.data[param.name];
   else
      param.value = this.get(propName);
   delete param.as;
   return param;
};

Metadata.prototype.createCheckBoxParam = function(propName, param) {
   param.name = this.__name__ + "_" + propName;
   param.value = 1;
   if (req.data[param.name] == 1 || this.get(propName) == 1)
      param.checked = "checked";
   delete param.as;
   return param;
};
