/**
 * function checks if story fits to the minimal needs (must have at least a text ;-)
 */

function evalNewStory() {
   var newStory = new story();
   
   if (req.data.text) {
      newStory.weblog = path.weblog;
      newStory.title = req.data.title;
      newStory.text = req.data.text;
      newStory.online = parseInt(req.data.online) ? parseInt(req.data.online) : 0;
      if (req.data.editableby != null && req.data.editableby != "")
         newStory.editableby = parseInt(req.data.editableby,10);
      else
         newStory.editableby = 2;
      newStory.author = user;
      newStory.createtime = new Date();
      newStory.modifytime = new Date();
      newStory.day = newStory.createtime.format("yyyyMMdd");
      path.weblog.add(newStory);
      if (newStory.online)
         path.weblog.lastupdate = newStory.createtime;
      res.message = "The story was created successfully!";
      res.redirect(this.href());
   } else
      return (newStory);
}


/**
 * delete a story
 * including all the comments
 */

function deleteStory(currStory) {
   for (var i=currStory.size();i>0;i--)
      currStory.deleteComment(currStory.get(i-1));
   currStory.setParent(path.weblog);
   if (path.weblog.remove(currStory)) {
      path.weblog.lastupdate = new Date();
      res.message = "The story was deleted successfully!";
   } else
      res.message = "Ooops! Couldn't delete the story!";

   res.redirect(this.href());
}

