/**
 * function renders the createtime of this log-entry
 */

function createtime_macro(param) {
   res.write(param.format ? this.createtime.format(param.format) : this.createtime);
}