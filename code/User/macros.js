/**
 * macro rendering username
 */

function name_macro(param) {
   if (this.url) {
      openLink(this.url);
      res.write(this.name);
      closeLink();
   } else
      res.write(this.name);
}

/**
 * macro rendering password
 */

function password_macro(param) {
   if (param.as == "editor")
      this.renderInputPassword(this.createInputParam("password",param));
   return;
}


/**
 * macro rendering URL
 */

function url_macro(param) {
   if (param.as == "editor")
      this.renderInputText(this.createInputParam("url",param));
   else
      res.write(this.url);
}


/**
 * macro rendering email
 */

function email_macro(param) {
   if (param.as == "editor")
      this.renderInputText(this.createInputParam("email",param));
   else
      res.write(this.email);
}

/**
 * macro rendering description
 */

function description_macro(param) {
   if (param.as == "editor")
      this.renderInputTextarea(this.createInputParam("description",param));
   else
      res.write(this.description);
}

/**
 * macro renders a list of memberships of this user
 * meaning all memberships where level > 0
 */

function membershiplist_macro(param) {
   if (!this.memberships.size())
      res.writeln("-----");
   else {
      for (var i=0;i<this.memberships.size();i++)
         this.memberships.get(i).renderSkin("membership");
   }
}

/**
 * macro renders a list of subscriptions of this user
 * meaning all memberships where level == 0
 */

function subscriptionlist_macro(param) {
   if (!this.subscriptions.size())
      res.writeln("-----");
   else {
      for (var i=0;i<this.subscriptions.size();i++)
         this.subscriptions.get(i).renderSkin("subscription");
   }
}

/**
 * macro renders the weblogs the user is a member of or has subscribed to
 * in order of their last update-timestamp
 */

function webloglist_macro(param) {
   if (!this.size())
      res.writeln("-----");
   else {
      var l = session.user.list();
      l.sort(this.sortSubscriptions);
      for (var i in l) {
         var wl = l[i].weblog;
         wl.renderSkin("preview");
      }
   }
}