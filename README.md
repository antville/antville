# About Antville

Antville is an open source project aimed at the development of a high performance, feature rich weblog hosting software. It can easily host up to several thousands of sites (the number of weblogs is rather limited by the installation owner’s choice and server power than by software limitations).

Antville is entirely written in JavaScript (ECMAScript, to be precise) and based on Helma Object Publisher, a powerful and fast scriptable open source web application server (which itself is written in Java). Antville works with a relational database in the backend.

[Check out the project site for more information.](http://project.antville.org)

## Status

Antville can be considered stable quality code. It is heavily used by several thousands of users at [Antville.org](http://antville.org) and [several other sites](http://code.google.com/p/antville/wiki/AntvilleSites). Nevertheless, there still could be bugs hidden somewhere in this application.

Antville can be used for production purposes, but please bear in mind that the creators of Antville do not take any warranty, whichever kind.

## System Requirements

To run Antville you need [Helma Object Publisher](http://helma.org) and a relational database in the backend. Antville was thoroughly tested with [PostgreSQL](http://postgresql.org) and [MySQL](http://mysql.com).

For setting up Helma Object Publisher and the database of your choice please refer to the corresponding installation instructions.

To enable Antville sending confirmation mails to users (e.g. after registration) you will also need access to an SMTP server.

Helma comes with its own embedded webserver (Jetty) so you do not need to install one, although you can easily use Apache httpd as front-end webserver, too.

Please refer to the Install.md file for detailed information on how to install Antville.

## Documentation and Further Information

For documentation and further information regarding Antville you can refer to:

- [project.antville.org](http://project.antville.org)
- [about.antville.org](http://about.antville.org)
- [help.antville.org](http://help.antville.org)

Feel free to ask any question about Antville at our [support site](http://help.antville.org).

You should follow Antville on [Facebook](http://facebook.com/Antville) and [Twitter](http://twitter.com/antville_org)!

## Bug Reporting and Feature Requests

If you think you found a bug [please report it](http://project.antville.org).

A good place for your feature requests or proposals is the [project development site](http://project.antville.org).

Since Antville is open-source, you are definitely encouraged to modify the application, we would be happy to hear from your ideas, suggestions and changes – drop us a message via <mail@antville.org> or use any of the aforementioned channels.

For those of you who demonstrated a commitment to collaborative open-source development through sustained participation and contributions within the development of Antville, there will also be other ways to participate.

## About Helma Object Publisher

[Helma Object Publisher](http://helma.org) is a web application server.

With Helma Object Publisher (sometimes simply referred to as Helma or Hop) you can define Objects and map them to a relational database table. These so-called HopObjects can be created, modified and deleted using a comfortable object/container model. Hence, no manual fiddling around with database code is necessary.

HopObjects are extended JavaScript objects which can be scripted using server-side JavaScript. Beyond the common JavaScript features, Helma provides special “skin” and template functionalities which facilitate the rendering of objects via a web interface.

Thanks to Helma’s relational database mapping technology, HopObjects create a hierarchical structure, the URL space of a Helma site. The parts between slashes in a Helma URL represent HopObjects (similar to the document tree in static sites). The Helma URL space can be thought of as an analogy to the Document Object Model (DOM) in client-side JavaScript.

