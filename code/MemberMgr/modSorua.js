/**
 * SORUA AuthURI
 */
function modSorua_action() {
   if (!app.data.modSorua) app.data.modSorua = new Array();
   var returnUrl = req.data["sorua-return-url"];
   var failUrl   = req.data["sorua-fail-url"];
   var userID    = req.data["sorua-user"];
   var action    = req.data["sorua-action"];
   if (action == "authenticate") {   // authenticate-action
      if (session.user && session.user.name == userID) {
         app.data.modSorua[returnUrl] = new Date(); // store returnUrl
         res.redirect(returnUrl);
      } else if (failUrl) {
         res.redirect(failUrl);
      } else {
         session.data.modSorua = {returnUrl: returnUrl,
                                 userID: userID};
         res.redirect(this.href("modSoruaLoginForm"));
      }

   } else if (action == "verify") {
      // first remove outdated entries
      var now = new Date();
      var arr = new Array();
      for (var i in app.data.modSorua) {
         if (now.valueOf() - app.data.modSorua[i].valueOf() < 1000 * 60) 
            arr[i] = app.data.modSorua[i];
      }
      app.data.modSorua = arr;
      // now check whether returnUrl has been used recently
      if (app.data.modSorua[returnUrl]) {
         res.status = 200;
         res.write("OK");
         return;
      } else {
         res.status = 403;
         return;
      }

   } else { // handle wrong call of AuthURI
     res.redirect(root.href("main"));

   }   
}


/**
 * SORUA Login Form 
 */
function modSoruaLoginForm_action() {
   if (!session.data.modSorua) res.redirect(root.href()); // should not happen anyways
   if (req.data.login) {
      try {
         res.message = this.evalLogin(session.data.modSorua.userID, req.data.password);
         var returnUrl = session.data.modSorua.returnUrl;
         if (returnUrl) {
            app.data.modSorua[returnUrl] = new Date(); // store returnUrl
            res.redirect(returnUrl);
         } else {  // should not happen anyways
            res.redirect(root.href()); 
         }
      } catch (err) {
         res.message = err.toString();
      }      
   }
   res.data.user   = session.data.modSorua.userID;
   res.data.action = this.href("modSoruaLoginForm");
   this.renderSkin("modSorua");
}
