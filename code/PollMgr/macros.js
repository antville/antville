/**
 * macro writes storylist to response-object
 * kept for backwards-compatibility only
 */

function pollList_macro(param) {
   res.write(res.data.pollList);
   return;
}


function link_macro(param) {
	if (param.checkdeny == "true") {
		if (this.isDenied(session.user))
			return("");
	}

	this.openLink(param);
	if (param.text)
	  res.write(param.text);
	else
	  res.write(param.to ? param.to : param.linkto);
	this.closeLink();
}
