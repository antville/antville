##
## The Antville Project
## http://code.google.com/p/antville
##
## Copyright 2001-2007 by The Antville People
##
## Licensed under the Apache License, Version 2.0 (the ``License'');
## you may not use this file except in compliance with the License.
## You may obtain a copy of the License at
##
##    http://www.apache.org/licenses/LICENSE-2.0
##
## Unless required by applicable law or agreed to in writing, software
## distributed under the License is distributed on an ``AS IS'' BASIS,
## WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
## See the License for the specific language governing permissions and
## limitations under the License.
##
## $Revision$
## $LastChangedBy$
## $LastChangedDate$
## $URL$
##

## Add deleted mode to site table
ALTER TABLE `antville`.`site` CHANGE COLUMN `mode` `mode` 
	enum('deleted','closed','restricted','public','open') 
	CHARACTER SET latin1 COLLATE latin1_general_ci DEFAULT 'closed';

## Rename user table to conform to standard SQL / Postgre specification
ALTER TABLE `antville`.`user` RENAME TO `account`;

## Enable UTF-8 encoding in name columns
alter table account modify name varchar(255) character set utf8 collate utf8_general_ci;
alter table content modify name varchar(255) character set utf8 collate utf8_general_ci;
alter table image modify name varchar(255) character set utf8 collate utf8_general_ci;
alter table file modify name varchar(255) character set utf8 collate utf8_general_ci;
alter table membership modify name varchar(255) character set utf8 collate utf8_general_ci;
alter table site modify name varchar(255) character set utf8 collate utf8_general_ci;
alter table skin modify name varchar(255) character set utf8 collate utf8_general_ci;
alter table tag modify name varchar(255) character set utf8 collate utf8_general_ci;

## Enable UTF-8 encoding in other columns
alter table account modify email varchar(255) character set utf8 collate utf8_general_ci;
alter table choice modify title text character set utf8 collate utf8_general_ci;
alter table log modify action varchar(255) character set utf8 collate utf8_general_ci;
alter table poll modify question text character set utf8 collate utf8_general_ci;
alter table vote modify creator_name varchar(255) character set utf8 collate utf8_general_ci;
