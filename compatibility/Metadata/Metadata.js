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

Metadata.prototype.getProperty = Metadata.prototype.get;
Metadata.prototype.setProperty = Metadata.prototype.set;
Metadata.prototype.setAll = Metadata.prototype.setData;

Metadata.prototype.createInputParam = function(propName, param) {
   param.name = Metadata.PREFIX + propName;
   if (!req.data[param.name + "_array"] && req.data[param.name] != null)
      param.value = req.data[param.name];
   else
      param.value = this.get(propName);
   delete param.as;
   return param;
};

Metadata.prototype.createCheckBoxParam = function(propName, param) {
   param.name = Metadata.PREFIX + propName;
   param.value = 1;
   if (req.data[param.name] == 1 || this.get(propName) == 1)
      param.checked = "checked";
   delete param.as;
   return param;
};
