/**
 * macro writes storylist to response-object
 * kept for backwards-compatibility only
 */

function pollList_macro(param) {
   res.write(param.prefix)
   res.write(res.data.pollList);
   res.write(param.suffix);
   return;
}


function link_macro(param) {
	if (param.checkdeny == "true") {
		if (this.isDenied(user))
			return("");
	}

	res.write(param.prefix)
	this.openLink(param);
	if (param.text)
	  res.write(param.text);
	else
	  res.write(param.to ? param.to : param.linkto);
	this.closeLink();
	res.write(param.suffix);
}
