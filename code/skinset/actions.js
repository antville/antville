/**
 * main action
 */

function main_action() {
   res.data.title = "Skins of " + res.handlers.context.title;
   res.data.body = this.renderSkinAsString("main");
   this._parent._parent.renderSkin("page");
}

/**
 * edit action
 */
function edit_action() {
   if (req.data.cancel) {
      res.redirect(this.href("skins") + "#" + req.data.proto + req.data.name);
   } else if (req.data.save) {
      try {
         res.message = this.saveSkin(req.data.proto, req.data.name, req.data.skin, session.user);
         res.redirect(this.href("skins") + "#" + req.data.proto + req.data.name);
      } catch (err) {
         res.message = err.toString();
      }
   }
   
   res.data.action = this.href(req.action);
   res.data.title = req.data.proto + "/" + req.data.name + ".skin of " + res.handlers.context.title;
   res.data.body = this.renderSkinAsString("edit");
   this._parent.renderSkin("page");
}

function edit2_action() {
   res.data.body = this.renderSkinAsString("edit2");
   this.getParent().renderSkin("page");
}

/**
 * action rendering the differences between the original skin
 * and the modified one
 */
function diff_action() {
   if (!req.data.proto || !req.data.name ||
       !this[req.data.proto] || !this[req.data.proto][req.data.name] ||
       !app.skinfiles[req.data.proto]) 
   {
      res.message = new Exception("skinDiff");
      res.redirect(this.href());
   }
   
   // get the modified and original skins
   var modifiedSkin = this[req.data.proto][req.data.name].skin;
   var originalSkin = this.parent && this.parent[req.data.proto] && 
                      this.parent[req.data.proto][req.data.name] ? 
          this.parent[req.data.proto][req.data.name].skin : 
          app.skinfiles[req.data.proto][req.data.name];

   var buf = new java.lang.StringBuffer();
   if (originalSkin == null || modifiedSkin == null) {
      buf.append("Invalid Parameters. No Diff.");
   } else {
      buf.append("<h3>Diffs for "+req.data.proto+"/"+req.data.name+"</h3>");
      var diff = originalSkin.diff(modifiedSkin);
      if (!diff) {
         buf.append("No differences were found");
      } else {
         // print a short explanation of the output format
         buf.append("<span style=\"background: #FF3333\">&nbsp;&nbsp;&nbsp;&nbsp;</span> ");
         buf.append(" Lines removed from original skin<br />");
         buf.append("<span style=\"background: #33CC33\">&nbsp;&nbsp;&nbsp;&nbsp;</span> ");
         buf.append(" Lines added to modified skin<br />");
         
         buf.append("<pre>");
         for (var i in diff) {
            var line = diff[i];
            if (line.deleted) {
               for (var j=0;j<line.deleted.length;j++)
                  buf.append((line.num + j) + " DEL <span style=\"background: #FF3333\">" + encode(line.deleted[j]) + "</span>\r\n");
            }
            if (line.inserted) {
               for (var j=0;j<line.inserted.length;j++)
                  buf.append((line.num + j) + " INS <span style=\"background: #33CC33\">" + encode(line.inserted[j]) + "</span>\r\n");
            }
            if (line.value) {
               buf.append(line.num + "     <span>" + encode(line.value) + "</span>\r\n");
            }
         }
         buf.append("</pre>");
      }
   }
   res.data.title = "Diffs for " + req.data.proto + "/" + req.data.name + 
                    ".skin of " + res.handlers.context.title;
   res.data.body = buf.toString();
   this.renderSkin("page");
}

/**
 * action renders the skinmgr menu in a safe (eg. unscrewable) way using
 * the page skin of skinmgr instead of the one of the site
 * so if something goes wrong this action should at least
 * give users the possibility to undo their changes
 */
function safe_action() {
   res.data.title = res.handlers.context.title;
   res.data.body = this.renderSkinAsString("main");
   this.renderSkin("page");
}

/**
 * action to test-drive this skinset in the current session.
 */
function startTestdrive_action() {
   res.message = "Test-driving skinset "+this.name;
   session.data.skinset = this;
   res.redirect(this.getParent().href());
}

/**
 * stop a skinset test and resume normal browsing.
 */
function stopTestdrive_action() {
   session.data.skinset = null;
   res.message = "[Switching back to standard skinset]";
   if (req.data.http_referer)
      res.redirect(req.data.http_referer);
   else
      res.redirect(this.getParent().href());
}

/**
 *  action displays a list of skins in this skinset.
 */
function skins_action() {
   res.data.title = "Skins of " + res.handlers.context.title;
   res.data.body = this.renderSkinAsString("skins");
   this._parent._parent.renderSkin("page");
}

/**
 * action deletes this skinset.
 */
function delete_action() {
   if (req.data.submit == "cancel" || req.data.cancel)
      res.redirect(this._parent.href());
   else if (req.data.submit == "delete" || req.data.remove) {
      var href = this._parent.href();
      res.message = this._parent.deleteSkinset(this);
      res.redirect(href);
   }

   res.data.action = this.href(req.action);
   res.data.title = res.handlers.context.title;

   var skinParam = new Object();
   skinParam.what = "the skinset &quot;" + this.name + 
                    "&quot; (created by " + this.creator.name + ")";

   res.data.body = this.renderSkinAsString("delete",skinParam);

   this._parent._parent.renderSkin("page");
}

