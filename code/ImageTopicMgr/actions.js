/**
 * main action
 */
function main_action() {
   res.data.title = "Galleries of " + this._parent._parent.title;
   res.data.body = this.renderSkinAsString ("main");
   res.handlers.site.renderSkin("page");
   return;
}
