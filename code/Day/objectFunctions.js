/**
 * function checks if story is published in weblog
 * @param Obj story to check
 * @return Boolean true if online, false if not
 */

function isStoryOnline(st) {
   if (parseInt(st.online,10) == 2)
      return true;
   return false;
}