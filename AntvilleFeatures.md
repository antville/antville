There are various ways to install and run Antville: starting with the all-in-one package [AntClick](http://code.google.com/p/antville/downloads/list) which contains everything you need for testing ([Webserver](http://mortbay.org/jetty/), [Application server](http://helma.org/), [embedded database](http://www.h2database.com/)) - just unzip the files and start - up to the "industrial strength" setup using [Apache Webserver](http://httpd.apache.org/) (or any other capable of running servlets) and an external relational DBMS ([MySQL](http://www.mysql.com), [PostgreSQL](http://www.postgresql.org/)). Basically all you need is an operating system that supports Java 2 (Linux, Microsoft Windows, Mac OS X or the like) and the Java installation of course.

  * Simple and fast creation of weblogs (it really takes just two clicks!)

  * Mass-hosting of weblogs – one Antville installation can easily host several thousands of sites

  * Numerous defineable weblog preferences
    * Title, tagline, number of stories to show on frontpage
    * Free language and timezone definition (weblogs can be "placed" in any timezone)
    * Date and time formats (10 long, 12 short)
    * Weblogs can be either public or private, ie. accessible only for owners / administrators or privileged members of a weblog
    * Limit the creation of stories, polls etc. to privileged members or allow it for every registered user
    * Option to define a callback URL to be invoked each time the site content has changed

  * Fully customizeable layout<a href='Hidden comment: 
* Definition of colors using a popup color chooser including preview (no need to remember those hex codes)'></a>
    * Central font family and size definition
    * Site and system administrators can create any number of different layouts and exchange them between different installations
    * Every weblog consists of numerous _skins_ (HTML templates) for certain page parts, lists, editing forms etc.
    * Users can choose from a rich set of [macros](http://macros.antville.org) (special tags that can be embedded in skins, stories, comments etc.) to further customize the layout and structure of a weblog
    * Each skin can be modified to the personal needs using a web based skin manager and editor; there is also a diff function which clearly displays which lines have been altered
    * Calendar-based and / or page navigation

  * Easy and flexible story management
    * Stories can be extended freely: by default stories and comments consist of title and body text, but one can easily add e.g. a teaser, summary or the like
    * Stories can be tagged
    * Stories can be saved offline, be published on the frontpage of a weblog or be set to not appear on the frontpage, being reachable primarily via the tag(s)
    * Creation date of stories can be modified (allowing eg. backdating stories copied from an older blog or automatic publishing stories at a future date)
    * Collaborative story editing: authors can decide who is allowed to edit their own story
    * Backlink logging (referrers) for each story
    * Import and export stories as a Blogger export file (.xml)

  * User comments
    * By default any story can be commented by registered users
    * Comments can either appear as flat discussion (non threaded), two level deep ("simple threading") or with unlimited levels (the slashdot way)
    * Commenting can be disabled for single stories or for the whole weblog

  * Advanced image handling
    * Images can either be uploaded or "grabbed" by entering the URL of an image
    * Automatic resizing and creation of thumbnail images
    * Images are organized in a separate pool for easy maintenance
    * Images can be embedded in any story, comment or skin either in full size or as thumbnail linking to the full size image (the necessary javascript code is generated automatically)

  * Easy file handling
    * Upload any type of file (eg. mp3, pdf, zip, html)
    * Files are organized in a separate pool for easy maintenance
    * Download counter for each file
    * Files can be embedded in any story, comment or skin

  * Polls
    * Online polls can be created and managed in a separate pool for easy maintenance
    * Polls can be embedded in stories or skins
    * Only one vote per poll for each user, but users can change their vote in a poll as long as the poll is open for voting
    * Public list of all polls created within a weblog

  * Registration, login and password
    * When the client permits the execution of JavaScript, the password is salted and encrypted before being sent to the server
    * All passwords are saved salted and encrypted in the DB
    * In case users forget their passwords, they can have a code for resetting being sent to their mail accounts
    * Users just have to register once within each Antville server
    * Automatic login using cookies (for increased security, they are tied to the IP address of the client)

  * Community features
    * The list of recently updated sites can be integrated in the layout of every weblog
    * All users can "subscribe" to weblogs, i.e. add them to their shortlist
    * The subscriptions are ranked by their last update
    * Owners of weblogs may contact their members via a form that keeps the recipients e-mail address private

  * E-mail notification of changes

  * Customizeable spam filter for referrers and backlinks

  * Multiple user groups: owners / administrators of a weblog can grant special rights to subscribers by simply assigning them to one of the groups "administrators", "content managers" or "contributors".

  * List of the most read stories of a weblog

  * Full text search functionality

  * Supported Application Programming Interfaces: [Blogger API 1.0](http://www.blogger.com/developers/api/1_docs/),  [MetaWeblog API](http://www.xmlrpc.com/metaWeblogApi) and [MovableType API](http://www.sixapart.com/developers/xmlrpc/movable_type_api); users can use other editors and services (e.g. w.bloggar) to post to their weblog

  * RSS 2.0 feeds
    * Every weblog has RSS feeds containing just stories or stories and comments or just comments
    * On a per weblog basis, every tag has its own feed
    * Antville offers a root RSS feed containing a list of the recently updated weblogs

  * Virtual site hosting: provide weblogs under multiple domains

  * System management
    * Web based system setup: define the language of an Antville installation, system e-mail address, disk quota per site etc.
    * Creation of new weblogs can be allowed for every registered user or limited in various ways:
      * Trusted users (system administrators can define who is a trusted user)
      * Users who have been registered longer than 1 to 90 days
      * Users who have registered before a freely defineable date
      * If desired Antville can force users to wait a definable amount of days (1-90) between the creation of two weblogs (to prevent "name grabbing")
    * Web based management (including search) of weblogs: grant trusted permissions to weblogs, block or remove weblogs
    * User accounts: grant trusted permissions or system administration rights to users, block accounts
    * System status page shows detailed information about requests (both HTTP and XML-RPC) as well as uptime, errors, threads and memory consumption
    * Automatic system cleanup and logging
    * Watch for weblogs being private for longer than a customizable amount of days
    * Automatically block weblogs that are private for too long (customizable period, weblog owners are notified by mail)
    * Automatically remove weblogs that are inactive for too long
    * Creation, blocking and deletion of weblogs and all automatic cleanup tasks are logged in database and can be viewed as well as searched in the system management section