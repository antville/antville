/**
 * function renders the level of a membership in cleartext
 */

function renderLvl() {
   if (this.isAdmin())
      res.write("Admin");
   else if (this.isContributor())
      res.write("Contributor");
   else
      res.write("Member");
}