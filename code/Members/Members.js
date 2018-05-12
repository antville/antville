// The Antville Project
// http://code.google.com/p/antville
//
// Copyright 2001–2014 by the Workers of Antville.
//
// Licensed under the Apache License, Version 2.0 (the ``License'');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an ``AS IS'' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileOverview Defines the Members prototype.
 */

markgettext('Members');
markgettext('members');

/**
 * @name Members
 * @constructor
 * @property {Membership[]} _children
 * @property {Membership[]} contributors
 * @property {Membership[]} managers
 * @property {Membership[]} owners
 * @property {Membership[]} subscribers
 * @extends HopObject
 */

/**
 *
 * @param {String} action
 * @returns {Boolean}
 */
Members.prototype.getPermission = function(action) {
  switch (action) {
    case 'accept':
    case 'login':
    case 'logout':
    case 'reset':
    case 'salt.txt':
    return true;

    case 'register':
    return !root.creator || root.loginScope === Admin.NONE || User.require(root.loginScope);
  }

  var sitePermission = this._parent.getPermission('main');

  switch (action) {
    case 'delete':
    return !session.user.deleted && session.user.status !== User.DELETED;

    case 'edit':
    case 'export':
    case 'subscriptions':
    case 'timeline':
    case 'updates':
    return !!session.user;

    case '.':
    case 'main':
    case 'add':
    case 'owners':
    case 'managers':
    case 'contributors':
    case 'subscribers':
    return sitePermission && (Membership.require(Membership.OWNER) ||
        User.require(User.PRIVILEGED));
  }
}

Members.prototype.main_action = function() {
  res.data.title = gettext('Members');
  res.data.list = renderList(this, '$Membership#member',  50, req.queryParams.page);
  res.data.pager = renderPager(this, this.href(req.action), 50, req.queryParams.page);
  res.data.body = this.renderSkinAsString('$Members#main');
  res.handlers.site.renderSkin('Site#page');
  return;
}

Members.prototype.register_action = function() {
  if (req.postParams.register) {
    try {
      if (root.termsStory && !req.postParams.terms) throw Error('Please accept the terms and conditions.');
      if (root.privacyStory && !req.postParams.privacy) throw Error('Please accept the data privacy statement.');
      var title = res.handlers.site.title;
      var user = User.register(req.postParams);
      user.accepted = Date.now();
      var membership = Membership.add(user, Membership.SUBSCRIBER, this._parent);
      membership.notify(req.action, user.email,
          gettext('[{0}] Welcome to {1}!', root.title, title));
      res.message = gettext('Welcome to “{0}”, {1}. Have fun!',
          title, user.name);
      res.redirect(User.getLocation() || this._parent.href());
    } catch (ex) {
      res.message = ex;
    }
  }

  session.data.token = User.getSalt();
  res.data.action = this.href(req.action);
  res.data.title = gettext('Register');
  res.data.body = this.renderSkinAsString('$Members#register');
  this._parent.renderSkin('Site#page');
  return;
}

Members.prototype.reset_action = function() {
  if (req.postParams.reset) {
    try {
      if (!req.postParams.name || !req.postParams.email) {
        throw Error(gettext('Please enter a user name and e-mail address.'));
      }
      var user = User.getByName(req.postParams.name);
      if (!user || user.email !== req.postParams.email) {
        throw Error(gettext('User name and e-mail address do not match.'))
      }
      var token = User.getSalt();
      user.setMetadata('resetToken', token);
      sendMail(user.email, gettext('[{0}] Password reset confirmation', root.title),
          user.renderSkinAsString('$User#notify_reset', {
            href: this.href('reset'),
            token: token
          }));
      res.message = gettext('A confirmation mail was sent to your e-mail address.');
      res.redirect(this._parent.href());
    } catch(ex) {
      res.message = ex;
    }
  } else if (req.data.user && req.data.token) {
    var user = User.getById(req.data.user);
    if (user) {
      var token = user.getMetadata('resetToken');
      if (token && token === req.data.token) {
        if (req.postParams.save) {
          var password = req.postParams.password;
          if (!password) {
            res.message = gettext('Please enter a new password.');
          } else {
            user.hash = (password + user.salt).md5();
            user.setMetadata('resetToken', null);
            res.message = gettext('Your password was changed.');
            session.login(user);
            res.redirect(this._parent.href());
          }
        }
        res.data.title = gettext('Reset Password');
        res.data.body = this.renderSkinAsString('$Members#password');
        this._parent.renderSkin('Site#page');
        return;
      }
    }
    res.message = gettext('This URL is not valid for resetting your password.');
    res.redirect(this.href(req.action));
  }
  res.data.action = this.href(req.action);
  res.data.title = gettext('Request Password Reset');
  res.data.body = this.renderSkinAsString('$Members#reset');
  this._parent.renderSkin('Site#page');
  return;
}

Members.prototype.login_action = function() {
  if (req.postParams.login) {
    try {
      var user = User.login(req.postParams);

      if (!User.require(root.loginScope, user)) {
        throw Error(gettext('Sorry, logging in is currently not possible.'));
      }

      // Check if terms and conditions have been updated
      var accepted = user.accepted || 0;

      if ([root.termsStory, root.privacyStory].some(story => {
        if (story) {
          story = HopObject.getFromPath(story, 'stories');
          return story && story.modified - accepted > 0;
        }
      })) {
        User.logout();
        session.data.login = req.postParams;
        res.redirect(this.href('accept'));
      }

      res.message = gettext('Welcome to {0}, {1}. Have fun!', res.handlers.site.getTitle(), user.name);
      res.redirect(User.getLocation() || this._parent.href());
    } catch (ex) {
      res.message = ex;
    }
  }
  User.setLocation(User.getLocation() || req.data.http_referer);
  session.data.token = User.getSalt();
  res.data.action = this.href(req.action);
  res.data.title = gettext('Login');
  res.data.body = this.renderSkinAsString('$Members#login');
  this._parent.renderSkin('Site#page');
  return;
}

Members.prototype.logout_action = function() {
  if (session.user) {
    res.message = gettext('Good bye, {0}! Looking forward to seeing you again!',
        session.user.name);
    User.logout();
  }
  res.redirect(this._parent.href());
  return;
}

Members.prototype.edit_action = function() {
  res.handlers.context = this;
  return void User.prototype.edit_action.call(session.user);
};

Members.prototype.export_action = function() {
  res.handlers.context = this;
  return void User.prototype.export_action.call(session.user);
};

Members.prototype.timeline_action = function() {
  res.handlers.context = this;
  return void User.prototype.timeline_action.call(session.user);
};

Members.prototype.delete_action = function() {
  res.handlers.context = this;
  return void User.prototype.delete_action.call(session.user);
};

Members.prototype.salt_txt_action = function() {
  res.contentType = 'text/plain';
  var user;
  if (user = User.getByName(req.queryParams.user)) {
    res.write(user.salt || String.EMPTY);
  }
  return;
}

Members.prototype.owners_action = function() {
  res.data.title = gettext('Owners');
  res.data.list = renderList(this.owners, '$Membership#member', 50, req.queryParams.page);
  res.data.pager = renderPager(this.owners, this.href(req.action), 50, req.queryParams.page);
  res.data.body = this.renderSkinAsString('$Members#main');
  res.handlers.site.renderSkin('Site#page');
  return;
}

Members.prototype.managers_action = function() {
  res.data.title = gettext('Managers');
  res.data.list = renderList(this.managers, '$Membership#member', 50, req.queryParams.page);
  res.data.pager = renderPager(this.managers, this.href(req.action), 50, req.queryParams.page);
  res.data.body = this.renderSkinAsString('$Members#main');
  res.handlers.site.renderSkin('Site#page');
  return;
}

Members.prototype.contributors_action = function() {
  res.data.title = gettext('Contributors');
  res.data.list = renderList(this.contributors, '$Membership#member', 50, req.queryParams.page);
  res.data.pager = renderPager(this.contributors, this.href(req.action), 50, req.data.page);
  res.data.body = this.renderSkinAsString('$Members#main');
  res.handlers.site.renderSkin('Site#page');
  return;
}

Members.prototype.subscribers_action = function() {
  res.data.title = gettext('Subscribers');
  res.data.list = renderList(this.subscribers, '$Membership#member', 50, req.queryParams.page);
  res.data.pager = renderPager(this.subscribers, this.href(req.action), 50, req.queryParams.page);
  res.data.body = this.renderSkinAsString('$Members#main');
  res.handlers.site.renderSkin('Site#page');
  return;
}

Members.prototype.updates_action = function() {
  res.data.title = gettext('Updates');
  res.data.list = renderList(session.user.updates, function (item) {
    res.handlers.subscription = item.site;
    item.renderSkin('$Membership#subscription');
  }, 50, req.queryParams.page);
  res.data.body = session.user.renderSkinAsString('$User#subscriptions');
  res.handlers.site.renderSkin('Site#page');
  return;
}

Members.prototype.subscriptions_action = function() {
  var site = res.handlers.site;
  res.data.title = gettext('Subscriptions');
  res.data.list = renderList(session.user.subscriptions, function(item) {
    res.handlers.subscription = item.site;
    item.renderSkin('$Membership#subscription');
    return;
  }, 50, req.queryParams.page);
  res.data.pager = renderPager(session.user.subscriptions, this.href(req.action), 50, req.queryParams.page);
  res.handlers.site = site;
  res.data.body = session.user.renderSkinAsString('$User#subscriptions');
  res.handlers.site.renderSkin('Site#page');
  return;
};

Members.prototype.add_action = function() {
  var limit = 50;
  if (req.postParams.term === '') {
    res.message = gettext('Please enter a query in the search form.');
  } else if (req.postParams.term) {
    try {
      var result = this.search(req.postParams.term, limit);
      if (result.length >= limit) {
        result.length = limit;
        res.message = gettext('Found more than {0} results. Please try a more specific query.', result.length);
      }
      res.data.count = result.length;
      res.data.result = this.renderSkinAsString('$Members#results', result);
    } catch (ex) {
      res.message = ex;
      app.log(ex);
    }
  } else if (req.queryParams.name) {
    var membership = this.get(req.queryParams.name);
    if (membership) {
      return res.redirect(membership.href('edit'));
    }
    try {
      var membership = this.addMembership(req.queryParams);
      membership.notify(req.action, membership.creator.email, gettext('[{0}] Notification of membership change', root.title));
      res.message = gettext('Successfully added {0} to the list of members.', req.queryParams.name);
      res.redirect(membership.href('edit'));
    } catch (ex) {
      res.message = ex;
      app.log(ex);
    }
    res.redirect(this.href(req.action));
  }
  res.data.action = this.href(req.action);
  res.data.title = gettext('Add Member');
  res.data.body = this.renderSkinAsString('$Members#add');
  res.handlers.site.renderSkin('Site#page');
  return;
}

Members.prototype.accept_action = function() {
  if (!session.data.login) res.redirect(this._parent.href());
  if (req.postParams.accept) {
    try {
      if (root.termsStory && !req.postParams.terms) throw Error('Please accept the terms and conditions.');
      if (root.privacyStory && !req.postParams.privacy) throw Error('Please accept the data privacy statement.');
      User.login(session.data.login);
      session.data.login = null;
      session.user.accepted = Date.now();
      res.message = gettext('Welcome to {0}, {1}. Have fun!', res.handlers.site.getTitle(), session.user.name);
      res.redirect(User.getLocation() || this._parent.href());
    } catch (err) {
      res.message = err.toString();
    }
  }
  res.data.title = gettext('Updated Terms &amp; Conditions');
  res.data.body = this.renderSkinAsString('$Members#accept');
  res.handlers.site.renderSkin('Site#page');
};

/**
 *
 * @param {String} searchString
 * @returns {Object}
 */
Members.prototype.search = function(searchString, limit) {
  limit || (limit = 50);
  var self = this;
  var mode = '=';
  if (searchString.contains('*')) {
    searchString = searchString.replace(/\*/g, '%');
    mode = 'like';
  }
  var sql = new Sql;
  sql.retrieve(Sql.MEMBERSEARCH, mode, searchString, limit + 1, this._parent._id);
  var counter = 0, name;
  res.push();
  sql.traverse(function() {
    if (counter >= limit) {
      return;
    }
    self.renderSkin('$Members#result', {
      name: this.name,
      created: this.created
    });
    counter += 1;
  });
  return {
    result: res.pop(),
    length: counter
  };
}

/**
 *
 * @param {Object} data
 * @returns {Membership}
 */
Members.prototype.addMembership = function(data) {
  var user = root.users.get(data.name);
  if (!user) {
    throw Error(gettext('Sorry, your input did not match any registered user.'));
  /*} else if (this.get(data.name)) {
    throw Error(gettext('This user is already a member of this site.'));*/
  }
  var membership = Membership.add(user, Membership.SUBSCRIBER, this._parent);
  return membership;
}
