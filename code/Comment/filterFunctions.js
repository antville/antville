/**
 * function filters comments
 * only toplevel-comments should appear as subnodes of story
 */

function filter() {
   this.subnodeRelation = "WHERE PARENT_ID = " + this.__id__ + " ORDER BY CREATETIME asc";
}