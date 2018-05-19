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

app.addRepository(app.dir + '/../lib/gson-2.8.4.jar');

global.Exporter = (function() {
  const gson = new JavaImporter(
    Packages.com.google.gson,
    Packages.com.google.gson.stream
  );

  const getJsonWriter = (dir, fname) => {
    const file = new java.io.File(dir, fname);
    const stream = new java.io.FileOutputStream(file);
    const writer = new java.io.OutputStreamWriter(stream, 'utf-8');
    const jsonWriter = new gson.JsonWriter(writer);
    jsonWriter.beginArray();

    return {
      push(data) {
        jsonWriter.jsonValue(JSON.stringify(data));
        return this;
      },

      close() {
        jsonWriter.endArray();
        jsonWriter.flush();
        jsonWriter.close();
        writer.close();
        stream.close();
        return this;
      }
    };
  };

  const addMetadata = (object, Prototype) => {
    object.metadata = {};
    const sql = new Sql();
    sql.retrieve("select name, value, type from metadata where parent_type = '$0' and parent_id = $1 order by lower(name)", Prototype.name, object.id);
    sql.traverse(function() {
      object.metadata[this.name] = global[this.type](this.value).valueOf();
    });
    return object;
  };

  const addImage = function(type, writer) {
    app.log('Exporting ' + type + ' image #' + this.id);
    const image = Image.getById(this.id);
    if (image) {
      this.href = image.href();
      addMetadata(this, Image);
      writer.push(this);
    } else {
      app.logger.warn('Could not export Image #' + this.id + '; might be a cache problem');
    }
  };

  const addAssets = (site, zip) => {
    const dir = site.getStaticFile();
    if (dir.exists()) zip.add(dir, 'static');
  };

  /**
   * The Exporter namespace provides methods for exporting a site.
   * @namespace
   */
  const Exporter = {}

  /**
   * Exports a site with the specified user’s content
   * The created XML file will be added to the site’s file collection.
   * @param {Site} site The site to export.
   * @param {User} user The user whose content will be exported.
   */
  Exporter.run = function(target, user) {
    switch (target.constructor) {
      case Site:
      Exporter.saveSite(target, user);
      break;

      case User:
      Exporter.saveAccount(target);
      break;
    }
  };

  Exporter.saveSite = function(site, user) {
    const sql = new Sql();
    const zip = new helma.Zip();
    const fileName = 'antville-site-' + java.util.UUID.randomUUID() + '.zip';

    try {
      if (site.export) {
        let file = File.getById(site.export);
        if (file) File.remove.call(file);
      }

      const index = {
        comments: [],
        files: [],
        images: [],
        members: [],
        polls: [],
        sites: [],
        skins: [],
        stories: [],
        tags: []
      };

      const dir = new java.io.File(java.nio.file.Files.createTempDirectory(site.name));
      const skinWriter = getJsonWriter(dir, 'skins.json');
      let writer = getJsonWriter(dir, 'index.json');

      sql.retrieve('select s.*, c.name as creator_name, m.name as modifier_name from site s, account c, account m where s.id = $0 and s.creator_id = c.id and s.modifier_id = m.id order by lower(s.name)', site._id);

      sql.traverse(function() {
        app.log('Exporting site #' + this.id + ' (' + this.name + ')');
        const site = Site.getById(this.id);
        this.href = site.href();
        addAssets(site, zip);
        addMetadata(this, Site);
        writer.push(this);
        const skinsSql = new Sql();
        sql.retrieve('select * from skin where site_id = $0', this.id);
        sql.traverse(function() {
          app.log('Exporting skin #' + this.id);
          skinWriter.push(this);
        });
      });

      writer.close();
      skinWriter.close();

      writer = getJsonWriter(dir, 'members.json');

      sql.retrieve('select m.*, c.name as creator_name, mod.name as modifier_name from site s, membership m, account c, account mod where s.id = $0 and s.id = m.site_id and m.creator_id = c.id and m.modifier_id = mod.id order by lower(m.name)', site._id);

      sql.traverse(function() {
        app.log('Exporting membership #' + this.creator_id);
        //index.members.push(this);
        writer.push(this);
      });

      writer.close();

      const storyWriter = getJsonWriter(dir, 'stories.json');
      const commentWriter = getJsonWriter(dir, 'comments.json');

      sql.retrieve('select c.*, crt.name as creator_name, m.name as modifier_name from content c, account crt, account m where c.site_id = $0 and c.creator_id = crt.id and c.modifier_id = m.id order by created desc', site._id);

      sql.traverse(function() {
        app.log('Exporting story #' + this.id);
        const content = Story.getById(this.id);
        this.href = content.href();

        addMetadata(this, Story);
        this.rendered = content.format_filter(this.metadata.text, {}, 'markdown');

        if (this.prototype === 'Story') {
          storyWriter.push(this);
        } else {
          commentWriter.push(this);
        }
      });

      storyWriter.close();
      commentWriter.close();

      writer = getJsonWriter(dir, 'files.json');

      sql.retrieve('select f.*, c.name as creator_name, m.name as modifier_name from file f, account c, account m where f.site_id = $0 and f.creator_id = c.id and f.modifier_id = m.id order by created desc', site._id);

      sql.traverse(function() {
        app.log('Exporting file #' + this.id);
        const file = File.getById(this.id);
        this.href = file.href();
        addMetadata(this, File);
        writer.push(this);
      });

      writer.close();

      writer = getJsonWriter(dir, 'images.json');

      sql.retrieve("select i.*, c.name as creator_name, m.name as modifier_name from image i, account c, account m where i.parent_type = 'Site' and i.parent_id = $0 and i.creator_id = c.id and i.modifier_id = m.id order by created desc", site._id);

      sql.traverse(function() {
        addImage.call(this, 'site', writer);
      });

      sql.retrieve("select i.*, c.name as creator_name, m.name as modifier_name from image i, layout l, account c, account m where i.parent_type = 'Layout' and i.parent_id = l.id and l.site_id = $0 and i.creator_id = c.id and i.modifier_id = m.id order by created desc", site._id);

      sql.traverse(function() {
        addImage.call(this, 'layout', writer);
      });

      writer.close();

      writer = getJsonWriter(dir, 'polls.json');

      sql.retrieve('select p.*, c.name as creator_name, m.name as modifier_name from poll p, account c, account m where p.site_id = $0 and p.creator_id = c.id and p.modifier_id = m.id order by created desc', site._id);

      sql.traverse(function() {
        app.log('Exporting poll #' + this.id);
        const poll = Poll.getById(this.id);
        this.href = poll.href();
        this.choices = poll.list().map(choice => {
          return {
            id: choice._id,
            title: choice.title,
            votes: choice.size()
          };
        });
        addMetadata(this, Poll);
        writer.push(this);
      });

      writer.close();

      writer = getJsonWriter(dir, 'tags.json');

      sql.retrieve('select t.name, h.*  from tag t, tag_hub h where t.id = h.tag_id order by t.name');

      sql.traverse(function() {
        app.log('Exporting tag #' + this.id);
        writer.push(this);
      });

      const xml = Exporter.getSiteXml(site);
      zip.addData(xml, 'export.xml');

      zip.add(dir);
      zip.close();

      const mime = {
        file: new Packages.helma.util.MimePart(fileName, zip.getData(), 'application/zip'),
        file_origin: site.href('export')
      };

      const file = File.add(mime, site, user);
      site.export = file._id;
    } catch (ex) {
      app.log(ex.rhinoException);
    }

    // Reset the site’s export status
    site.job = null;
    return;
  };

  Exporter.saveAccount = account => {
    const zip = new helma.Zip();
    const sql = new Sql();

    const dirName = app.appsProperties['static'] + '/export';
    const fileName = 'antville-account-' + java.util.UUID.randomUUID() + '.zip';
    const dir = new java.io.File(dirName);
    const file = new java.io.File(dir, fileName);

    if (!dir.exists()) dir.mkdirs();

    if (account.export) {
      const archive = new java.io.File(dirName, account.export.split('/').pop());
      if (archive.exists()) archive['delete']();
    }

    const index = {
      accounts: [],
      comments: [],
      files: [],
      images: [],
      memberships: [],
      polls: [],
      sites: [],
      skins: [],
      stories: []
    };

    sql.retrieve("select * from account where id = $0", account._id);
    // Cannot really include other accounts with the same e-mail address because we do not verify e-mail addresses
    //sql.retrieve("select * from account where email = '$0' order by lower(name)", account.email);

    sql.traverse(function() {
      app.log('Exporting account #' + this.id + ' (' + this.name + ')');
      addMetadata(this, User);
      index.accounts.push(this);
    });

    sql.retrieve("select s.*, m.role, c.name as creator_name, mod.name as modifier_name from site s, membership m, account c, account mod where m.creator_id = $0 and m.site_id = s.id and s.creator_id = c.id and s.modifier_id = mod.id order by lower(s.name)", account._id);

    sql.traverse(function() {
      app.log('Exporting site #' + this.id + ' (' + this.name + ')');
      const site = Site.getById(this.id);
      this.href = site.href();
      if (this.role === Membership.OWNER) addMetadata(this, Site);
      index.sites.push(this);
    });

    sql.retrieve('select s.*, m.name as modifier_name from skin s, account m where s.creator_id = $0 and s.modifier_id = m.id', account._id);

    sql.traverse(function() {
      app.log('Exporting skin #' + this.id);
      index.skins.push(this);
    });

    sql.retrieve('select m.*, mod.name as modifier_name from site s, membership m, account mod where m.creator_id = $0 and s.id = m.site_id and m.modifier_id = mod.id order by lower(m.name)', account._id);

    sql.traverse(function() {
      app.log('Exporting membership #' + this.id);
      this.creator_name = account.name;
      index.memberships.push(this);
    });

    sql.retrieve('select c.*, m.name as modifier_name from content c, account m where creator_id = $0 and c.modifier_id = m.id order by c.created desc', account._id);

    sql.traverse(function() {
      app.log('Exporting story #' + this.id);
      const content = Story.getById(this.id);
      this.href = content.href();
      this.creator_name = account.name;

      addMetadata(this, Story);
      this.rendered = content.format_filter(this.metadata.text, {}, 'markdown');

      if (this.prototype === 'Story') {
        index.stories.push(this);
      } else {
        index.comments.push(this);
      }
    });

    sql.retrieve('select f.*, m.name as modifier_name from file f, account m where f.creator_id = $0 and f.modifier_id = m.id order by f.created desc', account._id);

    sql.traverse(function() {
      app.log('Exporting file #' + this.id);
      const file = File.getById(this.id);
      const asset = file.getFile();
      if (asset.exists()) zip.add(asset, file.site.name + '/files');
      this.href = file.href();
      this.creator_name = account.name;
      addMetadata(this, File);
      index.files.push(this);
    });

    sql.retrieve('select i.*, m.name as modifier_name from image i, account m where i.creator_id = $0 and i.modifier_id = m.id order by i.created desc', account._id);

    sql.traverse(function() {
      app.log('Exporting image #' + this.id);
      const image = Image.getById(this.id);
      if (image) {
        try {
          const asset = image.getFile();
          const path = this.parent_type === 'Layout' ? image.parent.site.name + '/layout' : image.parent.name + '/images';
          if (asset.exists()) zip.add(asset, path);
        } catch (ex) {
          console.warn('Could not export image #' + this.id);
          console.warn(ex.rhinoException);
        }
        this.href = image.href();
        this.creator_name = account.name;
        addMetadata(this, Image);
        index.images.push(this);
      } else {
        app.logger.warn('Could not export Image #' + this.id + '; might be a cache problem');
      }
    });

    sql.retrieve('select p.*, m.name as modifier_name from poll p, account m where p.creator_id = $0 and p.modifier_id = m.id order by p.created desc', account._id);

    sql.traverse(function() {
      app.log('Exporting poll #' + this.id);
      const poll = Poll.getById(this.id);
      this.href = poll.href();
      this.creator_name = account.name;
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
    zip.save(file);

    account.export = app.appsProperties.staticMountpoint + '/export/' + fileName;
    account.job = null;
    return zip;
  };

  Exporter.getSiteXml = site => {
    const rssUrl = site.href('rss.xml');
    const xml = [];

    const add = function(s) {
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

    site.stories.forEach(function() {
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
      if (this.creator.url) add('<uri>' + this.creator.url + '</uri>');
      add('<email>' + this.creator.email + '</email>');
      add('</author>');
      add('</entry>');
    });
    add('</feed>');

    return java.lang.String(xml.join(String.EMPTY)).getBytes('utf-8');
  };

  return Exporter;
})();
