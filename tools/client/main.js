window.Antville = {};
window.md5 = require('js-md5/src/md5');
window.$ = window.jQuery = require('jquery');

require('jquery-collagePlus/jquery.collagePlus');
require('jquery-collagePlus/extras/jquery.collageCaption');
require('jquery-collagePlus/extras/jquery.removeWhitespace');

require('uikit/dist/js/uikit');
require('uikit/dist/js/components/form-password');
require('uikit/dist/js/components/tooltip');
require('uikit/dist/js/components/upload');

const init = function() {
  // Highlight the current navigation menu item
  const navItem = document.querySelector('.uk-nav a[href="' + location + '"]');

  if (navItem) navItem.parentElement.classList.add('uk-active');

  // let counter = 0;

  // document.querySelectorAll('.uk-nav li').forEach(function(element) {
  //   return
  //   if (counter > 0) return;

  //   const link = element.querySelector('a');

  //   if (!link) return;

  //   const href = element.getAttribute('href') + location.hash;
  //   const index = location.href.lastIndexOf(href);

  //   if (href && index > -1 && index + href.length === location.href.length) {
  //       element.classList.add('uk-active');
  //       counter += 1;
  //   }
  // });

  // Prevent redundant submits of a form
  document.querySelectorAll('form').forEach(function(form) {
    form.addEventListener('submit', function() {
      const submit = this.querySelector('[type=submit]');
      if (!submit) return;
      setTimeout(function() { submit.disabled = true; }, 1);
    }, { once: true });
  });


  // Show prompt to copy macro code
  document.querySelectorAll('a.av-clipboard-copy').forEach(function(element) {
    element.addEventListener('click', function(event) {
      event.preventDefault();
      prompt(this.dataset.text, this.dataset.value);
    });
  });

  // Select the macro code when clicking on elements with the macro-code class.
  // FIXME: Obsolete (should move to compat layer)
  document.querySelectorAll('.macro-code').forEach(function(element) {
    element.addEventListener('click', function() {
      selectText(this);
    });
  });

  const selectText = function(element) {
    if (document.body.createTextRange) { // ms
      const range = document.body.createTextRange();
      range.moveToElementText(element);
      range.select();
    } else if (window.getSelection) { // moz, opera, webkit
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(element);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  // Compatibility: Go back when cancel link is clicked
  document.querySelectorAll('a.cancel').forEach(function(element) {
    element.addEventListener('click', function (event) {
      event.preventDefault();
      history.back();
    });
  });

  document.querySelectorAll('.av-skin').forEach(function(element) {
    const control = document.createElement('span');

    control.classList.add('av-skin-control');
    control.innerHTML = '<a class="av-skin-edit-link"></a>';

    const button = control.querySelector('a');

    button.innerHTML = '<i class="uk-icon-pencil"></i>';
    button.setAttribute('data-uk-tooltip', true);
    button.setAttribute('href', element.dataset.href);
    button.setAttribute('title','Click to edit ' + element.dataset.name + ' skin');

    button.addEventListener('mouseover', function() {
      element.classList.add('av-skin-active');
    });

    button.addEventListener('mouseout', function() {
      element.classList.remove('av-skin-active');
    });

    element.insertAdjacentElement('afterbegin', control);
  });
};

if (
  document.readyState === "complete" ||
  (document.readyState !== "loading" && !document.documentElement.doScroll)
) {
  init();
} else {
  document.addEventListener('DOMContentLoaded', init);
}

Antville.prefix = 'Antville_';

Antville.encode = function(str) {
  const chars = ['&', '<', '>', '\''];

  for (let i in chars) {
    const c = chars[i];
    const re = new RegExp(c, 'g');
    str = str.replace(re, '&#' + c.charCodeAt() + ';');
  }

  return str;
};

Antville.decode = function(str) {
  return str.replace(/&amp;/g, '&');
};

Antville.Referrer = function(url, text, count) {
  this.url = url;

  const re = new RegExp('https?://(?:www\.)?');

  this.text = String(text).replace(re, '');

  const pos = this.text.lastIndexOf('/');

  if (pos === this.text.length - 1) {
    this.text = this.text.substr(0, pos);
  }

  this.count = parseInt(count, 10);

  this.compose = function(prefix, key) {
    prefix || (prefix = '');

    const query = new Antville.Query(this.url);

    if (query[key]) {
      return prefix + ' ' + Antville.encode(query[key]);
    }

    return this.text;
  }

  return this;
};

Antville.Query = function(str) {
  if (str == undefined) {
    str = location.search.substring(1);
  } else if (str.indexOf('?') > -1) {
    str = str.split('?')[1];
  }

  if (str == '') return this;

  const parts = Antville.decode(decodeURIComponent(str)).split('&');

  for (let i in parts) {
    const pair = parts[i].split('=');
    let key = pair[0];

    if (key) {
      key = key.replace(/\+/g, ' ');
      let value = pair[1];
      if (value)
        value = value.replace(/\+/g, ' ');
      this[key] = value;
    }
  }

  return this;
};

Antville.Filter = function(def, key) {
  this.key = key;

  if (def == null) {
    this.items = [];
  } else if (def instanceof Array) {
    this.items = def;
  } else {
    this.items = def.replace(/\r/g, '\n').split('\n');
  }

  this.test = function(str) {
    if (!str) return false;

    str = str.replace(/&amp;/g, '&');

    for (var n in this.items) {
      var re = new RegExp(this.items[n], 'i');
      if (re.test(str)) return true;
    }

    return false;
  }

  return this;
};
