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

// This code requires the Gson Java library bundled with Helma

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

  const addMetadata = (object, Prototype, sql) => {
    object.metadata = {};
    sql.retrieve("select name, value, type from metadata where parent_type = '$0' and parent_id = $1 order by lower(name)", Prototype.name, object.id);
    sql.traverse(function() {
      object.metadata[this.name] = global[this.type](this.value).valueOf();
    });
    return object;
  };

  const addImage = function(type, writer, sql) {
    app.log('Exporting ' + type + ' image #' + this.id);
    const image = Image.getById(this.id);
    if (image) {
      this.href = image.href();
      addMetadata(this, Image, sql);
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
    const sql = new Sql({quote: true});
    const metadataSql = new Sql({quote: true});
    const zip = new helma.Zip();

    const dirName = app.appsProperties['static'] + '/export';
    const fileName = 'antville-site-' + java.util.UUID.randomUUID() + '.zip';
    const dir = new java.io.File(dirName);
    const file = new java.io.File(dir, fileName);

    if (!dir.exists()) dir.mkdirs();

    if (site.export) {
      const archive = new java.io.File(dirName, site.export.split('/').pop());
      if (archive.exists()) archive['delete']();
    }

    try {
      const tempDir = new java.io.File(java.nio.file.Files.createTempDirectory(site.name));
      const skinWriter = getJsonWriter(tempDir, 'skins.json');
      let writer = getJsonWriter(tempDir, 'index.json');

      sql.retrieve('select s.*, c.name as creator_name, m.name as modifier_name from site s left join account c on s.creator_id = c.id left join account m on s.modifier_id = m.id where s.id = $0 order by lower(s.name)', site._id);

      sql.traverse(function() {
        app.log('Exporting site #' + this.id + ' (' + this.name + ')');
        const site = Site.getById(this.id);
        this.href = site.href();
        addAssets(site, zip);
        addMetadata(this, Site, metadataSql);
        writer.push(this);
        const skinsSql = new Sql({quote: true});
        skinsSql.retrieve('select s.* from skin s join layout l on s.layout_id = l.id where l.site_id = $0', this.id);
        skinsSql.traverse(function() {
          app.log('Exporting skin #' + this.id);
          skinWriter.push(this);
        });
      });

      writer.close();
      skinWriter.close();

      writer = getJsonWriter(tempDir, 'members.json');

      sql.retrieve('select m.*, c.name as creator_name, modifier.name as modifier_name from membership m left join account c on m.creator_id = c.id left join account modifier on m.modifier_id = modifier.id where m.site_id = $0 order by lower(m.name)', site._id);

      sql.traverse(function() {
        app.log('Exporting membership #' + this.creator_id);
        writer.push(this);
      });

      writer.close();

      const storyWriter = getJsonWriter(tempDir, 'stories.json');
      const commentWriter = getJsonWriter(tempDir, 'comments.json');

      sql.retrieve('select c.*, crt.name as creator_name, m.name as modifier_name from content c left join account crt on c.creator_id = crt.id left join account m on c.modifier_id = m.id where c.site_id = $0 order by c.created desc', site._id);

      sql.traverse(function() {
        app.log('Exporting story #' + this.id);
        const content = Story.getById(this.id);
        this.href = content.href();

        addMetadata(this, Story, metadataSql);
        this.rendered = content.format_filter(this.metadata.text, {}, 'markdown');

        if (this.prototype === 'Story') {
          storyWriter.push(this);
        } else {
          commentWriter.push(this);
        }
      });

      storyWriter.close();
      commentWriter.close();

      writer = getJsonWriter(tempDir, 'files.json');

      sql.retrieve('select f.*, c.name as creator_name, m.name as modifier_name from file f left join account c on f.creator_id = c.id left join account m on f.modifier_id = m.id where f.site_id = $0 order by f.created desc', site._id);

      sql.traverse(function() {
        app.log('Exporting file #' + this.id);
        const file = File.getById(this.id);
        this.href = file.href();
        addMetadata(this, File, metadataSql);
        writer.push(this);
      });

      writer.close();

      writer = getJsonWriter(tempDir, 'images.json');

      sql.retrieve("select i.*, c.name as creator_name, m.name as modifier_name from image i left join account c on i.creator_id = c.id left join account m on i.modifier_id = m.id where i.parent_type = 'Site' and i.parent_id = $0 order by i.created desc", site._id);

      sql.traverse(function() {
        addImage.call(this, 'site', writer, metadataSql);
      });

      sql.retrieve("select i.*, c.name as creator_name, m.name as modifier_name from image i join layout l on i.parent_id = l.id left join account c on i.creator_id = c.id left join account m on i.modifier_id = m.id where i.parent_type = 'Layout' and l.site_id = $0 order by i.created desc", site._id);

      sql.traverse(function() {
        addImage.call(this, 'layout', writer, metadataSql);
      });

      writer.close();

      writer = getJsonWriter(tempDir, 'polls.json');

      sql.retrieve('select p.*, c.name as creator_name, m.name as modifier_name from poll p left join account c on p.creator_id = c.id left join account m on p.modifier_id = m.id where p.site_id = $0 order by p.created desc', site._id);

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
        addMetadata(this, Poll, metadataSql);
        writer.push(this);
      });

      writer.close();

      writer = getJsonWriter(tempDir, 'votes.json');

      sql.retrieve('select v.* from vote v join poll p on v.poll_id = p.id where p.site_id = $0', site._id);

      sql.traverse(function() {
        app.log('Exporting vote #' + this.id);
        writer.push(this);
      });

      writer.close();

      writer = getJsonWriter(tempDir, 'tags.json');

      sql.retrieve('select t.name, h.*  from tag t, tag_hub h where t.id = h.tag_id and t.site_id = $0 order by t.name', site._id);

      sql.traverse(function() {
        app.log('Exporting tag #' + this.id);
        writer.push(this);
      });

      writer.close();

      const xml = Exporter.getSiteXml(site);

      zip.addData(xml, 'export.xml');
      zip.add(tempDir);
      zip.save(file);

      site.export = app.appsProperties.staticMountpoint + '/export/' + fileName;
      site.exportError = null;
    } catch (ex) {
      app.log('Failed to export site #' + site._id + ' (' + site.name + '): ' + ex);
      site.exportError = ex.toString();
    } finally {
      site.job = null;
    }

    return;
  };

  Exporter.saveAccount = account => {
    const zip = new helma.Zip();
    const sql = new Sql({quote: true});
    const metadataSql = new Sql({quote: true});

    const dirName = app.appsProperties['static'] + '/export';
    const fileName = 'antville-account-' + java.util.UUID.randomUUID() + '.zip';
    const dir = new java.io.File(dirName);
    const file = new java.io.File(dir, fileName);

    if (!dir.exists()) dir.mkdirs();

    if (account.export) {
      const archive = new java.io.File(dirName, account.export.split('/').pop());
      if (archive.exists()) archive['delete']();
    }

    try {
      const tempDir = new java.io.File(java.nio.file.Files.createTempDirectory(account.name));
      let writer = getJsonWriter(tempDir, 'index.json');

      sql.retrieve("select * from account where id = $0", account._id);
      // Cannot really include other accounts with the same e-mail address because we do not verify e-mail addresses
      //sql.retrieve("select * from account where email = '$0' order by lower(name)", account.email);

      sql.traverse(function() {
        app.log('Exporting account #' + this.id + ' (' + this.name + ')');
        addMetadata(this, User, metadataSql);
        writer.push(this);
      });

      writer.close();

      writer = getJsonWriter(tempDir, 'sites.json');

      sql.retrieve("select s.*, m.role, c.name as creator_name, modifier.name as modifier_name from membership m join site s on m.site_id = s.id left join account c on s.creator_id = c.id left join account modifier on s.modifier_id = modifier.id where m.creator_id = $0 order by lower(s.name)", account._id);

      sql.traverse(function() {
        app.log('Exporting site #' + this.id + ' (' + this.name + ')');
        const site = Site.getById(this.id);
        this.href = site.href();
        if (this.role === Membership.OWNER) addMetadata(this, Site, metadataSql);
        writer.push(this);
      });

      writer.close();

      writer = getJsonWriter(tempDir, 'skins.json');

      sql.retrieve('select s.*, m.name as modifier_name from skin s left join account m on s.modifier_id = m.id where s.creator_id = $0', account._id);

      sql.traverse(function() {
        app.log('Exporting skin #' + this.id);
        writer.push(this);
      });

      writer.close();

      writer = getJsonWriter(tempDir, 'memberships.json');

      sql.retrieve('select m.*, modifier.name as modifier_name from membership m left join account modifier on m.modifier_id = modifier.id where m.creator_id = $0 order by lower(m.name)', account._id);

      sql.traverse(function() {
        app.log('Exporting membership #' + this.id);
        this.creator_name = account.name;
        writer.push(this);
      });

      writer.close();

      writer = getJsonWriter(tempDir, 'stories.json');
      const commentWriter = getJsonWriter(tempDir, 'comments.json');

      sql.retrieve('select c.*, m.name as modifier_name from content c left join account m on c.modifier_id = m.id where c.creator_id = $0 order by c.created desc', account._id);

      sql.traverse(function() {
        app.log('Exporting story #' + this.id);
        const content = Story.getById(this.id);
        this.href = content.href();
        this.creator_name = account.name;

        addMetadata(this, Story, metadataSql);
        this.rendered = content.format_filter(this.metadata.text, {}, 'markdown');

        if (this.prototype === 'Story') {
          writer.push(this);
        } else {
          commentWriter.push(this);
        }
      });

      commentWriter.close();
      writer.close();

      writer = getJsonWriter(tempDir, 'files.json');

      sql.retrieve('select f.*, m.name as modifier_name from file f left join account m on f.modifier_id = m.id where f.creator_id = $0 order by f.created desc', account._id);

      sql.traverse(function() {
        app.log('Exporting file #' + this.id);
        const file = File.getById(this.id);
        const asset = file.getFile();
        if (asset.exists()) zip.add(asset, file.site.name + '/files');
        this.href = file.href();
        this.creator_name = account.name;
        addMetadata(this, File, metadataSql);
        writer.push(this);
      });

      writer.close();

      writer = getJsonWriter(tempDir, 'images.json');

      sql.retrieve('select i.*, m.name as modifier_name from image i left join account m on i.modifier_id = m.id where i.creator_id = $0 order by i.created desc', account._id);

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
          addMetadata(this, Image, metadataSql);
          writer.push(this);
        } else {
          app.logger.warn('Could not export Image #' + this.id + '; might be a cache problem');
        }
      });

      writer.close();

      writer = getJsonWriter(tempDir, 'polls.json');

      sql.retrieve('select p.*, m.name as modifier_name from poll p left join account m on p.modifier_id = m.id where p.creator_id = $0 order by p.created desc', account._id);

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
        addMetadata(this, Poll, metadataSql);
        writer.push(this);
      });

      writer.close();
      zip.add(tempDir);
      zip.save(file);

      account.export = app.appsProperties.staticMountpoint + '/export/' + fileName;
      account.exportError = null;
    } catch (ex) {
      app.log('Failed to export account #' + account._id + ' (' + account.name + '): ' + ex);
      account.exportError = ex.toString();
    } finally {
      account.job = null;
    }

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
