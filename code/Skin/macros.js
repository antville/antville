/**
 * macro rendering source of skin
 */

function skin_macro(param) {
   if (param.as == "editor")
      this.renderInputTextarea(this.createInputParam("skin",param));
   else
      res.write(this.skin);
}

