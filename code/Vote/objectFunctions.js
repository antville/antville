/**
 * constructor function for vote objects
 */
function constructor(choice, usr) {
   this.choice = choice;
   this.user = usr;
   this.username = usr.name;
   this.createtime = this.modifytime = new Date();
   return this;
}
