==============
ABOUT ANTVILLE
==============

Antville is an open source project aimed to the development of an 
"easy to maintain and use" weblog-hosting system. It can easily host 
up to several hundred or thousand weblogs (the number of weblogs is 
more limited by the site owner's choice and server power than software 
limitations).

Antville is entirely written in JavaScript and based on Helma 
Object Publisher, a powerful and fast scriptable open source web 
application server (which itself is written in Java). Antville works 
with a relational database in the backend.

Check out http://project.antville.org/ for more information.

============================
ABOUT HELMA OBJECT PUBLISHER
============================

Helma Object Publisher is a web application server.

With Helma Object Publisher (sometimes simply refered to as Helma or 
Hop) you can define Objects and map them to a relational database 
table. These so-called HopObjects can be created, modified and deleted 
using a comfortable object/container model. Hence, no manual fiddling 
around with database code is necessary.

HopObjects are extended JavaScript objects which can be scripted using 
server-side JavaScript. Beyond the common JavaScript features, Helma 
provides special "skin" and template functionalities which facilitate 
the rendering of objects via a web interface.

Thanks to Helma's relational database mapping technology, HopObjects 
create a hierarchical structure, the Url space of a Helma site. The 
parts between slashes in a Helma Url represent HopObjects (similar to 
the document tree in static sites). The Helma Url space can be thought 
of as an analogy to the Document Object Model (Dom) in client-side 
JavaScript.


======
STATUS
======

Antville should be considered pre-release quality code. Although it is 
heavily used by severeal thousand users at http://www.antville.org 
chances are that there are still bugs hidden somewhere in this 
application (if you found one please report it at 
http://helma.org/bugs).

Antville can be used for production purposes, but please mind that the 
creators of Antville and Helma do not take any warranty (whichever 
kind).


===================
SYSTEM REQUIREMENTS
===================

To run Antville you need Helma Object Publisher (http://helma.org) and 
a relational database in the backend. Antville was tested with mySQL 
(http://www.mysql.com) and Oracle (v.8.1.7). For setting up Helma 
Object Publisher and the database of your choice please refer to their 
installation instructions. Since Antville sends confirmation mails to 
users (i.e. after registration or if they were added to the list of 
members of a site), you'll also need access to an SMTP- server.

Helma comes with its own embedded webserver (Jetty) so you don't need 
to install one, although you can easily use Apache as frontend-
webserver too (this might be necessary for really big Antville-
installations or if you need advanced features like URL-rewriting).


============
INSTALLATION
============

The Antville-distribution contains two main directories: "antville" 
and "db_support". Put the first one (which is the application itself) 
into the directory "apps" of your Helma Object Publisher installation.

The second directory, "db_support", contains database-related files, 
ie. several sql-scripts for creating the database needed by the 
application. Antville comes with scripts for mySQL 
(antville_mysql.sql) and for Oracle databases (antville_oracle.sql) -
the third one, antville_mckoi.sql, is only used for the mcKoi-database 
used in the Antclick-distribution.

All scripts are not only creating the tables, indexes and initial 
records, but also the account used by the application to communicate 
with the database. The default username and password of this account 
is "antville", so you probably want to change that (you should!). Open 
the appropriate script and scroll down to the section called 
"Database-User". Search for "identified by" and change the value in 
quotes to the password of your choice.

Please refer to the documentation of your database on how to run the 
appropriate script. After done so you'll have to tell Antville how it 
can access your database. This is done in a configuration file named 
"db.properties". Antville comes with two templates, one for MySQL 
(antville_mysql.sql) and one for Oracle (antville_oracle.sql). Open 
the template for your database and ensure that the line beginning with 
"antville.url=" points to the server that runs the database (for MySQL 
this will in most cases look like http://localhost:3306/antville, 
assuming that the database is running on the same machine as the 
application). 

Check that user and password are correct and save the file as 
"db.properties" (without the quotes) in the root-directory of the 
Antville application (if it is already existing you can safely 
overwrite it).

NOTE: If you're using Oracle you need to install the JDBC-driver for 
your database by placing the appropriate .zip-file into the 
subdirectory "lib/ext" located in Helma's installation directory. The 
driver for mySQL is already contained in the distribution of Helma 
Object Publisher.

Finally, open the file "apps.properties" located in the directory 
where you installed Helma and append the word "antville" (without 
quotes) in a new line. Then start up Helma, and after pointing your 
browser to http://localhost/antville (assuming that Helma is running 
on the same machine and uses port 80) you should see Antville's 
welcome page. It will tell you about the two additional configuration 
steps necessary: you need to register to gain system administration 
rights and then you must configure the basic preferences (like 
language, date- and time-formats etc.)

=====================================
DOCUMENTATION AND FURTHER INFORMATION
=====================================

To get the documentation and further information regarding Antville 
please refer to:
http://project.antville.org
http://macros.antville.org (the documentation of Antville macros - in progress)
http://help.antville.org

Feel free to ask any question regarding the application at 
http://project.antville.org

For further information about Helma http://helma.org generally is a 
good place. There is also a mailing-list about Helma-related stuff 
available at http://helma.org/lists/listinfo/hop.


==================================
BUG REPORTING AND FEATURE REQUESTS
==================================

If you find any bug please report it at http://helma.org/bugs. Please 
post feature requests or proposals to http://project.antville.org. 
Since Antville is open-source, you're definetly encouraged to modify 
the application, but please keep us informed on what you do/did 
(either by posting at http://project.antville.org or by sending a mail 
to antville@helma.org). For those of you who demonstrated a commitment 
to collaborative open- source development through sustained 
participation and contributions within the development of Antville, 
there will also be other ways to participate.

--
© 2002, antville@helma.org
http://project.antville.org

This document was last modified on Tuesday 6 January 2003 by
robert@helma.org