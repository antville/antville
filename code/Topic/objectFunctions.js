/**
 * function checks if story is published in topic
 * overwrites isStoryOnline-function of day
 * @param Obj story to check
 * @return Boolean true if online, false if not
 */

function isStoryOnline(st) {
   if (parseInt(st.online,10) > 0)
      return true;
   return false;
}