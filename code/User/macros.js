/**
 * macro rendering username
 */

function name_macro(param) {
   renderPrefix(param);
   res.write(this.name);
   renderSuffix(param);
}

/**
 * macro rendering password
 */

function password_macro(param) {
   renderPrefix(param);
   if (param.as == "editor")
      this.renderInputPassword(this.createInputParam("password",param));
   else
      res.write(this.password);
   renderSuffix(param);
}


/**
 * macro rendering URL
 */

function url_macro(param) {
   renderPrefix(param);
   if (param.as == "editor")
      this.renderInputText(this.createInputParam("url",param));
   else
      res.write(this.url);
   renderSuffix(param);
}


/**
 * macro rendering email
 */

function email_macro(param) {
   renderPrefix(param);
   if (param.as == "editor")
      this.renderInputText(this.createInputParam("email",param));
   else
      res.write(this.email);
   renderSuffix(param);
}

/**
 * macro rendering description
 */

function description_macro(param) {
   renderPrefix(param);
   if (param.as == "editor")
      this.renderInputTextarea(this.createInputParam("description",param));
   else
      res.write(this.description);
   renderSuffix(param);
}

