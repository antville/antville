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

/**
 * constant object containing the values for editableby levels
 */
EDITABLEBY_ADMINS       = 0;
EDITABLEBY_CONTRIBUTORS = 1;
EDITABLEBY_SUBSCRIBERS  = 2;

/**
 * set constants, called by onStart()
 */
ROLES = new Array();
DISPLAY = new Array();

function initConstants() {
   ROLES[0] = [SUBSCRIBER, getMessage("User.role.subscriber")];
   ROLES[1] = [CONTRIBUTOR, getMessage("User.role.contributor")];
   ROLES[2] = [CONTENTMANAGER, getMessage("User.role.contentManager")];
   ROLES[3] = [ADMIN, getMessage("User.role.admin")];
   
   DISPLAY["Root"] = getMessage("Root");
   DISPLAY["Site"] = getMessage("Site");
   DISPLAY["TopicMgr"] = getMessage("TopicMgr");
   DISPLAY["StoryMgr"] = getMessage("StoryMgr");
   DISPLAY["FileMgr"] = getMessage("FileMgr");
   DISPLAY["ImageMgr"] = getMessage("ImageMgr");
   DISPLAY["MemberMgr"] = getMessage("MemberMgr");
   DISPLAY["SysMgr"] = getMessage("SysMgr");
   DISPLAY["PollMgr"] = getMessage("PollMgr");
   DISPLAY["SkinMgr"] = getMessage("SkinMgr");
   DISPLAY["Layout"] = getMessage("Layout");
   DISPLAY["LayoutMgr"] = getMessage("LayoutMgr");
   DISPLAY["LayoutImageMgr"] = getMessage("LayoutImageMgr");
   DISPLAY["RootLayoutMgr"] = getMessage("RootLayoutMgr");
   DISPLAY["Story"] = getMessage("Story");
}

// FIXME: these two methods circumvent the "losing ROLES" bug
// which is due to ROLES and DISPLAY being defined once
// in onStart only and thus get lost in another thread.

function getRoles(name) {
   if (ROLES.length < 1)
      initConstants();
   return name ? ROLES[name] : ROLES;
}

function getDisplay(name) {
   if (DISPLAY.length < 1)
      initConstants();
   return name ? DISPLAY[name] : DISPLAY;
}


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
   dot: {name: "dot.gif", width: 30, height: 30, alt: ""},

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

newSet = new Skinset("Root", ["Root.page", "Root.main", "Root.style", "Root.javascript", "Root.sysmgrnavigation", "Root.new"], "Root");
newSet.add(new Skinset("Root.scripts", ["Root.systemscripts", "Global.colorpickerScripts"]));
newSet.add(new Skinset("Root.sitelist", ["Site.preview", "Root.list"]));
newSet.add(new Skinset("Root.rss", ["Root.rss", "Site.rssItem", "Site.rssResource", "Global.rssImage"]));
newSet.add(new Skinset("Root.colorpicker", ["Global.colorpicker", "Global.colorpickerExt", "Global.colorpickerWidget", "Global.colorpickerScripts"]));
newSet.add(new Skinset("Root.welcome", ["Site.welcome", "Site.welcomeowner", "Site.welcomesysadmin", "Root.welcome"]));
newSet.add(new Skinset("Root.various", ["Root.blocked", "Root.notfound", "Root.sysError"]));
SKINSETS.push(newSet);

newSet = new Skinset("Site", ["Site.page", "Site.style", "Site.javascript", "Site.main", "Day.main", "Story.dayheader"]);
newSet.add(new Skinset("Site.navigation", ["Site.contribnavigation", "Site.adminnavigation", "Global.nextpagelink", "Global.prevpagelink", "Global.pagenavigation", "Global.pagenavigationitem", "MemberMgr.statusloggedin", "MemberMgr.statusloggedout"]));
newSet.add(new Skinset("Site.topics", ["TopicMgr.main", "Topic.main"]));
newSet.add(new Skinset("Site.calendar", ["Site.calendar", "Site.calendardayheader", "Site.calendarweek", "Site.calendarday", "Site.calendarselday"]));
newSet.add(new Skinset("Site.rss", ["Site.rss", "Story.rssItem", "Story.rssResource"]));
newSet.add(new Skinset("Site.search", ["Site.searchresult", "Site.searchbox", "Story.searchview"]));
newSet.add(new Skinset("Site.referrers", ["Site.referrers", "Site.referrerItem"]));
newSet.add(new Skinset("Site.mostread", ["Site.mostread", "Story.mostread"]));
newSet.add(new Skinset("Site.mails", ["MemberMgr.mailregconfirm", "MemberMgr.mailpassword", "MemberMgr.mailnewmember", "Membership.mailstatuschange", "Membership.mailmessage", "Site.notificationMail"], "Root"));
newSet.add(new Skinset("Site.preferences", ["Site.edit", "Site.notification"], "Root"));
newSet.add(new Skinset("Site.user", ["MemberMgr.login", "MemberMgr.register", "MemberMgr.sendpwd", "User.edit", "User.sitelist", "User.subscriptions", "Membership.subscriptionlistitem"], "Root"));
newSet.add(new Skinset("Site.membermgr", ["MemberMgr.main", "MemberMgr.new", "MemberMgr.membergroup", "MemberMgr.searchresult", "MemberMgr.searchresultitem", "Membership.mgrlistitem", "Membership.edit"], "Root"));
newSet.add(new Skinset("Site.various", ["Site.robots"]));
SKINSETS.push(newSet);

newSet = new Skinset("Story", ["Story.display", "Story.main", "Story.preview", "Story.comment", "Story.historyview", "Story.embed", "Story.edit"]);
newSet.add(new Skinset("Story.backlinks", ["Story.backlinks", "Story.backlinkItem"]));
newSet.add(new Skinset("Story.list", ["StoryMgr.main", "Story.mgrlistitem"]));
SKINSETS.push(newSet);

newSet = new Skinset("Comment", ["Comment.toplevel", "Comment.reply", "Comment.edit"]);
SKINSETS.push(newSet);

newSet = new Skinset("Image", ["Image.main", "Image.edit", "ImageMgr.new", "LayoutImage.edit", "ImageMgr.main", "Image.mgrlistitem"]);
SKINSETS.push(newSet);

newSet = new Skinset("File", ["File.main", "File.edit", "FileMgr.new", "FileMgr.main", "File.mgrlistitem"]);
SKINSETS.push(newSet);

newSet = new Skinset("Poll", ["Poll.main", "Poll.results", "Choice.main", "Choice.result", "Choice.graph"]);
newSet.add(new Skinset("Poll.editor", ["Poll.edit", "Choice.edit"]));
newSet.add(new Skinset("Poll.list", ["PollMgr.main", "Poll.mgrlistitem"]));
SKINSETS.push(newSet);

newSet = new Skinset("SysMgr", ["SysMgr.status", "SysMgr.list", "Site.sysmgr_listitem", "Site.sysmgr_edit", "Site.sysmgr_delete", "User.sysmgr_listitem", "User.sysmgr_edit", "SysLog.sysmgr_listitem"], "Root");
newSet.add(new Skinset("SysMgr.forms", ["SysMgr.setup", "SysMgr.sitesearchform", "SysMgr.usersearchform", "SysMgr.syslogsearchform"]));
newSet.add(new Skinset("SysMgr.mails", ["SysMgr.blockwarnmail", "SysMgr.deletewarnmail"]));
SKINSETS.push(newSet);

newSet = new Skinset("SkinMgr", ["SkinMgr.main", "SkinMgr.page", "SkinMgr.edit", "SkinMgr.treebranch", "SkinMgr.treeleaf", "Skin.status", "Skin.statuscustom", "SkinMgr.new", "Skin.diff", "Skin.diffline"], "Root");
SKINSETS.push(newSet);

newSet = new Skinset("LayoutMgr", ["LayoutMgr.main", "LayoutMgr.new", "LayoutMgr.import"], "Root");
newSet.add(new Skinset("LayoutMgr.layout", ["Layout.mgrlistitem", "Layout.main", "Layout.edit", "Layout.download", "Layout.chooserlistitem", "Layout.testdrive"]));
newSet.add(new Skinset("LayoutMgr.images", ["LayoutImageMgr.main", "LayoutImageMgr.navigation", "LayoutImageMgr.new"]));
SKINSETS.push(newSet);

newSet = new Skinset("various", ["HopObject.delete"], "Root");
SKINSETS.push(newSet);
