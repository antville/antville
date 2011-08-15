$(document).ready(function() {
   $("a.cancel").click(function() {
      history.back();
      return false;
   });
   
   $("form #activation").closest("tr").addClass("activation");
   
   var group, groups = [];
   $("form #timeZone option").each(function(index, item) {
      var zone = $(item);
      var parts = zone.val().split("/");
      if (parts.length > 1) {
         if (parts[0].indexOf("Etc") === 0 || 
               parts[0].indexOf("SystemV") === 0) {
            zone.remove();
            return;
         }
         group !== parts[0] && groups.push(group = parts[0]);
         zone.addClass("group-" + group);
         zone.text(parts.splice(1).join(", ").replace(/_/g, " "));
      } else {
         zone.remove();
      }
   });
   var optgroup = $("<optgroup>");
   $.each(groups, function(index, item) {
      $("form #timeZone option.group-" + 
         item).wrapAll(optgroup.clone().attr("label", item));
   });
   
   if ($(".inEditorUpload").length > 0) {
      $("#av-imageUploadPane input").bind("keypress", function(event) {
         return event.keyCode !== 13;
      })
      
      //$(".av-slideOutContent, #av-imageChooserPane, #av-imageUploadPane").hide();
      $(".av-slideOutContent, #av-imageChooserPane").hide();
      $(".av-slideOutLabel").bind("click.av-slideOut", function(event) {
         event.preventDefault();
         var $slideContent = $(this).siblings(".av-slideOutContent");
         if ($slideContent.is(":visible")) {
            $slideContent.slideUp(250, function() {
               $(".av-slideOutLabel").show();
            });
         } else {
            $(".av-slideOutLabel").hide();
            $slideContent.slideDown(250);
         }
      });

      // Initialize the labels
      $("#av-inEditorSelector h2").text($("#av-inEditorSelector").data("i18n-upload"));
      $("#av-inEditorSelector button").text($("#av-inEditorSelector").data("i18n-chooser"));

      $("#av-inEditorSelector button").bind("click", function(event) {
         event.preventDefault();
         var inEditorState = $("#av-inEditorSelector").data("state");

         if (inEditorState === "upload") {
            $("#av-imageChooserContent").load($("#av-inEditorSelector").data("ajaxbaseurl") + "images/lastImages")
            $("#av-imageChooserContent").html()
            $("#av-imageUploadPane").hide();
            $("#av-imageChooserPane").show();
            $("#av-inEditorSelector").data("state", "chooser");

            $("#av-inEditorSelector h2").text($("#av-inEditorSelector").data("i18n-chooser"));
            $("#av-inEditorSelector button").text($("#av-inEditorSelector").data("i18n-upload"));
         } else {
            $("#av-imageUploadPane").show();
            $("#av-imageChooserPane").hide();
            $("#av-inEditorSelector").data("state", "upload");

            $("#av-inEditorSelector h2").text($("#av-inEditorSelector").data("i18n-upload"));
            $("#av-inEditorSelector button").text($("#av-inEditorSelector").data("i18n-chooser"));
         }

      });

      /*$("#av-activateImageUploadPane").bind("click", function(event) {
         event.preventDefault();
         $("#av-imageUploadPane").show();
         $("#av-imageChooserPane").hide();
      });*/

      /**
       * Disables the inline editor upload fields. They won't be part
       * of the submitted form's POST request.
       */
      $("#storyEditor").bind("submit", function(event) {
         $("#av-imageUploadPane input, #av-imageUploadPane textarea").prop("disabled", true);
         return true;
      });
   }
   
});

Antville = {};
Antville.prefix = "Antville_";

/**
 * Returns the reading time for the given textarea DOM element.
 */ 
Antville.readingTime = function($textarea) {
   var wordCount = $textarea.val().split(/\s+/i).length;
   return (wordCount / 240) * 60;
};

Antville.encode = function(str) {
   var chars = ["&", "<", ">", '"'];
   for (var i in chars) {
      var c = chars[i];
      var re = new RegExp(c, "g");
      str = str.replace(re, "&#" + c.charCodeAt() + ";");
   }
   return str;
};

Antville.decode = function(str) {
   return str.replace(/&amp;/g, "&");
};

Antville.Referrer = function(url, text, count) {
   this.url = url;
   this.text = text;
   this.count = count;
   this.compose = function(key, prefix) {
      var query = new Antville.Query(this.url);
      if (query[key]) {
         if (prefix == null)
            prefix = "";
         return prefix + Antville.encode(query[key]);
      }
      return this.text;
   }
   return this;
};

Antville.Query = function(str) {
   if (str == undefined)
      var str = location.search.substring(1);
   else if (str.indexOf("?") > -1)
      var str = str.split("?")[1];
   if (str == "")
      return this;
   var parts = Antville.decode(decodeURIComponent(str)).split("&");
   for (var i in parts) {
      var pair = parts[i].split("=");
      var key = pair[0];
      if (key) {
         key = key.replace(/\+/g, " ");
         var value = pair[1];
         if (value)
            value = value.replace(/\+/g, " ");
         this[key] = value;
      }
   }
   return this;
};

Antville.Filter = function(def, key) {
   this.key = key;
   if (def == null)
      this.items = [];
   else if (def instanceof Array)
      this.items = def;
   else
      this.items = def.replace(/\r/g, "\n").split("\n");
   this.test = function(str) {
      if (!str)
         return false;
      str = str.replace(/&amp;/g, "&");
      for (var n in this.items) {
         var re = new RegExp(this.items[n], "i");
         if (re.test(str))
            return true;
      }
      return false;
   }
   return this;
};

var app = {
   clearCache: function() {
      $.ajax({
         async: true,
         type: "POST",
         url: '/helma/antville/debug',
         data: "action=clearCache",
         cache: false,
         error: function() { /* ... */ },
         success: function(str) {
            //console.log(str);
         }
      });
   }
}