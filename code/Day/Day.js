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

Day.prototype.main_action = function() {
   var site = res.handlers.site;
   if (this._prototype === "Day" && site.archiveMode == Site.ARCHIVE_ONLINE) {
      res.redirect(site.href());
   }
   
   res.data.title = site.title + ": ";
   this.renderStorylist(parseInt(req.data.start, 10));
   if (this._prototype === "Day") {
      var date = this.groupname.toDate("yyyyMMdd", this._parent.getTimeZone());
      res.data.title += formatDate(date, "yyyy-MM-dd");
   } else {
      res.data.title += this.groupname;
   }
   res.data.body = this.renderSkinAsString("main");
   site.renderSkin("page");
   return;
};

Day.prototype.rss_action = function() {
  req.data.show = this._prototype;
  req.data[this._prototype] = this.groupname;
  path.Site.rss_action();
  return;
};

Day.prototype.link_macro  = function() {
   return html.link({href: this.href()}, this.groupname);
};

Day.prototype.date_macro = function(param) {
   var ts = this.groupname.toDate("yyyyMMdd", this._parent.getTimeZone());
   try {
      return formatTimestamp(ts, param.format);
   } catch (err) {
      return "[" + getMessage("error.invalidDatePattern") + "]";
   }
};

Day.prototype.deleteAll = function() {
   for (var i=this.size();i>0;i--) {
      var story = this.get(i-1);
      story.deleteAll();
      story.remove();
   }
   return true;
};

Day.prototype.getNavigationName  = function() {
   var ts = this.groupname.toDate("yyyyMMdd", this._parent.getTimeZone());
   return formatTimestamp(ts, "EEEE, dd.MM.yyyy");
};

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
