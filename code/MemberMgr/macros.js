/**
 * macro renders a link to signup if user is not member of this weblog
 * if user is member, it displays the level of membership
 */

function membership_macro(param) {
   var ms = this.get(user.name);
   if (!ms)
      return;
   res.write(param.prefix);
   ms.renderLvl();
   res.write(param.suffix);
}

/**
 * macro renders a link to signup-action
 * but only if user is not a member of this weblog
 */

function signuplink_macro(param) {
   if (!path.weblog)
      return;
   var ms = this.get(user.name);
   if (ms)
      return;
   res.write(param.prefix);
   var linkParam = new Object();
   linkParam.to = "signup";
   path.weblog.openLink(linkParam);
   res.write(param.text ? param.text : "sign up");
   this.closeLink();
   res.write(param.suffix);
}

