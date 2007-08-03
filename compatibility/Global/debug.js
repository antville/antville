Site.prototype.debug_action = function() {
   res.debug(this.tags.get(1).stories.get(1).tagged.title);
   return;
   //res.debug(this.members.get(0).user);
   var story = Story.getById(882443);
   res.debug(story.content.set("tags", story.topic));
return;
   
   var str = '<?xml version="1.0" encoding="UTF-8"?> <!-- printed by helma object publisher --> <!-- created Mon Sep 09 21:56:07 CEST 2002 --> <xmlroot xmlns:hop="http://www.helma.org/docs/guide/features/database"> <hopobject id="t801649" name="" prototype="hopobject" created="1031601367757" lastModified="1031601367757"> <title>Learning Futures</title> <text>Continuing my education is the first and foremost way I can build on my professional and academic developmdnt Accessing more information on my own time is another way. Listening is always a good way to generate thinking and doing. As I am sure I will be involved with other SLP&amp;#8217;s, I plan to discuss and share ideas. Subscribing to journals should help me to research material as I nedd at. As anyone in any profession should, I will anticipate and take advantage of any oppurtunities for inquiry by accepting a challenging client or project. I strive to meet the needs of my own learning by challenging myself to become more informed in any area needed. Michelle</text> </hopobject> </xmlroot>';
   Xml.readFromString(str);
return;

   res.debug(this.href());
   res.debug(this.sys_url);
return;
   
   this.properties.setData({
      "date": new Date,
      "regex": /abc.*/g,
   });
   this.properties.setData(this);
   this.properties.set("foo", "bar");
   //this.properties.set("date", new Date);
   //this.properties.remove("date");
   this.properties.set("number", 1024);
   this.properties.set("list", [1,2,3]);
   this.properties.set("object", {x: 10, y: 20});
   res.debug(this.properties.get("foo").length);
   res.debug(this.properties.get("date"));//.format("yyyy-dd-MM"));
   res.debug(this.properties.get("number").format("00.00"));
   res.debug(this.properties.get("list")[2]);
   res.debug(this.properties.get("object").x);
return;

   res.debug(escape("http://antville.org/tobi/blabla".rot13()));
return;

   var s = "Hello, <% param.foo %>!";
   var param = new Object();
   param.foo = "World";
   renderSkin(createSkin(s), param);
   return;
};

Root.prototype.altdiff = function() {
   //var diff = WDiffString(originalSkin, this.getSource());
   //res.writeln(diff);
   
   var diff = new diff_match_patch();
   var delim = /\r\n|\r|\n/g;
   var originalText = originalSkin.replace(delim, "\n");
   var modifiedText = this.getSource().replace(delim, "\n");
   var diffResult = diff.diff_main(originalText, modifiedText);
   //res.debug(encode(diffResult.join("**************")))
   //res.debug(diffResult.length)
   diff.diff_cleanupSemantic(diffResult);
   var modifiedLines = modifiedText.split(delim);
   var lineNumber = 0;
   var currentText, remainder;
   res.writeln("<tt>");
   for (var i=0; i<diffResult.length; i+=1) {
      var parts = diffResult[i];
      var type = parts[0];
      var text = parts[1];
      switch (type) {
         case  0:
         res.write(text);
         break;
         case  1:
         res.write('<ins>');
         res.encode(text);
         res.write('</ins>');
         break;
         case -1:
         res.write('<del>')
         res.encode(text);
         res.write('</del>');
         break;
      }
/*
      if (type === 0) {
         var pos = text.lastIndexOf("\n");
         currentText = text.substring(0, pos);
         remainder = pos > -1 ? text.substring(pos) : "";
      } else if (type === 1){
         res.
         res.encode(text);
         res.encode(remainder);
      } else if (type === -1) {
         res.write('<span style="background-color: yellow;">');
         res.encode(modifiedLines[lineNumber]);
         res.encode(remainder);
         remainder = "";
         res.encode(text);
      }
*/
   }
   res.writeln("</tt>");
   res.abort();
   
   var remainder = String.EMPTY;
   for (var i in modifiedLines) {
      res.encode(modifiedLines[i]);
      res.writeln(remainder);
      while (true) {
         var str = diffResult.shift();
         var pos = str.indexOf("\n");
         res.writeln(str.substring(0, pos));
         if (pos < str.length) {
            remainder = str.substring(pos+1);
         }
      }
   }
   
   res.encode(diffResult.toSource());
   var diffHtml = diff.diff_prettyHtml(diffResult);
   var modifiedLines = modifiedText.split(delim);
   var diffLines = diffHtml.split("&para;<BR>");
   res.writeln("<pre>");
   for (var i in modifiedLines) {
      var str1 = encode(modifiedLines[i]);
      res.writeln(str1);
      if (str1 !== diffLines[i]) {
         res.writeln(diffLines[i]);
      }
   }
   res.writeln("</pre>");
   res.abort();
};

String.prototype.rot13 = function() {
   var result = "";
   Array.forEach(this, function(chr) {
      var index = String.ALPHABET.indexOf(chr.toUpperCase());
      if (index < 0) {
         result += chr;
      } else {
         var rotated = String.ROT13.charAt(index);
         result += (chr.toLowerCase() === chr ? rotated.toLowerCase() : rotated);
      }
   });
   return result;
}

String.ALPHABET = (function() {
   var alphabet = "";
   for (var i=65; i<91; i+=1) {
      alphabet += String.fromCharCode(i);
   }
   return alphabet;
})();

String.ROT13 = String.ALPHABET.substr(13) + String.ALPHABET.substr(0, 13);

Array.forEach = function(ref) {
   return Array.prototype.forEach.call(ref, arguments[1]);
};

function alert(str) {
   res.writeln('<script type="text/javascript">alert("' + str + '");</script>');
   return;
}
