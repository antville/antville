/**
 * macro renders the username of this member
 */

function username_macro(param) {
   if (param.linkto) {
      this.openLink(param);
      res.write(this.username);
      this.closeLink();
   } else
      res.write(this.username);
}

/**
 * macro renders the createtime of this membership
 */

function createtime_macro(param) {
   res.write(this.weblog.formatTimestamp(this.createtime,param));
}

/**
 * macro renders eMail-address of member
 */

function email_macro(param) {
   res.write(this.user.email);
}

/**
 * macro renders URL of member (if existing)
 */

function url_macro(param) {
   if (!this.user.url)
      return;
   var linkParam = new Object();
   linkParam.to = this.user.url;
   this.openLink(linkParam);
   res.write(linkParam.to);
   this.closeLink();
}

/**
 * macro renders user-level
 */

function level_macro(param) {
   if (param.as == "editor") {
      // var options = new Array("Subscriber","Contributor","Content Manager","Administrator");
      // renderDropDownBox("level",options,null,"-- select --");
      renderDropDownBox("level", ROLES, null, "-- select --");
   } else
      res.write(getRole(parseInt(this.level,10)));
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
   var linkParam = new Object();
   linkParam.to = "delete";
   this.openLink(linkParam);
   res.write(param.text ? param.text : "remove");
   this.closeLink();
}

/**
 * macro renders a link to unsubscribe-action
 */

function unsubscribelink_macro(param) {
   if (this.level > 0)
      return;
   var linkParam = new Object();
   linkParam.to = "unsubscribe";
   this.weblog.openLink(linkParam);
   res.write(param.text ? param.text : "unsubscribe");
   this.closeLink();
}