/**
 * This is a quite human-readable object tree containing
 * the macro help formerly stored in macro.help
 */

HELP = {
   macros: {_url: "http://macros.antville.org/stories/"},
   skins: {}
};


//////////////////////
// macros and skins //
//////////////////////

// G L O B A L

HELP.macros.Global = {
   colorpicker: 246684, 
   //fakemail: 0, 
   file: 15078, 
   //gallery: 0,
   image: 14962, 
   imagelist: 142488, 
   //imageoftheday: 0,
   input: 0, 
   link: 14956, 
   linkedpath: 235746, 
   logo: 14986,
   now: 246588, 
   poll: 14957, 
   //randomIimage: 0,
   //randomize: 0,
   sitelist: 15372, 
   skin: 0,
   story: 246618, 
   storylist: 246675, 
   topiclist: 142469, 
   username: 246622
};

HELP.skins.Global = {
   colorpicker: ["request.text"],
   colorpickerScripts: ["request.name"],
   colorpickerWidget: ["param.editor", "param.text", "param.name", "param.color", "param.skin"],
   nextpagelink: ["param.text", "param.url"],
   pagenavigation: ["param.display", "param.total", "param.pagenavigation"],
   pagenavigationitem: ["param.class", "param.text"],
   prevpagelink: ["param.text", "param.url"],
   rssImage: ["param.image", "param.imgTitle", "param.imgUrl", "param.url"]
};


// H O P O B J E C T 

HELP.macros.HopObject = {
   createtime: 244877,
   creator: 142525,
   href: 0,
   "id": 0,
   link: 14956,
   loop: 0,
   modifier: 0,
   modifytime: 244877,
   skin: 254592,
   "switch": 0,
   url: 142549
};

HELP.skins.HopObject = {
   "delete": ["response.action", "param.description", "param.detail"]
};


// R O O T

HELP.macros.Root = {
   //layoutchooser: 0,
   loginstatus: 247663,
   sitecounter: 249998,
   //sysmgrnavigation: 0,
   title: 142337,
   url: 142339
};

HELP.skins.Root = {
   rss: ["param.title", "param.email", "param.lastupdate", "param.resources", "param.textinput", "param.items"],
   list: ["response.sitelist", "response.prevpage", "response.nextpage"],
   "new": ["response.action"],
   page: ["response.title", "response.message", "response.body"]
};


// U S E R

HELP.macros.User = {
   email: 0,
   name: 0,
   password: 0,
   publishemail: 0,
   sitelist: 0,
   url: 0
   //sysmgr_count: 0, 
   //sysmgr_statusflags: 0, 
   //sysmgr_editlink: 0, 
   //sysmgr_username: 0, 
   //sysmgr_registered: 0, 
   //sysmgr_lastvisit: 0, 
   //sysmgr_trusted: 0, 
   //sysmgr_blocked: 0, 
   //sysmgr_sysadmin: 0
};

HELP.skins.User = {
   mailbody: ["param.name, param.password"],
   edit: ["response.action"],
   subscription: ["response.sitelist"]
   //sysmgr_edit: ["response.action", "request.item", "request.page"]
};


// C H O I C E

HELP.macros.Choice = {
   title: 0
};

HELP.skins.Choice = {
   edit: ["param.count", "param.value"],
   graph: ["param.width"],
   main: ["param.name", "param.value", "param.checked", "param.title"],
   result: ["param.graph", "param.percent", "param.count", "param.text", "param.title"]
};


// C O M M E N T

HELP.macros.Comment = {
   commentform: 254497,
   commentlink: 254605,
   comments: 254661,
   content: 142506,
   deletelink: 254515,
   editlink: 254563,
   modifier: 142525,
   replylink: 254694,
   url: 0
};

HELP.skins.Comment = {
   edit: ["response.action"]
};


// D A Y

HELP.macros.Day = {
   date: 0,
   link: 0,
   storylist: 0
};

HELP.skins.Day = {
   main: ["response.storylist", "response.prevpage", "response.nextpage"]
};


// F I L E
HELP.macros.Asset = {
   alias: 254484,
   clicks: 254490,
   deletelink: 0,
   description: 254488,
   editlink: 0,
   filesize: 254493,
   filetype: 254495,
   mimetype: 254498,
   viewlink: 0,
   url: 254504
};

HELP.skins.Asset = {
   edit: ["response.action"],
   main: ["param.text"]
}


// F I L E M G R

HELP.skins.AssetMgr = {
   main: ["response.filelist", "response.pagenavigation"]
};


// I M A G E

HELP.macros.Picture = {
   alias: 254543,
   alttext: 254547,
   code: 0,
   deletelink: 0,
   editlink: 0,
   gallery: 0,
   height: 254548,
   show: 254560,
   url: 254552,
   width: 254548
};

HELP.skins.Picture = {
   edit: ["response.action", "request.topic"]
};


// I M A G E M G R

HELP.macros.PictureMgr = {
   imagelist: 0
   //topicchooser: 0
};

HELP.skins.PictureMgr = {
   main: ["response.imagelist", "response.pagenavigation"],
   "new": ["response.action", "request.topic"]
};


// L A Y O U T

HELP.macros.Layout = {
   activatelink: 0, 
   alinkcolor: 650901, 
   bgcolor: 650901, 
   copyright: 0, 
   deletelink: 0, 
   description: 0, 
   email: 0, 
   image: 651308, 
   linkcolor: 650901, 
   parent: 0, 
   shareable: 0, 
   smallfont: 650901, 
   smallsize: 650901, 
   smallcolor: 650901, 
   "switch": 0,
   testdrivelink: 0, 
   textfont: 650901, 
   textsize: 650901, 
   textcolor: 650901, 
   title: 0, 
   titlefont: 650901, 
   titlesize: 650901, 
   titlecolor: 650901, 
   vlinkcolor: 650901
};

HELP.skins.Layout = {
   download: ["response.action"],
   edit: ["response.action"]
};


// L A Y O U T I M A G E

HELP.macros.LayoutPicture = {
   deletelink: 0,
   editlink: 0
};


HELP.skins.LayoutPicture = {
   edit: ["response.action"]
};


// L A Y O U T I M A G E M G R

HELP.macros.LayoutPictureMgr = {
   navigation: 0
};


HELP.skins.LayoutPictureMgr = {
   main: ["response.imagelist", "response.pagenavigation"],
   "new": ["response.action"]
};


// L A Y O U T M G R

HELP.macros.LayoutMgr = {
   layoutchooser: 0
};


HELP.skins.LayoutMgr = {
   "import": ["response.layoutlist", "response.pagenavigation"],
   main: ["response.layoutlist", "response.pagenavigation"],
   "new": ["response.action", "response.layoutlist", "response.pagenavigation"]
};


// M E M B E R M G R

HELP.macros.MemberMgr = {
   membership: 0,
   subscribelink: 0,
   subscriptionslink: 0
};

HELP.skins.MemberMgr = {
   login: ["response.action"],
   mailnewmember: ["param.creator", "param.account", "param.site", "param.url"],
   mailpassword: ["param.text"],
   mailregconfirm: ["param.name", "param.password"],
   main: ["response.memberlist", "response.pagenavigation"],
   "new": ["response.action", "response.searchresult"],
   register: ["response.action"],
   searchresult: ["response.action", "param.result"],
   searchresultitem: ["param.name", "param.description"],
   sendpwd: ["response.action"]
};


// M E M B E R S H I P

HELP.macros.Membership = {
   deletelink: 0,
   editlink: 0,
   email: 0,
   level: 0,
   sitetitle: 0,
   unsubscribelink: 0,
   url: 0, 
   username: 0
};

HELP.skins.Membership = {
   edit: ["response.action"],
   mailmessage: ["param.text"],
   mailto: ["response.action", "request.text"]
};


// P O L L

HELP.macros.Poll = {
   choices: 254699,
   closelink: 254703,
   closetime: 254703,
   editlink: 254714,
   deletelink: 254716,
   question: 254722,
   results: 254729,
   viewlink: 254713,
   total: 254737
};

HELP.skins.Poll = {
   edit: ["response.action", "response.choices"],
   main: ["response.action"]
};


// P O L L M G R

HELP.skins.PollMgr = {
   main: ["response.pollList", "response.pagenavigation"]
};


// S I T E

HELP.macros.Site = {
   age: 142397,
   alias: 142378,
   calendar: 142395,
   email: 142378,
   //enableping: 0, 
   //hasdiscussions: 0,
   history: 142404,
   lastupdate: 244877,
   //layoutchooser: 0, 
   listMostRead: 0,
   listReferrers: 0,
   localechooser: 0, 
   loginstatus: 0, 
   //longdateformat: 0, 
   monthlist: 142461,
   navigation: 244843, 
   //notification: 0, 
   //notify: 0, 
   online: 0, 
   //preferences: 0, 
   //shortdateformat: 0, 
   //showarchive: 0,
   //showdays: 0, 
   spamfilter: 0, 
   //sysmgr_count: 0, 
   //sysmgr_statusflags: 0, 
   //sysmgr_editlink: 0, 
   //sysmgr_deletelink: 0, 
   //sysmgr_trusted: 0, 
   //sysmgr_blocked: 0, 
   //timezonechooser: 0, 
   title: 247655,
   tagline: 15131,
   //usermaycontrib: 0,
   xmlbutton: 15492
};

HELP.skins.Site = {
   calendar: ["param.calendar", "param.month", "param.year", "param.back", "param.forward"],
   calendarday: ["param.day"],
   calendardayheader: ["param.day"],
   calendarselday: ["param.day"],
   calendarweek: ["param.week"],
   edit: ["response.action"],
   main: ["response.storylist", "response.prevpage", "response.nextpage"],
   "new": ["response.action"],
   notificationMail: ["param.url", "param.user"],
   page: ["response.body", "response.title", "response.message"],
   referrerItem: ["param.count", "param.text", "param.referrer"],
   referrers: ["response.action", "request.filter"],
   rss: ["param.title", "param.creator", "param.email", "param.lastupdate", "param.resources", "param.items"],
   rssItem: ["param.title", "param.date", "param.publisher", "param.creator", "param.email", "param.year"],
   searchform: ["response.action", "request.q"]
   //sysmgr_delete: ["response.action", "request.page"],
   //sysmgr_edit: ["response.action", "request.page", "request.item"]
};


// S K I N

HELP.macros.Skin = {
   proto: 0
}

HELP.skins.Skin = {
   diff: ["response.status", "response.diff"],
   diffline: ["param.num", "param.status", "param.class", "param.line"]
}


// S K I N M G R

HELP.macros.SkinMgr = {
   macros: 0,
   prototypechooser: 0,
   skinmacros: 0
}

HELP.skins.SkinMgr = {
   edit: ["param.text", "param.title", "response.action", "param.action", "request.skinset", "request.key", "param.key", "param.skin"],
   main: ["response.list"],
   "new": ["response.action"],
   page: ["responst.title", "response.body"],
   treebranch: ["param.class", "param.skinset", "param.anchor", "param.title", "param.text", "param.skins", "param.children"],
   treeleaf: ["param.key", "param.skinset", "param.action", "param.title", "param.status", "param.text"]
}


// S T O R Y

HELP.macros.Story = {
   addtofront: 0,
   backlinks: 40917,
   commentcounter: 26573,
   commentform: 254497,
   commentlink: 142558,
   comments: 254507,
   content: 142506,
   createtime: 244877,
   deletelink: 254515,
   discussions: 254522,
   editableby: 254559,
   editlink: 254563,
   location: 0,
   modifier: 142525,
   online: 0,
   onlinelink: 254568,
   topic: 142577,
   topicchooser: 254595,
   viewlink: 254597
};

HELP.skins.Story = {
   backlinkItem: ["param.count", "param.referrer", "param.text"],
   backlinks: ["param.referrers"],
   edit: ["response.action", "request.topic"],
   mostreads: ["param.rank", "param.reads"],
   rssItem: ["param.url", "param.title", "param.text", "param.publisher", "param.creator", "param.email", "param,subject", "param.year", "param.creator", "param.date"]
};


// S T O R Y M G R

HELP.skins.StoryMgr = {
   main: ["response.storylist", "response.pagenavigation"],
};


// S Y S M G R

HELP.macros.SysMgr = {
   //drowdown: 0
};


HELP.skins.SysMgr = {
   blockwarnmail: ["param.site", "param.url", "param.privatetime", "param.daysleft", "param.contact"],
   deletewarnmail: ["param.site", "param.url", "param.inactivity", "param.daysleft"],
   list: ["response.list", "response.pagenavigation"],
   setup: ["response.action"],
   sitesearchform: ["response.action"],
   status: ["param.upSince", "param.activeThreads", "param.maxThreads", "param.freeThreads", "param.sessions", "param.requests", "param.xmlrpc", "param.errors", "param.cacheUsage", "param.totalMemory", "param.usedMemory", "param.freeMemory"],
   syslogsearchform: ["response.action"],
   usersearchform: ["response.action"]
}


// T O P I C

HELP.macros.Topic = {
   addstory: 0,
   addimage: 0
};

HELP.skins.Topic = {
   main: ["response.storylist", "response.prevpage", "response.nextpage"]
};


// T O P I C M G R

HELP.macros.TopicMgr = {
   topiclist: 0
};
