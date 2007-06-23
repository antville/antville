//
// The Antville Project
// http://code.google.com/p/antville
//
// Copyright 2001-2007 by The Antville People
//
// Licensed under the Apache License, Version 2.0 (the ``License'');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an ``AS IS'' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// $Revision$
// $LastChangedBy$
// $LastChangedDate$
// $URL$
//

/**
 * Display a link to let the user add a new writeup 
 * to this topic.
 */
Topic.prototype.addstory_macro  = function(param) {
   try {
      path.Site.stories.checkAdd(session.user, req.data.memberlevel);
   } catch (deny) {
      return;
   }
   param.linkto = "create";
   param.urlparam = "topic=" + this.groupname;
   Html.openTag("a", path.Site.stories.createLinkParam(param));
   if (param.text)
      res.format(param.text);
   else
      res.write(getMessage("Topic.addStoryToTopic"));
   Html.closeTag("a");
   return;
};
/**
 * Return either the title of the story or
 * the id prefixed with standard display name
 * to be used in the global linkedpath macro
 * @see hopobject.getNavigationName()
 */
Topic.prototype.getNavigationName  = function() {
   return this.groupname;
};

/**
 * function renders the list of stories for day-pages
 * and assigns the rendered list to res.data.storylist
 * scrollnavigation-links to previous and next page(s) are also
 * assigned to res.data (res.data.prevpage, res.data.nextpage)
 * using this separate renderFunction instead of doing the stuff
 * in storylist_macro() was necessary for completely independent
 * placement of the prevpage- and nextpage-links
 * @param Int Index-position to start with
 */

Topic.prototype.renderStorylist = function(idx) {
   var size = this.size();
   if (idx < 0 || isNaN (idx)|| idx > size-1)
      idx = 0;
   var max = Math.min (idx+10, size);
   this.prefetchChildren(idx, max);
   if (idx > 0) {
      var sp = new Object();
      sp.url = this.href() + "?start=" + Math.max(0, idx-10);
      sp.text = getMessage("generic.previousPage");
      res.data.prevpage = renderSkinAsString("prevpagelink", sp);
   }

   res.push();
   var day;
   while (idx < max) {
      var s = this.get(idx++);
      if (s.day != day) {
         s.renderSkin("dayheader");
         day = s.day;
      }
      s.renderSkin("preview");
   }
   res.data.storylist = res.pop();
   if (idx < size) {
      var sp = new Object();
      sp.url = this.href() + "?start=" + idx;
      sp.text = getMessage("generic.nextPage");
      res.data.nextpage = renderSkinAsString("nextpagelink", sp);
   }
   return;
};
