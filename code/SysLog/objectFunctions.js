/**
 * constructor for a new syslog-object
 * @param String type of modified object
 * @param String name or ID of modified object
 * @param String message to add as log-entry
 * @param Object sysadmin
 */

function constructor (type,object,logentry,sysadmin) {
   this.type = type;
   this.object = object;
   this.logentry = logentry;
   this.sysadmin = sysadmin;
   this.createtime = new Date();
   return;
}