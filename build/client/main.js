window.$ = window.jQuery = require('jquery');
jQuery.md5 = require('js-md5/src/md5');

require('jquery-collagePlus/jquery.collagePlus');
require('jquery-collagePlus/extras/jquery.collageCaption');
require('jquery-collagePlus/extras/jquery.removeWhitespace');

require('uikit-bower/js/uikit');
require('uikit-bower/js/components/form-password');
require('uikit-bower/js/components/tooltip');
require('uikit-bower/js/components/upload');

$(function() {
   // Extend jQuery with selectText() method.
   $.fn.selectText = function() {
      var element = this.get(0);
      if (document.body.createTextRange) { // ms
         var range = document.body.createTextRange();
         range.moveToElementText(element);
         range.select();
      } else if (window.getSelection) { // moz, opera, webkit
         var selection = window.getSelection();
         var range = document.createRange();
         range.selectNodeContents(element);
         selection.removeAllRanges();
         selection.addRange(range);
      }
   };

   // Highlight the current navigation menu item
   var counter = 0;
   $('.uk-nav li').each(function (index, element) {
      if (counter > 0) {
         return;
      }
      var href = String($(element).find('a').attr('href')) + location.hash;
      var index = location.href.lastIndexOf(href);
      if (href && index > -1 && index + href.length === location.href.length) {
         $(element).addClass('uk-active');
         counter += 1;
      }
   });

   // Prevent redundant submits of a form
   $('form').one('submit', function (event) {
      var submit = $(this).find('[type=submit]');
      setTimeout(function () {
         submit.attr('disabled', true);
      }, 1);
   });

   // Show prompt to copy macro code
   $('a.av-clipboard-copy').on('click', function (event) {
      event.preventDefault();
      prompt($(this).data('text'), $(this).data('value'));
   });

   // Select the macro code when clicking on elements with the macro-code class.
   // FIXME: Obsolete (should move to compat layer)
   $('.macro-code').click(function(event) {
      $(this).selectText();
   });

   // Compatibility: Go back when cancel link is clicked
   $('a.cancel').on('click', function (event) {
      event.preventDefault();
      history.back()
   });

   // Add the skin controls for the layout sandbox
   /*$('body').prepend($('<div>').attr('class', 'layout-sandbox')
      .append($('<div>')
         .append($('<button>')
            .html('Exit Sandbox')
               .click(function() {
                  location.replace($('a[href$='sandbox']').attr('href'));
               }))));*/
   $('.av-skin').each(function() {
      var skinButton = $('<span class="av-skin-control"><a class="av-skin-edit-link">');
      skinButton.find('a').attr({
         'data-uk-tooltip': true,
         href: $(this).data('href'),
         title: 'Click to edit ' + $(this).data('name') + ' skin'
      }).mouseover(function() {
         $(this).parents('.av-skin').eq(0).addClass('av-skin-active');
      }).mouseout(function() {
         $(this).parents('.av-skin').eq(0).removeClass('av-skin-active');
      }).html('<i class="uk-icon-pencil"></i>');
      $(this).prepend(skinButton);
  });
});

Antville = {};
Antville.prefix = 'Antville_';

Antville.encode = function(str) {
   var chars = ['&', '<', '>', '\''];
   for (var i in chars) {
      var c = chars[i];
      var re = new RegExp(c, 'g');
      str = str.replace(re, '&#' + c.charCodeAt() + ';');
   }
   return str;
};

Antville.decode = function(str) {
   return str.replace(/&amp;/g, '&');
};

Antville.Referrer = function(url, text, count) {
   this.url = url;
   var re = new RegExp('https?://(?:www\.)?');
   this.text = String(text).replace(re, '');
   var pos = this.text.lastIndexOf('/');
   if (pos === this.text.length - 1) {
      this.text = this.text.substr(0, pos);
   }
   this.count = parseInt(count, 10);
   this.compose = function(prefix, key) {
      prefix || (prefix = '');
      var query = new Antville.Query(this.url);
      if (query[key]) {
         return prefix + ' ' + Antville.encode(query[key]);
      }
      return this.text;
   }
   return this;
};

Antville.Query = function(str) {
   if (str == undefined)
      var str = location.search.substring(1);
   else if (str.indexOf('?') > -1)
      var str = str.split('?')[1];
   if (str == '')
      return this;
   var parts = Antville.decode(decodeURIComponent(str)).split('&');
   for (var i in parts) {
      var pair = parts[i].split('=');
      var key = pair[0];
      if (key) {
         key = key.replace(/\+/g, ' ');
         var value = pair[1];
         if (value)
           value = value.replace(/\+/g, ' ');
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
      this.items = def.replace(/\r/g, '\n').split('\n');
   this.test = function(str) {
      if (!str)
         return false;
      str = str.replace(/&amp;/g, '&');
      for (var n in this.items) {
         var re = new RegExp(this.items[n], 'i');
         if (re.test(str))
            return true;
      }
      return false;
   }
   return this;
};
