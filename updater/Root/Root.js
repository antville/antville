Root.prototype.start_action = function() {
   app.invokeAsync(global, function() {
      //execute(sql("tag"));
      //execute(sql("tag_hub"));
      //update("AV_ACCESSLOG");
      //update("AV_CHOICE");
      //update("AV_FILE");
      //update("AV_IMAGE");
      //update("AV_LAYOUT");
      //update("AV_MEMBERSHIP");
      //update("AV_POLL");
      //update("AV_SITE");
      //update("AV_SKIN");
      //update("AV_SYSLOG");
      update("AV_TEXT");
      return;
   }, [], -1);
   renderSkin("Global");
   return;

   app.invokeAsync(global, function() {
      for (var i=0; i<10; i+=1) {
         println(i);
         for (var w=0; w<10000000; w+=1) {}
      }
   }, [], 5000);
};

Root.prototype.status_js_action = function() {
   if (app.data.out) {
      res.write(app.data.out.toString());
      app.data.out.setLength(0);
   }
   return;
};
