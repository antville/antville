/**
 * macro rendering source of skin
 */

function skin_macro(param) {
   res.write(param.prefix)
   if (param.as == "editor")
      this.renderInputTextarea(this.createInputParam("skin",param));
   else
      res.write(this.skin);
   res.write(param.suffix);
}

