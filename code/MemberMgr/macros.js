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
      Html.link(this._parent.href("subscribe"), param.text ? param.text : "sign up");
   return;
}

/**
 * macro renders a link to signup-action
 * but only if user is not a member of this site
 */

function subscriptionslink_macro(param) {
   if (session.user.size())
      Html.link(this.href("subscriptions"), param.text ? param.text : "subscriptions");
   return;
}

/**
 * macro renders the list of all members of this site
 */

function memberlist_macro(param) {
   var currLvl;
   var sp = new Object();
   var memberlist = new java.lang.StringBuffer();
   for (var i=0;i<this.size();i++) {
      var m = this.get(i);
      if (m.level != currLvl) {
         sp.list = memberlist.toString();
         this.renderSkin("membergroup", sp);
         memberlist = new java.lang.StringBuffer();
         sp.group = getRole(m.level);
         currLvl = m.level;
      }
      memberlist.append(m.renderSkinAsString("preview"));
   }
   sp.list = memberlist.toString();
   this.renderSkin("membergroup",sp);
}

