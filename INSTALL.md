# Installation

## Helma Object Publisher

Antville needs Helma Object Publisher to be installed on the desired machine. If not already done so please [download Helma](https://github.com/antville/helma/releases) and follow the [installation instructions](https://github.com/antville/helma/#how-to-helma).

## SQL Database

Furthermore, Antville needs an SQL database to be installed as well. Currently supported products are PostgreSQL and MySQL/MariaDB. Be sure to install the desired database before you continue.

Finally, you need the corresponding JDBC driver for connecting Antville to the database. Please copy the driver to the directory `lib/ext` of Helma’s installation directory.

As of writing this installation guide the drivers can be downloaded via the following URLs:

- <http://jdbc.postgresql.org/download.html>
- <http://dev.mysql.com/downloads/connector/j/>
- <https://mariadb.com/kb/en/mariadb-connector-j/>

Of course you can also use a packet manager like aptitude or MacPorts if the JDBC driver is available from there. However, you then need to create a symbolic link to the driver from within Helma’s `lib/ext` directory.

Now unpack the Antville distribution package. Move the resulting directory `antville` into the directory `apps` of your Helma installation.

Inside the directory `antville` you will find a directory called `db`. This directory contains all database-related files, ie. several SQL scripts for creating the database needed by the application. Change to that directory.

Antville currently comes with scripts for PostgreSQL (`postgre.sql`) and for MySQL/MariaDB databases (`my.sql`).

_Note:_ Antville is preconfigured for PostgreSQL out of the box but it is easy to modify the configuration to be compatible with MySQL/MariaDB.

Each of these SQL scripts creates the tables, indexes and initial records and also the account used by the application to communicate with the database.

## Granting Database Access

The default password of this account is `antville`, so you should change it if you want to secure your installation. Open the desired SQL script and scroll down to the `create user` (for PostgreSQL) or `grant user` (for MySQL) statement. Search for `password` (PostgreSQL) or `identified by` (MySQL) and change the trailing value in quotes to the password of your choice.

Please refer to the documentation of your database on how to run the appropriate script. Afterwards you will have to tell Antville how it can access your database. This is done in a configuration file named `db.properties` which is located in the `code` directory, or – if you are going for MySQL/MariaDB – in the `db/my.compat` directory.

Open the desired file and ensure that the line beginning with `antville.url` points to the server that runs the database. By default, this is the local machine aka localhost which will be just right in most cases.

Check that the password is set accordingly to the one you entered in the SQL script and save the file.

## Enabling an Application

Finally, you need to tell Helma about the new application. This is done by adding the contents of the file `apps.properties` in the `tools/config` directory to the file `apps.properties` located in the top installation directory.

_Note:_ If you are using MySQL/MariaDB you need to edit and enable line 5 (the one defining `antville.repository.1`) of the file by removing the leading comment symbol `#`.

## Starting Up

Now start up Helma and point your browser to

    http://localhost:8080

(assuming that Helma is running on the same machine and uses port 8080).

You should see Antville’s start page where you can create a first user account that automatically has system administration rights to your Antville installation.

Have fun!

## TL;DR

1. Install Helma if not already done so
2. Install PostgreSQL or MySQL/MariaDB database if not already done so
3. Install or symlink corresponding JDBC driver in helma/lib/ext
4. Unpack Antville distribution file
5. Move antville directory into helma/app directory
6. Run the desired SQL script in antville/db for either PostgreSQL or MySQL/MariaDB
7. Copy contents of antville/tools/config/apps.properties to helma/apps.properties
8. If necessary, enable MySQL/MariaDB compatibility in apps.properties
9. Start up Helma and browse to <http://localhost:8080/antville>
