/**
 * function filters comments
 * only toplevel-comments should appear as subnodes of story
 */

function filter() {
   this.subnodeRelation = "WHERE STORY_ID = " + this.__id__ + " AND PARENT_ID is null ORDER BY CREATETIME asc";
}