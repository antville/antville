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
 * macro renders URL of member (if existing)
 */

function url_macro(param) {
   if (!this.user.url)
      return;
   res.write(param.prefix);
   var linkParam = new Object();
   linkParam.to = this.user.url;
   this.openLink(linkParam);
   res.write(linkParam.to);
   this.closeLink();
   res.write(param.suffix);
}

/**
 * macro renders user-level
 */

function level_macro(param) {
   res.write(param.prefix)
   if (param.as == "editor") {
      // var options = new Array("Subscriber","Contributor","Content Manager","Administrator");
      // res.write(simpleDropDownBox("level",options,null,"-- select --"));
      res.write(simpleDropDownBox("level",ROLES,null,"-- select --"));
   } else
      res.write(getRole(parseInt(this.level,10)));
   res.write(param.suffix);
}

/**
 * macro renders the title of the weblog
 */

function weblogtitle_macro(param) {
   this.weblog.title_macro(param);
}

/**
 * macro renders a link to deleting a membership
 */

function deletelink_macro(param) {
   if (this.level == getAdminLvl())
      return;
   res.write(param.prefix);
   var linkParam = new Object();
   linkParam.to = "delete";
   this.openLink(linkParam);
   res.write(param.text ? param.text : "remove");
   this.closeLink();
   res.write(param.suffix);
}

/**
 * macro renders a link to unsubscribe-action
 */

function unsubscribelink_macro(param) {
   if (this.level > 0)
      return;
   res.write(param.prefix);
   var linkParam = new Object();
   linkParam.to = "unsubscribe";
   this.weblog.openLink(linkParam);
   res.write(param.text ? param.text : "unsubscribe");
   this.closeLink();
   res.write(param.suffix);
}