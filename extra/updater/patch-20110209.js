// The Antville Project
// http://code.google.com/p/antville
//
// Copyright 2007-2011 by Tobi Schäfer.
//
// Copyright 2001–2007 Robert Gaggl, Hannes Wallnöfer, Tobi Schäfer,
// Matthias & Michael Platzer, Christoph Lincke.
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
//
// $Revision$
// $Author$
// $Date$
// $URL$

// Apply with enabled updater repository via ant patch -Dpatch.id=20110209

if (!String(Root.VERSION).startsWith("1.2")) {
   throw Error("This patch needs to be applied to version 1.2 of the Antville codebase.");
}

app.addRepository("modules/helma/Database.js");

var sql = new Sql;
var db = new helma.Database("antville");
var fpath = "../db/" + (db.isMySql() ? "my.sql" : "postgre.sql");
var file = new helma.File(app.dir, fpath);
var skin = createSkin(file.readAll().replace(/(?:--|#)!helma/g, "")).getSubskin("metadata");
sql.execute(renderSkinAsString(skin));
