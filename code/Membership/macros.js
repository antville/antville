/**
 * macro renders the username
 */
function username_macro(param) {
   if (param.linkto && (param.linkto != "edit" || this.user != session.user))
      Html.link({href: this.href(param.linkto)}, this.username);
   else
      res.write(this.username);
}


/**
 * macro renders e-mail address
 */
function email_macro(param) {
   if (this.user.publishemail)
      return (this.user.email);
   return ("**********");
}

/**
 * macro renders URL (if existing)
 */
function url_macro(param) {
   if (this.user.url)
      Html.link({href: this.user.url}, this.user.url);
   return;
}

/**
 * macro renders user-level
 */

function level_macro(param) {
   if (param.as == "editor")
      Html.dropDown({name: "level"}, ROLES, this.level, "-- select --");
   else
      res.write(getRole(this.level));
   return;
}

/**
 * macro renders the username
 */
function editlink_macro(param) {
   if (this.user != session.user)
      Html.link({href: this.href("edit")}, param.text ? param.text : "edit");
   return;
}


/**
 * macro renders a link for deleting a membership
 */
function deletelink_macro(param) {
   if (this.level != ADMIN)
      Html.link({href: this.href("delete")},
                param.text ? param.text : "remove");
   return;
}

/**
 * macro renders a link to unsubscribe-action
 */
function unsubscribelink_macro(param) {
   if (this.level == SUBSCRIBER)
      Html.link({href: this.site.href("unsubscribe")},
                param.text ? param.text : "unsubscribe");
   return;
}
