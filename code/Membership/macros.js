/**
 * macro renders the username
 */

function username_macro(param) {
   if (param.linkto && (param.linkto != "edit" || this.user != session.user)) {
      openLink(this.href(param.linkto));
      res.write(this.username);
      closeLink();
   } else
      res.write(this.username);
}


/**
 * macro renders eMail-address
 */

function email_macro(param) {
   if (this.user.isEmailPublic())
      return (this.user.email);
   return ("**********");
}

/**
 * macro renders URL (if existing)
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
 * macro renders the title of the site
 */

function sitetitle_macro(param) {
   this.site.title_macro(param);
}

/**
 * macro renders a link for deleting a membership
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
   openLink(this.site.href("unsubscribe"));
   res.write(param.text ? param.text : "unsubscribe");
   closeLink();
}