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
 * @fileOverview Defines the Exporter namespace.
 */

/**
 * The Exporter namespace provides methods for exporting a site.
 * @namespace
 */
var Exporter = {}

/**
 * Exports a site with the specified user’s content
 * The created XML file will be added to the site’s file collection.
 * @param {Site} site The site to export.
 * @param {User} user The user whose content will be exported.
 */
Exporter.run = function(site, user) {
  try {
    var file;
    if (site.export_id && (file = File.getById(site.export_id))) {
      File.remove.call(file);
    }

    var rssUrl = site.href('rss.xml');
    var baseDir = site.getStaticFile();
    var member = site.members.get(user.name);

    var xml = [];

    var add = function(s) {
      return xml.push(s);
    };

    add('<?xml version="1.0" encoding="UTF-8"?>');
    add('<?xml-stylesheet href="http://www.blogger.com/styles/atom.css" type="text/css"?>');
    add('<feed xmlns="http://www.w3.org/2005/Atom" xmlns:openSearch="http://a9.com/-/spec/opensearch/1.1/" xmlns:thr="http://purl.org/syndication/thread/1.0">');
    add('<id>tag:blogger.com,1999:blog-' + site._id + '.archive</id>');
    add('<updated>' + site.modified.format(Date.ISOFORMAT) + '</updated>');
    add('<title type="text">' + encodeXml(site.title) + '</title>');
    add('<link rel="http://schemas.google.com/g/2005#feed" type="application/rss+xml" href="' + rssUrl + '"/>');
    add('<link rel="self" type="application/rss+xml" href="' + rssUrl + '"/>');
    add('<link rel="http://schemas.google.com/g/2005#post" type="application/rss+xml" href="' + rssUrl + '"/>');
    add('<link rel="alternate" type="text/html" href="' + site.href() + '"/>');
    add('<author>');
    add('<name>' + site.creator.name + '</name>');
    add('<email>' + site.creator.email + '</email>');
    add('</author>');
    // Currently, blogger.com does not accept other generators
    //add('<generator version="' + Root.VERSION + '" uri="' + root.href() + '">Antville</generator>');
    add('<generator version="7.00" uri="http://www.blogger.com">Blogger</generator>');
    member.stories.forEach(function() {
      add('<entry>');
      add('<id>tag:blogger.com,1999:blog-' + site._id + '.post-' + this._id + '</id>');
      add('<published>' + this.created.format(Date.ISOFORMAT) + '</published>');
      add('<updated>' + this.modified.format(Date.ISOFORMAT) + '</updated>');
      add('<title type="text">' + (this.title ? encodeXml(this.title.stripTags()) : '') + '</title>');
      add('<content type="html">' + encodeXml(this.format_filter(this.text, {})) + '</content>');
      add('<link rel="alternate" type="text/html" href="' + this.href() + '"></link>');
      add('<category scheme="http://schemas.google.com/g/2005#kind" term="http://schemas.google.com/blogger/2008/kind#post"/>');
      add('<author>');
      add('<name>' + this.creator.name + '</name>');
      this.creator.url && add('<uri>' + this.creator.url + '</uri>');
      add('<email>' + this.creator.email + '</email>');
      add('</author>');
      add('</entry>');
    });
    add('</feed>');

    var name = site.name + '-export.xml';
    var content = java.lang.String(xml.join(String.EMPTY)).getBytes('utf-8');

    var data = {
      file: new Packages.helma.util.MimePart(name, content, 'application/rss+xml'),
      file_origin: site.href('export')
    };

    var file = File.add(data, site, user);
    site.export_id = file._id;
  } catch (ex) {
    app.log(ex.rhinoException);
  }

  // Reset the site’s export status
  site.job = null;
  return;
};

Exporter.getArchive = account => {
  const zip = new helma.Zip();
  const sql = new Sql();
  const FileUtils = Packages.org.apache.commons.io.FileUtils;
  const baseDir = java.io.File('/tmp/export');

  FileUtils.deleteDirectory(baseDir);
  FileUtils.forceMkdir(baseDir);

  const addMetadata = (object, Prototype) => {
    object.metadata = {};
    const sql = new Sql();
    sql.retrieve("select name, value, type from metadata where parent_type = '$0' and parent_id = $1 order by lower(name)", Prototype.name, object.id);
    sql.traverse(function() {
      object.metadata[this.name] = global[this.type](this.value).valueOf();
    });
    return object;
  };

  const addAssets = site => {
    const dir = site.getStaticFile();
    if (dir.exists()) zip.add(dir, site.name);
  };

  const saveJSON = (object, dir, fname) => {
    if (!fname) fname = object.id + '.json';
    const targetDir = new java.io.File(baseDir, dir);
    FileUtils.forceMkdir(targetDir);
    const json = JSON.stringify(object);
    FileUtils.writeStringToFile(java.io.File(targetDir, fname), json);
  };

  const index = {
    accounts: [],
    comments: [],
    files: [],
    images: [],
    members: [],
    memberships: [],
    polls: [],
    sites: [],
    stories: []
  };

  sql.retrieve("select * from account where id = $0", account._id);
  //sql.retrieve("select * from account where email = '$0' order by lower(name)", account.email);

  sql.traverse(function() {
    addMetadata(this, User);
    index.accounts.push(this);
  });

  /*sql.retrieve('select * from site s, membership m where m.creator_id = $0 and s.id = m.site_id order by lower(s.name)', account._id);

  sql.traverse(function() {
    const site = Site.getById(this.id);
    this.href = site.href();
    addMetadata(this, Site);
    addAssets(site);
    index.sites.push(this);
  });*/

  sql.retrieve('select * from site s, membership m where m.creator_id = $0 and s.id = m.site_id order by lower(s.name)', account._id);

  sql.traverse(function() {
    const site = Site.getById(this.id);
    this.href = site.href();
    if (this.role === Membership.OWNER) {
      addAssets(site);
      addMetadata(this, Site);
    }
    index.sites.push(this);
  });

  sql.retrieve('select m.creator_id, m.name, m.role, m.site_id from site s, membership m where m.role = "$1" m.creator_id <> $0 and s.id = m.site_id order by lower(m.name)', account._id, Membership.OWNER);

  sql.traverse(function() {
    index.members.push(this);
  });

  sql.retrieve('select * from content where creator_id = $0 order by created desc', account._id);

  sql.traverse(function() {
    const content = Story.getById(this.id);
    this.href = content.href();

    addMetadata(this, Story);
    this.rendered = content.format_filter(this.metadata.text, {}, 'markdown');

    if (this.prototype === 'Story') {
      index.stories.push(this);
    } else {
      index.comments.push(this);
    }
  });

  sql.retrieve('select * from file where creator_id = $0 order by created desc', account._id);

  sql.traverse(function() {
    const file = File.getById(this.id);
    this.href = file.href();
    addMetadata(this, File);
    index.files.push(this);
  });

  sql.retrieve('select * from image where creator_id = $0 order by created desc', account._id);

  sql.traverse(function() {
    const image = Image.getById(this.id);
    this.href = image.href();
    addMetadata(this, Image);
    index.images.push(this);
  });

  sql.retrieve('select * from poll where creator_id = $0 order by created desc', account._id);

  sql.traverse(function() {
    const poll = Poll.getById(this.id);
    this.href = poll.href();
    this.choices = poll.list().map(choice => {
      return {
        id: choice._id,
        title: choice.title,
        votes: choice.size()
      };
    });
    const vote = poll.votes.get(account.name);
    if (vote) this.vote = vote.choice._id;
    addMetadata(this, Poll);
    index.polls.push(this);
  });

  const json = JSON.stringify(index);
  const data = new java.lang.String(json).getBytes('UTF-8');

  zip.addData(data, 'index.json');
  zip.close();
  return zip;
};
