/**
 * constructor function for skin objects
 */
function constructor(layout, proto, name, creator) {
   this.layout = layout;
   this.proto = proto;
   this.name = name;
   this.creator = this.modifier = creator;
   this.createtime = new Date();
   this.modifytime = new Date();
}