/**
 * drop the "global" prototype to
 * display correct macro syntax 
 */
function proto_macro() {
   if (this.proto.toLowerCase() != "global")
      res.write(this.proto);
   return;
}

/**
 * link to delete action
 */
function deletelink_macro(param) {
   if (path.Layout != this.layout)
      return;
   Html.link({href: this.href("delete")}, param.text ? param.text : "delete");
   return;
}

/**
 * link to diff action
 */
function difflink_macro(param) {
   if (this.custom == 1 && !this.layout.skins.getOriginalSkin(this.proto, this.name))
      return;
   Html.link({href: this.href("diff")}, param.text ? param.text : "diff");
   return;
}