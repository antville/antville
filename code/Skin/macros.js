/**
 * drop the "global" prototype to
 * display correct macro syntax 
 */
function proto_macro() {
   if (this.proto.toLowerCase() != "global")
      res.write(this.proto);
   return;
}
