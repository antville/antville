/**
 * function for sorting member-objects by the lastupdate-timestamp
 * of the according site
 */

function sortSubscriptions(s1, s2) {
   if (!s1.site || !s2.site)
      return 0;
   if (s1.site.lastupdate < s2.site.lastupdate)
      return 1;
   else if (s1.site.lastupdate > s2.site.lastupdate)
      return -1;
   else
      return 0;
}
