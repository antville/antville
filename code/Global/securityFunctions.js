/**
 * function checks if user is logged in or not
 * if false, it redirects to the login-page
 * but before it stores the url to jump back (if passed as argument)
 */

function checkIfLoggedIn(referrer) {
   if (!session.user) {
      // user is not logged in
      if (referrer)
         session.data.referrer = referrer;
      res.redirect(res.handlers.site ? res.handlers.site.members.href("login") : root.members.href("login"));
   }
   return;
}
