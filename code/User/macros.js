/**
 * macro rendering username
 */

function name_macro(param) {
   res.write(param.prefix)
   if (this.url) {
      var linkParam = new Object();
      linkParam.to = this.url;
      this.openLink(linkParam);
      res.write(this.name);
      this.closeLink();
   } else
      res.write(this.name);
   res.write(param.suffix);
}

/**
 * macro rendering password
 */

function password_macro(param) {
   if (param.as == "editor") {
      res.write(param.prefix)
      this.renderInputPassword(this.createInputParam("password",param));
      res.write(param.suffix);
   }
}


/**
 * macro rendering URL
 */

function url_macro(param) {
   res.write(param.prefix)
   if (param.as == "editor")
      this.renderInputText(this.createInputParam("url",param));
   else
      res.write(this.url);
   res.write(param.suffix);
}


/**
 * macro rendering email
 */

function email_macro(param) {
   res.write(param.prefix)
   if (param.as == "editor")
      this.renderInputText(this.createInputParam("email",param));
   else
      res.write(this.email);
   res.write(param.suffix);
}

/**
 * macro rendering description
 */

function description_macro(param) {
   res.write(param.prefix)
   if (param.as == "editor")
      this.renderInputTextarea(this.createInputParam("description",param));
   else
      res.write(this.description);
   res.write(param.suffix);
}

/**
 * macro renders a list of memberships of this user
 * meaning all memberships where level > 0
 */

function membershiplist_macro(param) {
   res.write(param.prefix);
   if (!this.memberships.size())
      res.writeln("-----");
   else {
      for (var i=0;i<this.memberships.size();i++)
         this.memberships.get(i).renderSkin("membership");
   }
   res.write(param.suffix);
}

/**
 * macro renders a list of subscriptions of this user
 * meaning all memberships where level == 0
 */

function subscriptionlist_macro(param) {
   res.write(param.prefix);
   if (!this.subscriptions.size())
      res.writeln("-----");
   else {
      for (var i=0;i<this.subscriptions.size();i++)
         this.subscriptions.get(i).renderSkin("subscription");
   }
   res.write(param.suffix);
}

/**
 * macro renders the weblogs the user is a member of or has subscribed to
 * in order of their last update-timestamp
 */

function webloglist_macro(param) {
   res.write(param.prefix);
   if (!this.size())
      res.writeln("-----");
   else {
      var l = user.list();
      l.sort(this.sortSubscriptions);
      for (var i in l) {
         var wl = l[i].weblog;
         wl.renderSkin("preview");
      }
   }
   res.write(param.suffix);
}