=================================================================
Antville
=================================================================

-----------------------
STATUS
-----------------------

Antville should be considered alpha-release quality code. It is still developed and chances are good you'll find bugs in this application. Antville should NOT be used for production purposes unless there is a final version.

-----------------------
SYSTEM REQUIREMENTS
-----------------------

Basically you'll need two applications to run Antville: Hop and mySql. For setting up please refer to their installation instructions. Since Antville sends confirmation mails to users after their registration, you'll also need a valid SMTP-server (which you should specify in the server.properties in the directory where you installed Hop to.

-----------------------
INSTALLATION
-----------------------

First, create a database called "antville". Then use the mySql-dumpfile "antville.sql" that comes with Antville to create the tables needed by the application. Next you'll have to create a user for this application to communicate with your database. Create one with the username "antville" and a password that fits your security-needs. After done so you'll have to modfiy the file "db.properties" in the directory where you installed the application. Change "antville.url", "antville.username" and "antville.password" to wherever your mySql-database resides and the settings you defined for the user.

Next, modify the file "app.properties" in the application directory. There shouldn't be any need to change baseURI, but change "adminEmail" to the email-address you want to use as FROM-address in confirmation mails.

The two application-properties "imgPath" and "imgUrl" are used to store uploaded images and to point correctly to them. If you already have a directory that contains static contents, the easiest way is to create a subdirectory called "antville" and adjust "imgPath" and "imgUrl" to the correct paths. All images uploaded for a weblog will be placed in a subdirectory with the alias of this weblog.

If your Hop-setup uses Apache as frontend-webserver, chances are that you'll need to modify httpd.conf and insert a rewriteRule to prevent that image-requests are sent to Hop. Please refer to the Apache-documentation on how to use the URL Rewriting Module.

The last application-property, "appPath" should contain the path where Antville was installed to (it is necessary to find skin-files).

Finally, you'll need to start the application by including "antville" inside the file "apps.properties" located in the directory where you install Hop to.

----------------------------------
BUG REPORTING AND FEATURE REQUESTS
----------------------------------

If you find any bugs or have any ideas about new features, please send a mail to robert.gaggl@orf.at. Since Antville is open-source, you're definetly encouraged to modify the application, but please keep me informed on what you do/did. For those of you who demonstrated a commitment to collaborative open-source development through sustained participation and contributions within the development of Antville, there will also be other ways to participate.

----------------------------------
2001, robert.gaggl@orf.at