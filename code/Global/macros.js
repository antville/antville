/**
 * macro renders the current timestamp
 */

function now_macro(param) {
   res.write(param.prefix)
   var now = new Date();
   if (param.format)
      res.write(now.format(param.format));
   else
      res.write(now.format("yyyy.MM.dd HH:mm"));
   res.write(param.suffix);
}

/**
 * macro renders the antville-logos
 * set global constants before
 */

big = new Array("big.gif",404,53,"antville.org");
small = new Array("smallanim.gif",98,30,"resident of antville.org");
smalltrans = new Array("smallanim.gif",98,30,"resident of antville.org");
smallstraight = new Array("smallstraight.gif",107,24,"resident of antville.org");
smallchaos = new Array("smallchaos.gif",107,29,"resident of antville.org");

function logo_macro(param) {
   if (!param.name)
      return;
   var logo = tryEval(param.name);
   if (logo.error || !logo.value)
      return;
   res.write("<a href=\"http://antville.org\">");
   res.write("<img src=\"" + getProperty("imgUrl") + logo.value[0] + "\"");
   res.write(" width=\"" + logo.value[1] + "\"");
   res.write(" height=\"" + logo.value[2] + "\"");
   res.write(" alt=\"" + logo.value[3] + "\" border=\"0\">");
   res.write("</a>");
}