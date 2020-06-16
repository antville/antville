# About Antville

Antville is an open source project providing a high performance, feature rich blog hosting software. Antville can host tens of thousands of blogs. Server power is the only limit. Installation and use is easy.

Antville is written in JavaScript and developed with Helma Object Publisher. Helma Object Publisher is a powerful, fast and scriptable open source web application server written in Java. Antville works with a relational database in the backend.

[Look at the project site for more information.](https://project.antville.org)

## Status

Antville’s codebase is of stable quality and ready for production deployment. It is being used by several thousands of users at [Antville.org](https://antville.org).

There still could be bugs hidden in Antville’s source code. If you find one please let us know. The creators of Antville do not take any responsibility for what the software might do.

## System Requirements

To run Antville you need [Helma Object Publisher](https://github.com/antville/helma) and a relational database in the backend. We tested Antville with [PostgreSQL](https://postgresql.org) and [MySQL](https://mysql.com) – [MariaDB](https://mariadb.com) should work, too.

For details please refer to the installation instructions of Helma Object Publisher and the database of your choice.

To enable Antville sending confirmation mails to users (e.g. after registration) you will also need access to an SMTP server.

Helma comes with an embedded webserver (Jetty) so you do not need to install one. But you can use other popular webservers, too.

Please refer to the `INSTALL.md` file for detailed information on how to install Antville.

## Documentation and Further Information

For documentation and further information about Antville you can refer to:
- [project.antville.org](https://project.antville.org)
- [about.antville.org](https://about.antville.org)
- [help.antville.org](https://help.antville.org)

Feel free to ask any question about Antville at our [support site](https://help.antville.org).

You should follow Antville on [Facebook](https://facebook.com/Antville) and [Twitter](https://twitter.com/antville_org)!

## Bug Reporting and Feature Requests

If you think you found a bug [please report it](https://project.antville.org).

A great place for your feature requests or proposals is the [project development site](https://project.antville.org).

Since Antville is open-source, we want to encourage you to change its code according to your likeness. We would be happy to hear your ideas, suggestions and changes. Feel free to drop us a message to <mail@antville.org> or through any channels mentioned before.

## About Helma Object Publisher

[Helma Object Publisher](https://github.com/antville/helma) is a web application server driven by Java and programmed with JavaScript.

Use Helma Object Publisher to define HopObjects and map them to a relational database table. Create, change and delete HopObjects at your whim using a comfortable object-container model. Manual fiddling around with database code is not necessary.

HopObjects extend the JavaScript object and you control them using server-side JavaScript. They got all the common features you know from JavaScript. Besides, Helma provides special templating features to ease the rendering of objects for the Web.

Combine HopObjects to create a hierarchical structure. A URL in Helma mirrors this structure. Each part of the URL path corresponds to a relational database mapping. It is similar to the document tree of static websites. Helma’s URL space is an analogy of the Document Object Model implemented in client-side JavaScript.
