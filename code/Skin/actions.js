/**
 * action rendering the differences between the original skin
 * and the modified one
 */
function diff_action() {
   // get the modified and original skins
   var originalSkin = this.layout.skins.getOriginalSkinSource(this.proto, this.name);

   if (originalSkin == null) {
      res.data.status = "This is a custom skin, therefor no differences can be displayed";
   } else {
      var diff = originalSkin.diff(this.skin ? this.skin : "");
      if (!diff) {
         res.data.status = "No differences were found";
      } else {
         res.push();
         var sp = new Object();
         for (var i in diff) {
            var line = diff[i];
            sp.num = line.num;
            if (line.deleted) {
               sp.status = "DEL";
               sp["class"] = "removed";
               for (var j=0;j<line.deleted.length;j++) {
                  sp.num = line.num + j;
                  sp.line = encode(line.deleted[j]);
                  this.renderSkin("diffline", sp);
               }
            }
            if (line.inserted) {
               sp.status = "ADD";
               sp["class"] = "added";
               for (var j=0;j<line.inserted.length;j++) {
                  sp.num = line.num + j;
                  sp.line = encode(line.inserted[j]);
                  this.renderSkin("diffline", sp);
               }
            }
            if (line.value != null) {
               sp.status = "&nbsp;";
               sp["class"] = "line";
               sp.line = encode(line.value);
               this.renderSkin("diffline", sp);
            }
         }
         res.data.diff = res.pop();
      }
   }
   res.data.body = this.renderSkinAsString("diff");
   res.data.title = "Diffs for " + this.proto + "/" + this.name + ".skin of layout " + this.layout.title;
   this.layout.skins.renderSkin("page");
}

/**
 * delete action
 */
function delete_action() {
   if (req.data.cancel)
      res.redirect(this.layout.skins.href());
   else if (req.data.remove) {
      try {
         res.message = this.layout.skins.deleteSkin(this);
         res.redirect(this.layout.skins.href());
      } catch (err) {
         res.message = err.toString();
      }
   }

   res.data.action = this.href(req.action);
   res.data.title = res.handlers.context.getTitle();
   var skinParam = {
      description: "modifications of the skin",
      detail: this.name
   };
   res.data.body = this.renderSkinAsString("delete", skinParam);
   res.handlers.context.renderSkin("page");
}
