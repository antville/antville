/**
 * constants specifying user-rights
 */

MAY_ADD_STORY = 1;
MAY_VIEW_ANYSTORY = 2;
MAY_EDIT_ANYSTORY = 4;
MAY_DELETE_ANYSTORY = 8;
MAY_ADD_COMMENT = 16;
MAY_EDIT_ANYCOMMENT = 32;
MAY_DELETE_ANYCOMMENT = 64;
MAY_ADD_IMAGE = 128;
MAY_EDIT_ANYIMAGE = 256;
MAY_DELETE_ANYIMAGE = 512;
MAY_ADD_FILE = 1024;
MAY_EDIT_ANYFILE = 2048;
MAY_DELETE_ANYFILE= 4096;
MAY_VIEW_STATS = 8192;
MAY_EDIT_PREFS = 16384;
MAY_EDIT_LAYOUTS = 32768;
MAY_EDIT_MEMBERS = 65536;

/**
 * constant containing integer representing permission of subscribers
 */
SUBSCRIBER = 0;

/**
 * constant containing integer representing permission of contributors
 */
CONTRIBUTOR = SUBSCRIBER | MAY_ADD_STORY | MAY_ADD_COMMENT | 
              MAY_ADD_IMAGE | MAY_ADD_FILE |
              MAY_VIEW_STATS;

/**
 * constant containing integer representing permission of content manager
 */
CONTENTMANAGER = CONTRIBUTOR | MAY_VIEW_ANYSTORY | MAY_EDIT_ANYSTORY |
                 MAY_DELETE_ANYSTORY | MAY_EDIT_ANYCOMMENT | 
                 MAY_DELETE_ANYCOMMENT | MAY_EDIT_ANYIMAGE | 
                 MAY_DELETE_ANYIMAGE | MAY_EDIT_ANYFILE | 
                 MAY_DELETE_ANYFILE;

/**
 * constant containing integer representing permission of admins
 */
ADMIN = CONTENTMANAGER | MAY_EDIT_PREFS | MAY_EDIT_LAYOUTS | MAY_EDIT_MEMBERS;

ROLES = new Array();
ROLES[0] = [SUBSCRIBER, "Subscriber"];
ROLES[1] = [CONTRIBUTOR, "Contributor"];
ROLES[2] = [CONTENTMANAGER, "Content manager"];
ROLES[3] = [ADMIN, "Admin"];

/**
 * constant object containing the values for editableby levels
 */
EDITABLEBY_ADMINS       = 0;
EDITABLEBY_CONTRIBUTORS = 1;
EDITABLEBY_SUBSCRIBERS  = 2;

/**
 * named array containing the display-names of
 * path-objects which is used by linkedpath_macro()
 */

DISPLAY = new Array();
DISPLAY["root"] = "Root";
DISPLAY["site"] = "Home";
DISPLAY["topicmgr"] = "Topics";
DISPLAY["imagetopicmgr"] = "Galleries";
DISPLAY["storymgr"] = "Stories";
DISPLAY["filemgr"] = "Files";
DISPLAY["imagemgr"] = "Images";
DISPLAY["membermgr"] = "Members";
DISPLAY["sysmgr"] = "System Management";
DISPLAY["pollmgr"] = "Polls";
DISPLAY["skinmgr"] = "Skins";
DISPLAY["layout"] = "Layout";
DISPLAY["layoutmgr"] = "Layouts";
DISPLAY["layoutimagemgr"] = "Images";
DISPLAY["rootlayoutmgr"] = "Layouts";
DISPLAY["story"] = "Story";

/**
 * array containing short dateformats
 */

SHORTDATEFORMATS = new Array();
SHORTDATEFORMATS[SHORTDATEFORMATS.length] = "yyyy.MM.dd, HH:mm";
SHORTDATEFORMATS[SHORTDATEFORMATS.length] = "yyyy-MM-dd HH:mm";
SHORTDATEFORMATS[SHORTDATEFORMATS.length] = "yyyy/MM/dd HH:mm";
SHORTDATEFORMATS[SHORTDATEFORMATS.length] = "d. MMMM, HH:mm";
SHORTDATEFORMATS[SHORTDATEFORMATS.length] = "MMMM d, HH:mm";
SHORTDATEFORMATS[SHORTDATEFORMATS.length] = "d. MMM, HH:mm";
SHORTDATEFORMATS[SHORTDATEFORMATS.length] = "MMM d, HH:mm";
SHORTDATEFORMATS[SHORTDATEFORMATS.length] = "EEE, d. MMM, HH:mm";
SHORTDATEFORMATS[SHORTDATEFORMATS.length] = "EEE MMM d, HH:mm";
SHORTDATEFORMATS[SHORTDATEFORMATS.length] = "EEE, HH:mm";
SHORTDATEFORMATS[SHORTDATEFORMATS.length] = "EE, HH:mm";
SHORTDATEFORMATS[SHORTDATEFORMATS.length] = "HH:mm";

LONGDATEFORMATS = new Array();
LONGDATEFORMATS[LONGDATEFORMATS.length] = "EEEE, d. MMMM yyyy, HH:mm";
LONGDATEFORMATS[LONGDATEFORMATS.length] = "EEEE, MMMM dd, yyyy, HH:mm";
LONGDATEFORMATS[LONGDATEFORMATS.length] = "EE, d. MMM. yyyy, HH:mm";
LONGDATEFORMATS[LONGDATEFORMATS.length] = "EE MMM dd, yyyy, HH:mm";
LONGDATEFORMATS[LONGDATEFORMATS.length] = "EE yyyy-MM-dd HH:mm";
LONGDATEFORMATS[LONGDATEFORMATS.length] = "yyyy-MM-dd HH:mm";
LONGDATEFORMATS[LONGDATEFORMATS.length] = "d. MMMM yyyy, HH:mm";
LONGDATEFORMATS[LONGDATEFORMATS.length] = "MMMM d, yyyy, HH:mm";
LONGDATEFORMATS[LONGDATEFORMATS.length] = "d. MMM yyyy, HH:mm";
LONGDATEFORMATS[LONGDATEFORMATS.length] = "MMM d, yyyy, HH:mm";

/**
 * width and height of thumbnail images
 */
THUMBNAILWIDTH = 100;
THUMBNAILHEIGHT = 100;

/**
 * various constants
 */
ONEMINUTE = 60000;
ONEHOUR = 3600000;
ONEDAY = 86400000;

/**
 * object containing the metadata of
 * standard antville images plus the method
 * for rendering them
 */
DefaultImages = {
   smallanim: {name: "smallanim.gif", width: 98, height: 30, alt: "made with antville", linkto: "http://antville.org"},
   smallchaos: {name: "smallchaos.gif", width: 107, height: 29, alt: "made with antville", linkto: "http://antville.org"},
   smallstraight: {name: "smallstraight.gif", width: 107, height: 24, alt: "made with antville", linkto: "http://antville.org"},
   smalltrans: {name: "smalltrans.gif", width: 98, height: 30, alt: "made with antville", linkto: "http://antville.org"},
   xmlbutton: {name: "xmlbutton.gif", width: 36, height: 14, alt: "xml version of this page", linkto: "http://antville.org"},
   hop: {name: "hop.gif", width: 124, height: 25, alt: "helma object publisher", linkto: "http://helma.org"},
   marquee: {name: "marquee.gif", width: 15, height: 15, alt: "marquee"},
   pixel: {name: "pixel.gif", width: 1, height: 1, alt: ""},

   /**
    * render a standard image
    */
   render: function(name, param) {
      if (!this[name])
         return;
      param.src = app.properties.staticUrl + this[name].name;
      if (param.as == "url") {
         res.write(param.src);
         return;
      }
      delete param.name;
      param.border = 0;
      if (!param.width)
         param.width = this[name].width;
      if (!param.height)
         param.height = this[name].height;
      if (!param.alt)
         param.alt = this[name].alt;
      if (!param.linkto && !this[name].linkto)
         Html.tag("img", param);
      else {
         Html.openLink({href: param.linkto ? param.linkto : this[name].linkto});
         delete(param.linkto);
         Html.tag("img", param);
         Html.closeLink();
      }
      return;
   }
}

/**
 * constructor function for Skinset objects
 * used to build the constan SKINS
 */
function Skinset(key, skins, context) {
   this.key = key;
   this.skins = skins;
   this.context = context;
   this.children = [];
   this.add = function(obj) {
      this.children.push(obj);
   }
   return this;
}

/**
 * constant that contains the menu structure of the skin manager
 * it is basically an Array containing Skinset objects (which themselves
 * can contain child objects too)
 */
SKINSETS = [];
var newSet;

newSet = new Skinset("Root", ["Root.page", "Root.main", "Root.style", "Root.javascript", "Root.sysmgrnavigation", "Root.new"], "root");
newSet.add(new Skinset("Root.scripts", ["Root.systemscripts", "Global.colorpickerScripts"]));
newSet.add(new Skinset("Root.sitelist", ["site.preview", "Root.list"]));
newSet.add(new Skinset("Root.rss", ["Root.rss", "site.rssItem", "site.rssResource", "Global.rssImage"]));
newSet.add(new Skinset("Root.colorpicker", ["Global.colorpicker", "Global.colorpickerExt", "Global.colorpickerWidget", "Global.colorpickerScripts"]));
newSet.add(new Skinset("Root.welcome", ["site.welcome", "site.welcomeowner", "site.welcomesysadmin", "Root.welcome"]));
SKINSETS.push(newSet);

newSet = new Skinset("site", ["site.page", "site.style", "site.javascript", "site.main", "day.main", "story.dayheader"]);
newSet.add(new Skinset("site.navigation", ["site.contribnavigation", "site.adminnavigation", "Global.nextpagelink", "Global.prevpagelink", "Global.pagenavigation", "Global.pagenavigationitem", "membermgr.statusloggedin", "membermgr.statusloggedout"]));
newSet.add(new Skinset("site.topics", ["topicmgr.main", "topic.main"]));
newSet.add(new Skinset("site.calendar", ["site.calendar", "site.calendardayheader", "site.calendarweek", "site.calendarday", "site.calendarselday"]));
newSet.add(new Skinset("site.rss", ["site.rss", "story.rssItem", "story.rssResource"]));
newSet.add(new Skinset("site.search", ["site.searchform", "site.searchbox", "story.searchview"]));
newSet.add(new Skinset("site.referrers", ["site.referrers", "site.referrerItem"]));
newSet.add(new Skinset("site.mostread", ["site.mostread", "story.mostread"]));
newSet.add(new Skinset("site.mails", ["membermgr.mailregconfirm", "membermgr.mailpassword", "membermgr.mailnewmember", "membership.mailstatuschange", "membership.mailmessage", "site.notificationMail"], "root"));
newSet.add(new Skinset("site.preferences", ["site.edit", "site.notification"], "root"));
newSet.add(new Skinset("site.User", ["membermgr.login", "membermgr.register", "membermgr.sendpwd", "User.edit", "User.sitelist", "User.subscriptions", "membership.subscriptionlistitem"], "root"));
newSet.add(new Skinset("site.membermgr", ["membermgr.main", "membermgr.new", "membermgr.membergroup", "membermgr.searchresult", "membermgr.searchresultitem", "membership.mgrlistitem", "membership.edit"], "root"));
newSet.add(new Skinset("site.various", ["site.robots"]));
SKINSETS.push(newSet);

newSet = new Skinset("story", ["story.display", "story.main", "story.preview", "story.comment", "story.historyview", "story.embed", "story.edit"]);
newSet.add(new Skinset("story.backlinks", ["story.backlinks", "story.backlinkItem"]));
newSet.add(new Skinset("story.list", ["storymgr.main", "story.mgrlistitem"]));
SKINSETS.push(newSet);

newSet = new Skinset("comment", ["comment.toplevel", "comment.reply", "comment.edit"]);
SKINSETS.push(newSet);

newSet = new Skinset("image", ["image.main", "image.edit", "imagemgr.new", "layoutimage.edit", "imagemgr.main", "image.mgrlistitem", "topic.imagetopic"]);
SKINSETS.push(newSet);

newSet = new Skinset("file", ["file.main", "file.edit", "filemgr.new", "filemgr.main", "file.mgrlistitem"]);
SKINSETS.push(newSet);

newSet = new Skinset("poll", ["poll.main", "poll.results", "choice.main", "choice.result", "choice.graph"]);
newSet.add(new Skinset("poll.editor", ["poll.edit", "choice.edit"]));
newSet.add(new Skinset("poll.list", ["pollmgr.main", "poll.mgrlistitem"]));
SKINSETS.push(newSet);

newSet = new Skinset("sysmgr", ["sysmgr.status", "sysmgr.list", "site.sysmgr_listitem", "site.sysmgr_edit", "site.sysmgr_delete", "User.sysmgr_listitem", "User.sysmgr_edit", "syslog.sysmgr_listitem"], "root");
newSet.add(new Skinset("sysmgr.forms", ["sysmgr.setup", "sysmgr.sitesearchform", "sysmgr.usersearchform", "sysmgr.syslogsearchform"]));
newSet.add(new Skinset("sysmgr.mails", ["sysmgr.blockwarnmail", "sysmgr.deletewarnmail"]));
SKINSETS.push(newSet);

newSet = new Skinset("skinmgr", ["skinmgr.main", "skinmgr.page", "skinmgr.edit", "skinmgr.treebranch", "skinmgr.treeleaf", "skin.status", "skin.statuscustom", "skinmgr.new", "skin.diff", "skin.diffline"], "root");
SKINSETS.push(newSet);

newSet = new Skinset("layoutmgr", ["layoutmgr.main", "layoutmgr.new", "layoutmgr.import"], "root");
newSet.add(new Skinset("layoutmgr.layout", ["layout.mgrlistitem", "layout.main", "layout.edit", "layout.download", "layout.chooserlistitem", "layout.testdrive"]));
newSet.add(new Skinset("layoutmgr.images", ["layoutimagemgr.main", "layoutimagemgr.navigation", "layoutimagemgr.new"]));
SKINSETS.push(newSet);

newSet = new Skinset("various", ["HopObject.delete"], "root");
SKINSETS.push(newSet);
