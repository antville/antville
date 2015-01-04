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
 * @fileOverview Defines the Membership prototype
 */

markgettext('Membership');
markgettext('membership');

/**
 *
 * @param {String} name
 * @param {Site} site
 * @returns {Membership}
 */
Membership.getByName = function(name, site) {
  return (site || res.handlers.site).members.get(name);
};

/**
 *
 * @param {String} role
 * @returns {Boolean}
 */
Membership.require = function(role) {
  if (res.handlers.membership) {
    return res.handlers.membership.require(role);
  }
  return false;
}

/**
 * @function
 * @returns {String[]}
 * @see defineConstants
 */
Membership.getRoles = defineConstants(Membership, markgettext('Subscriber'),
    markgettext('Contributor'), markgettext('Manager'), markgettext('Owner'));

/**
 * @param {User} user
 * @param {String} role
 * @param {Site} site
 */
Membership.add = function(user, role, site) {
  HopObject.confirmConstructor(Membership);
  user || (user = session.user);
  var membership = new Membership(user, role);
  membership.created = new Date;
  membership.touch();
  site.members.add(membership);
  return membership;
}
/**
 *
 * @param {Membership} membership
 * @param {Object} options
 */
Membership.remove = function(options) {
  options || (options = {});
  if (this.constructor !== Membership) {
    return;
  }
  if (!options.force && !this.getPermission('delete')) {
    throw Error(gettext('Sorry, an owner of a site cannot be removed.'));
  }
  var recipient = this.creator.email;
  this.remove();
  if (!options.force) {
    this.notify(req.action, recipient,
        gettext('[{0}] Notification of membership cancellation', root.title));
  }
  return;
}

/**
 * @name Membership
 * @constructor
 * @param {User} user
 * @param {String} role
 * @property {Comment[]} comments
 * @property {Story[]} content
 * @property {Date} created
 * @property {User} creator
 * @property {File[]} files
 * @property {Image[]} images
 * @property {Date} modified
 * @property {User} modifier
 * @property {String} name
 * @property {Poll[]} polls
 * @property {String} role
 * @property {Site} site
 * @property {Story[]} stories
 * @extends HopObject
 */
Membership.prototype.constructor = function(user, role) {
  HopObject.confirmConstructor(this);
  user || (user = session.user);
  if (user) {
    this.map({
      creator: user,
      name: user.name,
      role: role
    });
  }
  return this;
}

/**
 *
 * @param {String} action
 * @return {Boolean}
 */
Membership.prototype.getPermission = function(action) {
  if (!res.handlers.site.getPermission('main')) {
    return false;
  }

  switch (action) {
    case 'contact':
    return true;
    case 'edit':
    case 'delete':
    return Membership.require(Membership.OWNER) && (!this.require(Membership.OWNER) || this.site.members.owners.size() > 1);
  }
  return false;
}

/**
 *
 * @param {String} name
 * @returns {Object}
 */
Membership.prototype.getFormOptions = function(name) {
  switch (name) {
    case 'role':
    return Membership.getRoles();
  }
  return;
}

Membership.prototype.edit_action = function() {
  if (req.postParams.save) {
    try {
      this.update(req.postParams);
      res.message = gettext('The changes were saved successfully.');
      res.redirect(this.href(req.action));
    } catch(ex) {
      res.message = ex;
      app.log(ex);
    }
  }

  res.data.action = this.href(req.action);
  res.data.title = gettext('Member {0}', this.name);
  res.data.body = this.renderSkinAsString('$Membership#edit');
  this.site.renderSkin('Site#page');
  return;
}

/**
 *
 * @param {Object} data
 */
Membership.prototype.update = function(data) {
  if (!data.role) {
    throw Error(gettext('Please choose a role for this member.'));
  } else if (this.user === session.user) {
    throw Error(gettext('Sorry, you are not allowed to edit your own membership.'));
  } else if (data.role !== this.role) {
    this.role = data.role || Membership.SUBSCRIBER;
    this.touch();
    this.notify(req.action, this.creator.email,
        gettext('[{0}] Notification of membership change', root.title));
  }
  return;
}

Membership.prototype.contact_action = function() {
  if (req.postParams.send) {
    try {
      if (!req.postParams.text) {
        throw Error(gettext('Please enter the message text.'));
      }
      Trail.invoke('Recaptcha', function () {
        this.verify(req.postParams);
      });
      this.notify(req.action, this.creator.email, session.user ?
          gettext('[{0}] Message from user {1}', root.title, session.user.name) :
          gettext('[{0}] Message from anonymous user', root.title));
      res.message = gettext('Your message was sent successfully.');
      res.redirect(this._parent.getPermission() ?
          this._parent.href() : this.site.href());
    } catch(ex) {
      res.message = ex;
      app.log(ex);
    }
  }

  res.data.action = this.href(req.action);
  res.data.title = gettext('Contact {0}', this.name);
  res.data.body = this.renderSkinAsString('$Membership#contact');
  this.site.renderSkin('Site#page');
  return;
}

Membership.prototype.content_action = function() {
  res.data.list = renderList(this.content, '$Story#listItem',
      10, req.queryParams.page);
  res.data.pager = renderPager(this.content,
      this.href(), 10, req.queryParams.page);
  res.data.title = gettext('Content of User: {0}', this.name);
  res.data.body = this.renderSkinAsString('$Membership#content');
  this.site.renderSkin('Site#page');
}

/**
 *
 * @param {String} name
 * @returns {HopObject}
 */
Membership.prototype.getMacroHandler = function(name) {
  switch (name) {
    case 'user':
    return this.creator;
  }
  return null;
}

/**
 *
 * @param {String} role
 * @returns {Boolean}
 */
Membership.prototype.require = function(role) {
  var roles = [Membership.SUBSCRIBER, Membership.CONTRIBUTOR,
      Membership.MANAGER, Membership.OWNER];
  if (role) {
    return roles.indexOf(this.role) >= roles.indexOf(role);
  }
  return false;
}

/**
 *
 * @param {String} action
 * @param {String} recipient
 * @param {String} subject
 */
Membership.prototype.notify = function(action, recipient, subject) {
  switch (action) {
    case 'add':
    case 'contact':
    case 'delete':
    case 'edit':
    case 'register':
    res.handlers.sender = User.getMembership();
    sendMail(recipient, subject, this.renderSkinAsString('$Membership#notify_' + action),
        {footer: action !== 'contact'});
    break;
  }
  return;
}

/**
 * @returns {String}
 */
Membership.prototype.getConfirmText = function() {
  return gettext('You are about to delete the membership of user {0}.',
      this.creator.name);
}

/**
 * @returns {String}
 */
Membership.prototype.toString = function() {
  return (this.role || 'Transient') + ' membership of user ' + this.name;
}

/**
 * @function
 * @see #toString
 */
Membership.prototype.valueOf = Membership.prototype.toString;

/**
 *
 */
Membership.prototype.status_macro = function() {
  this.renderSkin(session.user ? 'Membership#status' : 'Membership#login');
  return;
}

/**
 *
 */
Membership.prototype.role_macro = function() {
  this.role && res.write(gettext(this.role.capitalize()));
  return;
}

/**
 *
 * @param {Object} value
 * @param {Object} param
 * @returns {String}
 * @see HopObject#link_filter
 */
Membership.prototype.link_filter = function(value, param) {
  if (!session.user || !session.user.url) {
    return value;
  }
  return HopObject.prototype.link_filter.call(this, value,
      param, session.user.url); // || this.href());
}
