/**
 * drop the "global" prototype to
 * display correct macro syntax 
 */
function proto_macro() {
   if (this.proto.toLowerCase() == "global")
      return "";
   else
      return this.proto;
}
