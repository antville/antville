/**
 * function checks if goodie fits to the minimal needs 
 */

function evalNewGoodie() {
   var newGoodie = new goodie();

   var rawgoodie = req.get("rawgoodie");
   if (req.get("uploadError")) {
      // looks like the file uploaded has exceeded uploadLimit ...
      res.message = "File too big to handle!";

   } else if (rawgoodie) {
      if (rawgoodie.contentLength == 0) {
         // looks like nothing was uploaded ...
         res.message = "Please upload a goodie and fill out the form ...";
      } else {
         // store extension of uploaded goodie in variable
         if (rawgoodie.name.lastIndexOf(".") > 0)
            var fileExt = rawgoodie.name.substring(rawgoodie.name.lastIndexOf("."));
         // first, check if alias already exists
         if (!req.data.alias)
            res.message = "You must enter a name for this goodie!";
         else if (this.get(req.data.alias))
            res.message = "There is already a goodie with this name!";
         else if (!isClean(req.data.alias))
            res.message = "Please do not use special characters in the name!";
         else if (!fileExt)
            res.message = "The file has no valid extension!";
         else {
            // store properties necessary for goodie-creation
            newGoodie.alias = req.data.alias;
            newGoodie.alttext = req.data.alttext;
            newGoodie.file = req.data.alias + fileExt;
            newGoodie.filesize = rawgoodie.contentLength;
            newGoodie.mimetype = rawgoodie.contentType;
            newGoodie.description = req.data.description;
 
            var saveTo = getProperty("goodiePath") + this._parent.alias + "/";
            // any errors?
            if (rawgoodie.writeToFile(saveTo,newGoodie.file)) {
               // the goodie is on disk, so we add the goodie-object
               this.addGoodie(newGoodie);
               res.redirect(this.href());
            } 
         }
      }
   }
   return (newGoodie);
}


/**
 * function adds a goodie to pool
 */

function addGoodie(newGoodie) {
   newGoodie.creator = user;
   newGoodie.createtime = new Date();
   if (this.add(newGoodie))
      res.message = "The goodie " + newGoodie.alias + " was added successfully!";
   else
      res.message = "Ooops! Adding the goodie " + newGoodie.alias + " failed!";
   return;
}

/**
 * alias of goodie has changed, so we remove it and add it again with it's new alias
 */

function changeAlias(currGoodie) {
   currGoodie.setParent(this);
   this.remove(currGoodie);
   this.set(currGoodie.alias,null);
   currGoodie.alias = req.data.alias;
   this.add(currGoodie);
   return;
}

/**
 * delete a goodie
 */

function deleteGoodie(currGoodie) {
   currGoodie.setParent(this);
   // first we try to remove the goodie from disk
   var f = new File(getProperty("goodiePath") + currGoodie.weblog.alias, currGoodie.file);
   if (f.remove()) {
      if (this.remove(currGoodie))
         res.message = "The goodie was deleted successfully!";
      else
         res.message = "Ooops! Couldn't delete the goodie!";
   } else
      res.message = "Ooops! Couldn't remove the goodie from disk!";
   res.redirect(this.href("main"));
}