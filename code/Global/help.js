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

HELP.macros.global = {
   colorpicker: 246684, 
   file: 15078, 
   image: 14962, 
   imagelist: 142488, 
   link: 14956, 
   now: 246588, 
   poll: 14957, 
   sitelist: 15372, 
   story: 246618, 
   storylist: 246675, 
   topiclist: 142469, 
   username: 246622, 
   linkedpath: 235746, 
   logo: 14986
};

HELP.skins.global = {
   colorpickerWidget: ["param.editor", "param.text", "param.name", "param.color", "param.skin"],
   prevpagelink: ["param.text", "param.url"],
   nextpagelink: ["param.text", "param.url"],
   rssImage: ["param.image", "param.imgTitle", "param.imgUrl", "param.url"]
};


// H O P O B J E C T 

HELP.macros.hopobject = {
   createtime: 244877,
   modifytime: 244877,
   creator: 142525,
   link: 14956,
   modifier: 0,
   skin: 254592,
   url: 142549
};

HELP.skins.hopobject = {
   "delete": ["response.action", "param.what"]
};


// R O O T

HELP.macros.root = {
   sitecounter: 249998,
   sitelist: 15372,
   title: 142337,
   url: 142339,
   loginstatus: 0
};

HELP.skins.root = {
   rss: ["param.title", "param.email", "param.lastupdate", "param.resources", "param.textinput", "param.items"]
};


// C H O I C E

HELP.macros.choice = {
   title: 0
};

HELP.skins.choice = {
   edit: ["param.count", "param.value"],
   graph: ["param.width"],
   main: ["param.name", "param.value", "param.checked", "param.title"],
   result: ["param.graph", "param.percent", "param.count", "param.text", "param.title"]
};


// C O M M E N T

HELP.macros.comment = {
   deletelink: 254515,
   editlink: 254563,
   commentform: 254497,
   commentlink: 254605,
   comments: 254661,
   content: 142506,
   modifier: 142525,
   replylink: 254694
};

HELP.skins.comment = {
   edit: ["response.action"]
};


// D A Y

HELP.macros.day = {
   storylist: 0,
   timestamp: 0
};

HELP.skins.day = {
   main: ["response.prevpage", "response.nextpage"]
};


// F I L E
HELP.macros.file = {
   editlink: 0,
   deletelink: 0,
   alias: 254484,
   description: 254488,
   clicks: 254490,
   filesize: 254493,
   filetype: 254495,
   mimetype: 254498,
   url: 254504
};

HELP.skins.file = {
   edit: ["response.action"],
   "new": ["response.action"]
}


// F I L E M G R

HELP.macros.filemgr = {
   files: 0
};

HELP.skins.filemgr = {
   main: ["response.prevpage", "response.nextpage"]
};


// I M A G E

HELP.macros.image = {
   alias: 254543,
   alttext: 254547,
   width: 254548,
   height: 254548,
   url: 254552,
   show: 254560
};

HELP.skins.image = {
   edit: ["response.action"],
   "new": ["response.action"]
};


// I M A G E M G R

HELP.macros.imagemgr = {
   images: 0,
   imagelist: 0
};

HELP.skins.imagemgr = {
   main: ["response.prevpage", "response.nextpage"]
};


// M E M B E R M G R

HELP.macros.membermgr = {
   membership: 0,
   subscribelink: 0,
   subscriptionslink: 0,
   memberlist: 0
};

HELP.skins.membermgr = {
   main: ["response.action"],
   login: ["response.action"],
   mailnewmember: ["param.creator", "param.account", "param.site", "param.url"],
   membergroup: ["param.group", "param.list"],
   mailpassword: ["param.timestamp", "param.text"],
   searchresult: ["response.searchresult"],
   searchresultitem: ["param.name", "param.description"],
   sendpwd: ["response.action"]
};


// M E M B E R S H I P

HELP.macros.membership = {
   username: 0,
   email: 0,
   url: 0,
   level: 0,
   sitetitle: 0,
   deletelink: 0,
   unsubscribelink: 0
};

HELP.skins.membership = {
   edit: ["response.action"]
};


// P O L L

HELP.macros.poll = {
   choices: 254699,
   closelink: 254703,
   closetime: 254703,
   viewlink: 254713,
   editlink: 254714,
   deletelink: 254716,
   question: 254722,
   results: 254729,
   total: 254737
};

HELP.skins.poll = {
   main: ["response.action"],
   edit: ["response.action"]
};


// P O L L M G R

HELP.macros.pollmgr = {
   pollList: 0
};

HELP.skins.pollmgr = {
   main: ["response.prevpage", "response.nextpage"]
};


// S H O R T C U T

HELP.macros.shortcut = {
   creator: 0,
   render: 0,
   placeholder: 0
};

HELP.skins.shortcut = {
   main: ["param.id"]
};


// S H O R T C U T M G R

HELP.macros.shortcutmgr = {
   shortcutlist: 0
};

HELP.skins.shortcutmgr = {
   main: ["response.action"]
};


// S I T E

HELP.macros.site = {
   age: 142397,
   alias: 142378,
   alinkcolor: 15131,
   bgcolor: 15131,
   linkcolor: 15131,
   smallcolor: 15131,
   smallfont: 15131,
   smallsize: 15131,
   textcolor: 15131,
   textfont: 15131,
   textsize: 15131,
   titlecolor: 15131,
   titlefont: 15131,
   titlesize: 15131,
   vlinkcolor: 15131,
   xmlbutton: 15492,
   calendar: 142395,
   email: 142378,
   history: 142404,
   membercounter: 247667,
   lastupdate: 244877,
   monthlist: 142461,
   navigation: 244843,
   title: 15131,
   tagline: 15131,
   topiclist: 142469,
   url: 142549
};

HELP.skins.site = {
   calendar: ["param.calendar", "param.month", "param.year", "param.back", "param.forward"],
   calendarday: ["param.day"],
   calendardayheader: ["param.day"],
   calendarselday: ["param.day"],
   calendarweek: ["param.week"],
   edit: ["response.action", "response.title"],
   main: ["response.prevpage", "response.nextpage"],
   "new": ["response.action"],
   page: ["response.body", "response.title", "response.message"],
   referrerItem: ["param.count", "param.text", "param.referrer"],
   rss: ["param.title", "param.creator", "param.email", "param.lastupdate", "param.resources", "param.items"],
   rssItem: ["param.title", "param.date", "param.publisher", "param.creator", "param.email", "param.year"],
   searchform: ["response.action", "request.q"]
};


// S T O R Y

HELP.macros.story = {
   addtofront: 0,
   backlinks: 40917,
   commentcounter: 26573,
   commentform: 254497,
   commentlink: 142558,
   comments: 254507,
   content: 142506,
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

HELP.skins.story = {
   backlinkItem: ["param.count", "param.referrer", "param.text"],
   backlinks: ["param.referrers"],
   edit: ["response.action", "request.topic"],
   mostreads: ["param.rank", "param.reads"],
   rssItem: ["param.url", "param.title", "param.text", "param.publisher", "param.creator", "param.email", "param,subject", "param.year", "param.creator", "param.date"]
};


// S T O R Y M G R

HELP.macros.storymgr = {
   storylist: 0
};

HELP.skins.storymgr = {
   main: ["response.prevpage", "response.nextpage"],
};


// T O P I C

HELP.macros.topic = {
   addstory: 0,
   storylist: 0
};

HELP.skins.topic = {
   main: ["response.prevpage", "response.nextpage"]
};


// T O P I C M G R

HELP.macros.topicmgr = {
   topiclist: 0
};


// U S E R

HELP.macros.user = {
   name: 0,
   password: 0,
   url: 0,
   email: 0,
   publishemail: 0,
   description: 0,
   membershiplist: 0,
   subscriptionlist: 0,
   sitelist: 0
};

HELP.skins.user = {
   mailbody: ["param.name, param.password"],
   edit: ["response.action"]
};
