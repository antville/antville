/**
 * macro renders a link to signup if user is not member of this weblog
 * if user is member, it displays the level of membership
 */

function membership_macro(param) {
   var ms = this.get(user.name);
   if (!ms)
      return;
   res.write(param.prefix);
   res.write(getRole(ms.level));
   res.write(param.suffix);
}

/**
 * macro renders a link to signup-action
 * but only if user is not a member of this weblog
 */

function subscribelink_macro(param) {
   if (!path.weblog)
      return;
   var ms = this.get(user.name);
   if (ms)
      return;
   res.write(param.prefix);
   var linkParam = new Object();
   linkParam.to = "subscribe";
   path.weblog.openLink(linkParam);
   res.write(param.text ? param.text : "sign up");
   this.closeLink();
   res.write(param.suffix);
}

/**
 * macro renders a link to signup-action
 * but only if user is not a member of this weblog
 */

function subscriptionslink_macro(param) {
   if (!user.size())
      return;
   res.write(param.prefix);
   var linkParam = new Object();
   linkParam.to = "subscriptions";
   this.openLink(linkParam);
   res.write(param.text ? param.text : "subscriptions");
   this.closeLink();
   res.write(param.suffix);
}

/**
 * macro renders the list of all members of this weblog
 */

function memberlist_macro(param) {
   res.write(param.prefix)
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
   res.write(param.suffix);
}

