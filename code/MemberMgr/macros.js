/**
 * macro renders a link to signup if user is not member of this weblog
 * if user is member, it displays the level of membership
 */

function membership_macro(param) {
   var ms = this.get(session.user.name);
   if (!ms)
      return;
   res.write(getRole(ms.level));
}

/**
 * macro renders a link to signup-action
 * but only if user is not a member of this weblog
 */

function subscribelink_macro(param) {
   if (!path.weblog)
      return;
   var ms = this.get(session.user.name);
   if (ms)
      return;
   openLink(path.weblog.href("subscribe"));
   res.write(param.text ? param.text : "sign up");
   closeLink();
}

/**
 * macro renders a link to signup-action
 * but only if user is not a member of this weblog
 */

function subscriptionslink_macro(param) {
   if (!session.user.size())
      return;
   openLink(this.href("subscriptions"));
   res.write(param.text ? param.text : "subscriptions");
   closeLink();
}

/**
 * macro renders the list of all members of this weblog
 */

function memberlist_macro(param) {
   var currLvl;
   var sp = new Object();
   sp.list = "";
   for (var i=0;i<this.size();i++) {
      var m = this.get(i);
      if (m.level != currLvl) {
         this.renderSkin("membergroup",sp);
         sp.list = "";
         sp.group = getRole(parseInt(m.level,10)); // m.getLvl();
         currLvl = m.level;
      }
      sp.list += m.renderSkinAsString("preview");
   }
   this.renderSkin("membergroup",sp);
}

