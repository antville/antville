/**
 * function checks if the current session is authenticated
 * and if the user has been blocked
 * @return Boolean true when blocked, false otherwise
 */

function isUserBlocked() {
   if (session.user)
      return (session.user.isBlocked());
   return false;
}

/**
 * function checks if the current session is authenticated
 * and if the user is trusted
 * @return Boolean true when trusted, false otherwise
 */

function isUserTrusted() {
   if (session.user)
      return (session.user.isTrusted())
   return false;
}

/**
 * function checks if the current session is authenticated
 * and if the user has SysAdmin-rights
 * @return Boolean true when SysAdmin, false otherwise
 */

function isUserSysAdmin() {
   if (session.user)
      return (session.user.isSysAdmin());
   return false;
}