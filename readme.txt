=================================================================
Antville
=================================================================

-----------------------
STATUS
-----------------------

Antville should be considered beta-release quality code. It is still developed and chances are good you'll find bugs in this application. Antville can be used for production purposes, but please mind that the creators of antville resp. helma.org do not take any warranty (whichever kind).

-----------------------
SYSTEM REQUIREMENTS
-----------------------

Basically you'll need two applications to run Antville: Helma Object Publisher (http://helma.org) and mySql (http://www.mysql.com). For setting up please refer to their installation instructions. Since Antville sends confirmation mails to users (i.e. after registration or if they were added to the list of members of a weblog), you'll also need an up-and-running SMTP-server (which you should specify in the server.properties in the directory where you installed Helma Object Publisher).

-----------------------
INSTALLATION
-----------------------

First, use the mySql-dumpfile "antville.sql" that comes with Antville to create the user, database and tables needed by the application (the default user is "antville" with the password "antville" - you'll probably want to change that). Don't be irritated by the number of "antville_dbpatches" - you can ignore them if you install antville for the first time (they're just useful for upgrading an existing version of antville). After done so you'll have to modfiy the file "db.properties" in the directory where you installed the application. Change "antville.url", "antville.username" and "antville.password" to wherever your mySql-database resides and the settings you defined for the user.

Next, modify the file "app.properties" in the application directory. What you should check/change are the "baseURI", the locations and urls for images and goodies and "adminEmail" (which you should change to the email-address you want to use as FROM-address in confirmation mails):

The two application-properties "imgPath" and "goodiePath" are used to store uploaded images and goodies into separate directories. Antville will create necessary subdirectories if needed (i.e. if a goodie was uploaded for the first time in a weblog, antville will create a subdirectory with the alias of the weblog, same for images). If you already have a directory that contains static contents, the easiest way is to create a subdirectory called "antville" plus two subdirectories called "images" and "goodies". Then you should adjust "imgUrl" and "goodieUrl" - these two properties will be used to create the appropriate URLs.

If your Hop-setup uses Apache as frontend-webserver, you should modify httpd.conf and insert a rewriteRule to prevent that image-requests are sent to Hop. Please refer to the Apache-documentation on how to use the URL Rewriting Module or have a look at our setup at http://www.antville.org.

There's another property that could be of interest for you: if you set "allowGoodies" to "false", the upload of goodies is disabled. Otherwise it's enabled and you should check if the uploadLimit-parameter of the helma-servlet fit's your needs (if not set anyone could upload a neat linux-distribution onto your harddisk ...)

Finally, you'll need to start the application by appending "antville" to the file "apps.properties" located in the directory where you install Hop.

----------------------------------
DOCUMENTATION
----------------------------------

To get the latest version of the documentation please refer to:
http://help.antville.org
http://macros.antville.org
http://project.antville.org

Feel free to ask any question regarding the application in http://project.antville.org

----------------------------------
BUG REPORTING AND FEATURE REQUESTS
----------------------------------

If you find any bugs or have any ideas about new features, please send a mail to antville@helma.org. Since Antville is open-source, you're definetly encouraged to modify the application, but please keep us informed on what you do/did. For those of you who demonstrated a commitment to collaborative open-source development through sustained participation and contributions within the development of Antville, there will also be other ways to participate.

----------------------------------
© 2002, antville@helma.org