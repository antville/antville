=================================================================
Antville
=================================================================

-----------------------
STATUS
-----------------------

Antville should be considered pre-release quality code. Although it is heavily used by severeal thousand users at http://www.antville.org chances are that there are still bugs hidden in this application (if you find one, please see belog). Antville can be used for production purposes, but please mind that the creators of Antville and Helma do not take any warranty (whichever kind).

-----------------------
SYSTEM REQUIREMENTS
-----------------------

To run Antville you need Helma Object Publisher (http://helma.org) and a relational database in the backend. Antville was tested with mySQL (http://www.mysql.com) and Oracle (v.8.1.7). For setting up either Helma Object Publisher or the database you decided to use please refer to their installation instructions. Since Antville sends confirmation mails to users (i.e. after registration or if they were added to the list of members of a site), you'll also need an up-and-running SMTP-server (which you should specify in the server.properties in the directory where you installed Helma Object Publisher).

-----------------------
INSTALLATION
-----------------------

Antville comes with two SQL-scripts for creating the database needed by the application: for mySQL (antville_mysql.sql) and for Oracle databases (antville_oracle.sql) - the third one, antville_mckoi.sql, is only used for the Antclick-distribution of Antville.

Both scripts are not only creating the tables, indexes and initial records, but also the account used by the application to communicate with the database. The default username and password of this account is "antville", so you probably want to change that (you should!).

Please refer to the documentation of your database on how to run the appropriate script. After done so you'll have to modfiy the file "db.properties" in the directory where you installed the application. Depending on your database you should open either db.properties.mysql or db.properties.oracle and modify it to match the configuration of your database (if you changed the default username and password don't forget to change it here too!).

After done so save the modified file under the name "db.properties" in the same directory. Next open the file "app.properties" - it contains all basic file- and URI-path definitions needed by Antville. Don't be confused by the contents of the file, all you need to change for now is imgPath, filePath, imgUrl and fileUrl.

Finally, append the word "antville" to the file "apps.properties" located in the directory where you install Helma Object Publisher. The start up Helma, and with the first request you should see Antville's welcome page telling you how to proceed with configuration.

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
http://project.antville.org