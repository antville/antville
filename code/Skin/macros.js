/**
 * macro rendering source of skin
 */

function skin_macro(param) {
   renderPrefix(param);
   if (param.as == "editor")
      this.renderInputTextarea(this.createInputParam("skin",param));
   else
      res.write(this.skin);
   renderSuffix(param);
}

