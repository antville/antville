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
 * main action
 */
Day.prototype.main_action = function() {
   if (this._prototype == "Day" && !path.Site.preferences.getProperty("archive"))
      res.redirect(path.Site.href());
   
   res.data.title = path.Site.title + ": ";
   this.renderStorylist(parseInt(req.data.start, 10));
   if (this._prototype == "Day") {
      var ts = this.groupname.toDate("yyyyMMdd", this._parent.getTimeZone());
      res.data.title += formatTimestamp(ts, "yyyy-MM-dd");
   } else
      res.data.title += this.groupname;
   res.data.body = this.renderSkinAsString("main");
   path.Site.renderSkin("page");
   return;
};

/**
 * rss feed for specific days and topics
 */
Day.prototype.rss_action = function() {
  req.data.show = this._prototype;
  req.data[this._prototype] = this.groupname;
  path.Site.rss_action();
  return;
};
/**
 *  Overwrite link macro to use groupname.
 *  FIXME: (???) No fancy options.
 */
Day.prototype.link_macro  = function() {
   Html.link({href: this.href()}, this.groupname);
   return;
};


/**
 * return the groupname as formatted date
 */
Day.prototype.date_macro = function(param) {
   var ts = this.groupname.toDate("yyyyMMdd", this._parent.getTimeZone());
   try {
      return formatTimestamp(ts, param.format);
   } catch (err) {
      return "[" + getMessage("error.invalidDatePattern") + "]";
   }
};
/**
 * function deletes all childobjects of a day (recursive!)
 */
Day.prototype.deleteAll = function() {
   for (var i=this.size();i>0;i--) {
      var story = this.get(i-1);
      story.deleteAll();
      story.remove();
   }
   return true;
};

/**
 * Return the groupname of a day-object formatted as
 * date-string to be used in the global linkedpath macro
 * @see hopobject.getNavigationName()
 */
Day.prototype.getNavigationName  = function() {
   var ts = this.groupname.toDate("yyyyMMdd", this._parent.getTimeZone());
   return formatTimestamp(ts, "EEEE, dd.MM.yyyy");
};

/**
 * function renders the list of stories for day-pages
 * and assigns the rendered list to res.data.storylist
 * scrollnavigation-links to previous and next page(s) are also
 * assigned to res.data (res.data.prevpage, res.data.nextpage)
 * prevpage- and nextpage-links always link to the previous
 * or next day
 */

Day.prototype.renderStorylist = function() {
   var dayIdx = this._parent.contains(this);
   if (dayIdx > 0) {
      var sp = new Object();
      sp.url = this._parent.get(dayIdx - 1).href();
      sp.text = getMessage("Story.newerStories");
      res.data.prevpage = renderSkinAsString("prevpagelink", sp);
   }
   res.push();
   this.get(0).renderSkin("dayheader");
   for (var i=0;i<this.size();i++)
      this.get(i).renderSkin("preview");
   res.data.storylist = res.pop();
   // assigning link to previous page to res.data.prevpage
   if (dayIdx < this._parent.size()-1) {
      var sp = new Object();
      sp.url = this._parent.get(dayIdx + 1).href();
      sp.text = getMessage("Story.olderStories");
      res.data.nextpage = renderSkinAsString("nextpagelink", sp);
   }
   return;
};
/**
 * permission check (called by hopobject.onRequest())
 * @param String name of action
 * @param Obj User object
 * @param Int Membership level
 * @return Obj Exception object or null
 */
Day.prototype.checkAccess = function(action, usr, level) {
   if (!path.Site.online)
      checkIfLoggedIn();
   try {
      path.Site.checkView(usr, level);
   } catch (deny) {
      res.message = deny.toString();
      res.redirect(root.href());
   }
   return;
};
