// The Antville Project
// http://code.google.com/p/antville
//
// Copyright 2001–2014 by the Workers of Antville.
//
// Licensed under the Apache License, Version 2.0 (the ``License'');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an ``AS IS'' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileOverview Overwrites some SQL queries for MySQL database compatibility.
 */

/** @constant */
Sql.PURGEREFERRERS = "delete from log where action = 'main' and " +
      "created < date_add(now(), interval -2 day)";

/** @constant */
Sql.REFERRERS = "select referrer, count(*) as requests from " +
      "log where context_type = '$0' and context_id = $1 and action = " +
      "'main' and created > date_add(now(), interval -1 day) group " +
      "by referrer order by requests desc, referrer asc";
