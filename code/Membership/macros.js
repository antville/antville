/**
 * macro renders the username of this member
 */

function username_macro(param) {
   res.write(param.prefix)
   if (param.linkto) {
      this.openLink(param);
      res.write(this.username);
      this.closeLink();
   } else
      res.write(this.username);
   res.write(param.suffix);
}

/**
 * macro renders the createtime of this membership
 */

function createtime_macro(param) {
   res.write(param.prefix)
   res.write(this.weblog.formatTimestamp(this.createtime,param));
   res.write(param.suffix);
}

/**
 * macro renders eMail-address of member
 */

function email_macro(param) {
   res.write(param.prefix)
   res.write(this.user.email);
   res.write(param.suffix);
}

/**
 * macro renders user-level
 */

function level_macro(param) {
   res.write(param.prefix)
   if (param.as == "editor") {
      ddParam = new HopObject();
      ddParam.name = "level";
      ddParam.add(this.createDDOption("-- select --",""));
      ddParam.add(this.createDDOption("Member",0));
      ddParam.add(this.createDDOption("Contributor",1));
      ddParam.add(this.createDDOption("Administrator",2));
      this.chooser(ddParam);      
   } else {
      if (this.isAdmin())
         res.write("Admin");
      else if (this.isContributor())
         res.write("Contributor");
      else
         res.write("Member");
   }
   res.write(param.suffix);
}
