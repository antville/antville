/**
 * macro renders a link to signup if user is not member of this site
 * if user is member, it displays the level of membership
 */

function membership_macro(param) {
   if (req.data.memberlevel == null)
      return;
   res.write(getRole(req.data.memberlevel));
}

/**
 * macro renders a link to signup-action
 * but only if user is not a member of this site
 * and the site is public
 */

function subscribelink_macro(param) {
   if (this._parent.online && req.data.memberlevel == null)
      Html.link({href: this._parent.href("subscribe")},
                param.text ? param.text : "sign up");
   return;
}

/**
 * macro renders a link to signup-action
 * but only if user is not a member of this site
 */

function subscriptionslink_macro(param) {
   if (session.user.size())
      Html.link({href: this.href("updated")},
                param.text ? param.text : "subscriptions");
   return;
}
