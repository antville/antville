/**
 * function filters imagepool
 */

function filter() {
   this.subnodeRelation = " where WEBLOG_ID = " + path.weblog.__id__ + " and PARENT_ID is null order by CREATETIME desc";
}