/**
 * constructor function for choice objects
 */
function constructor(title) {
   this.title = title;
   this.createtime = this.modifytime = new Date();
}

/**
 * function removes all votes from a choice
 */
function deleteAll() {
   for (var i=this.size();i>0;i--) {
      if (!this.remove(this.get(i-1)))
         throw new Exception("voteDelete");
   }
   return true;
}