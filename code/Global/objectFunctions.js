/**
 * check if email-adress is syntactically correct
 */

function checkEmail(address) {
   var m = new Mail();
   m.addTo(address);
   if (m.status)
      return false;
   return true;
}


/**
 * function checks if req.data.date[Year|Month|Date|Hours|Minutes] is valid
 * if correct, creates dateobject and returns it
 * otherwise false
 */

function checkDate() {
   if (req.data.dateYear && req.data.dateMonth && req.data.dateDate && req.data.dateHours && req.data.dateMinutes) {
      var ts = new Date();
      ts.setYear(parseInt(req.data.dateYear));
      ts.setMonth(parseInt(req.data.dateMonth));
      ts.setDate(parseInt(req.data.dateDate));
      ts.setHours(parseInt(req.data.dateHours));
      ts.setMinutes(parseInt(req.data.dateMinutes));
      ts.setSeconds(0);
      return (ts);
   } else
      return false;
}

/**
 * scheduler, basically doin' nothing
 */

function scheduler() {
   return;
}

/**
 * onStart-function, basically doin' nothing
 */

function onStart() {
   return;
}