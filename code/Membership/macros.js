/**
 * macro renders the username of this member
 */

function username_macro(param) {
   if (param.linkto) {
      openLink(this.href(param.linkto));
      res.write(this.username);
      closeLink();
   } else
      res.write(this.username);
}

/**
 * macro renders the createtime of this membership
 */

function createtime_macro(param) {
   res.write(formatTimestamp(this.createtime,param.format));
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
   openLink(this.user.url);
   res.write(this.user.url);
   closeLink();
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
   openLink(this.href("delete"));
   res.write(param.text ? param.text : "remove");
   closeLink();
}

/**
 * macro renders a link to unsubscribe-action
 */

function unsubscribelink_macro(param) {
   if (this.level > 0)
      return;
   openLink(this.weblog.href("unsubscribe"));
   res.write(param.text ? param.text : "unsubscribe");
   closeLink();
}