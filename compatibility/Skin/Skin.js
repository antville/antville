relocateProperty(Skin, "createtime", "created");
relocateProperty(Skin, "modifytime", "modified");
relocateProperty(Skin, "proto", "prototype");

delete Skin.prototype.createtime_macro;
delete Skin.prototype.modifytime_macro;

Skin.prototype.deletelink_macro = function(param) {
   if (path.Layout != this.layout)
      return;
   Html.link({href: this.href("delete")}, param.text ? param.text : "delete");
   return;
};

Skin.prototype.difflink_macro = function(param) {
   if (this.custom == 1 && !this.layout.skins.getOriginalSkin(this.proto, this.name))
      return;
   Html.link({href: this.href("diff")}, param.text ? param.text : "diff");
   return;
};

