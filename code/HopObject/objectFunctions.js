/**
 * renders single dropdown
 * input values:  current Timestamp
 */

function createDDparam(prefix,ts,dropFormat) {
   var ddParam = new HopObject();
   if (dropFormat == "dd") {
      ddParam.name = prefix + "Date";
      ddParam.firstOption = "Day";
      ddParam.currValue = ts ? ts.getDate() : null;
      ddParam.start = 1;
      ddParam.end = 31;
   } else if (dropFormat == "MM") {
      ddParam.name = prefix + "Month";
      ddParam.firstOption = "Month";
      ddParam.currValue = ts ? ts.getMonth() : null;
      ddParam.start = 1;
      ddParam.end = 12;
      ddParam.valueOffset = -1;
   } else if (dropFormat == "yyyy") {
      ddParam.name = prefix + "Year";
      ddParam.firstOption = "Year";
      ddParam.currValue = ts ? ts.getFullYear() : null;
      ddParam.start = 2000;
      ddParam.end = 2010;
   } else if (dropFormat == "HH") {
      ddParam.name = prefix + "Hours";
      ddParam.firstOption = "Hour";
      ddParam.currValue = ts ? ts.getHours() : null;
      ddParam.start = 0;
      ddParam.end = 23;
   } else if (dropFormat == "mm") {
      ddParam.name = prefix + "Minutes";
      ddParam.firstOption = "Minute";
      ddParam.currValue = ts ? ts.getMinutes() : null;
      ddParam.start = 0;
      ddParam.end = 59;
   } else if (dropFormat == "ss") {
      ddParam.name = prefix + "Seconds";
      ddParam.firstOption = "Second";
      ddParam.currValue = ts ? ts.getSeconds() : null;
      ddParam.start = 0;
      ddParam.end = 59;
   }
   this.createDDOptions(ddParam);
   return;
}


/**
 * function creates array for rendering options
 */

function createDDOptions(ddParam) {
   if (ddParam.firstOption) {
      ddParam.add(this.createDDOption(ddParam.firstOption,""));
   }
   for (var i=ddParam.start;i<=ddParam.end;i++) {
      var name = (i<10 ? "0" + i : i);
      var value = (ddParam.valueOffset ? i+ddParam.valueOffset : i);
      var sel = (ddParam.currValue == value ? true : false);
      ddParam.add(this.createDDOption(name, value, sel));
   }
   this.chooser(ddParam);
}

/**
 * function creates a single option-object for creation of select-dropdowns
 */

function createDDOption(name,value,sel) {
   var opt = new HopObject()
   opt.name = name;
   opt.value = value;
   opt.selected = sel;
   return (opt);
}

/**
 * creates parameter-object that will be passed to
 * function that renders the input
 */

function createInputParam(propName,param) {
   var inputParam = new Object();
   inputParam.name = propName;
   for (var i in param)
      inputParam[i] = param[i];
   inputParam.value = this[propName];
   return (inputParam);
}

