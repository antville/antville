/**
 * main action
 */
function main_action() {
   res.data.title = "Topics of " + this._parent.title;
   res.data.body = this.renderSkinAsString ("main");
   this._parent.renderSkin("page");
   return;
}
