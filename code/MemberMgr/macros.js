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
   if (!path.site || !path.site.online || req.data.memberlevel != null)
      return;
   openLink(path.site.href("subscribe"));
   res.write(param.text ? param.text : "sign up");
   closeLink();
}

/**
 * macro renders a link to signup-action
 * but only if user is not a member of this site
 */

function subscriptionslink_macro(param) {
   if (!session.user.size())
      return;
   openLink(this.href("subscriptions"));
   res.write(param.text ? param.text : "subscriptions");
   closeLink();
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
         this.renderSkin("membergroup",sp);
         memberlist = new java.lang.StringBuffer();
         sp.group = getRole(m.level);
         currLvl = m.level;
      }
      memberlist.append(m.renderSkinAsString("preview"));
   }
   sp.list = memberlist.toString();
   this.renderSkin("membergroup",sp);
}

