//
// Copyright (c) 2005 Robert Gaggl
//
// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation; either version 2 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
//
// $RCSfile$
// $Name$
// $Revision$
// $Author$
// $Date$
//


/**
 * SearchEngine constructor function
 */
function SearchEngine() {
   var lucene = Packages.org.apache.lucene;
   var self = this;

   /**
    * return a new Analyzer instance depending
    * on the language passed as argument
    * @param String Language
    * @return Object Analyzer
    */
   this.getAnalyzer = function(lang) {
      switch (lang) {
         case "de":
            return new lucene.analysis.de.GermanAnalyzer();
         case "ru":
            return new lucene.analysis.ru.RussianAnalyzer();
         case "si":
         case "simple":
            return new lucene.analysis.SimpleAnalyzer();
         case "whitespace":
            return new lucene.analysis.WhitespaceAnalyzer();
         default:
            return new lucene.analysis.standard.StandardAnalyzer();
      }
   };

   /**
    * constructor function for Index objects
    * @param Object File object representing the destination directory
    * @param Object Lucene analyzer object
    */
   var Index = function(directory, analyzer) {
      /**
       * returns an IndexWriter object
       * @param Boolean if true a new index is created
       */
      var getIndexWriter = function(create) {
         return new lucene.index.IndexWriter(directory, analyzer, create ? true : false);
      };

      /**
       * returns an IndexReader object
       */
      var getIndexReader = function() {
         return lucene.index.IndexReader.open(directory);
      };
   
      /**
       * merge indexes into this one
       */
      this.addIndexes = function(dirs) {
         try {
            var writer = getIndexWriter();
            writer.addIndexes(dirs);
         } finally {
            writer.close();
         }
         return;
      };

      /**
       * check if the index is locked. if true wait a bit
       * and return it again until the timeout is reached
       */
      var checkWriteLock = function() {
         var interval = 500;
         var timeout = 5000;
         var dir = directory.getAbsolutePath();
         var isLocked = lucene.index.IndexReader.isLocked(dir);
         if (isLocked) {
            var elapsed = 0;
            while (elapsed < timeout) {
               java.lang.Thread.sleep(interval);
               elapsed += interval;
               isLocked = lucene.index.IndexReader.isLocked(dir);
               if (!isLocked)
                  return;
            }
            throw new Error("Timeout while waiting for Index unlock");
         }
      };

      this.toString = function() {
         return ("[Lucene Index " + directory.getAbsolutePath() + "]");
      };

      /**
       * return the analyzer used within this index
       */
      this.getAnalyzer = function() {
         checkWriteLock();
         try {
            var writer = getIndexWriter();
            return writer.getAnalyzer();
         } finally {
            writer.close();
         }
         return;
      };

      /**
       * return the directory of the index
       * @param Object Helma.File object representing the index' directory
       */
      this.getDirectory = function() {
         return new Helma.File(directory.getAbsolutePath());
      };

      /**
       * set the directory of the index
       * @param Object JS File object representing the index directory
       */
      this.setDirectory = function(dir) {
         directory = new java.io.File(dir.getAbsolutePath());
         return;
      };
      
      /**
       * create a new index
       */
      this.create = function() {
         try {
            var writer = getIndexWriter(true);
            return true;
         } finally {
            writer.close();
         }
         return;
      };

      /**
       * clear the index by re-creating it
       */
      this.clear = function() {
         this.create();
         return true;
      };

      /**
       * return the number of documents in the index
       */
      this.size = function() {
         checkWriteLock();
         try {
            var writer = getIndexWriter();
            var size = writer.docCount();
            return size;
         } finally {
            writer.close();
         }
         return;
      }

      /**
       * add a document object to the index
       * @param Object either a single Document object
       *               or a Hashtable/Vector containing numerous
       *               Document objects to add to the index
       */
      this.addDocument = function(d) {
         checkWriteLock();
         try {
            var writer = getIndexWriter();
            if (d instanceof java.util.Hashtable || d instanceof java.util.Vector) {
               var e = d.elements();
               while (e.hasMoreElements())
                  writer.addDocument(e.nextElement().getDocument());
            } else {
               writer.addDocument(d.getDocument());
            }
         } finally {
            writer.close();
         }
         return;
      };

      /**
       * remove those document(s) from the index whose
       * field-value matches the passed arguments
       * @param String Name of the field
       * @param Object either a single string value or a 
       *               Hashtable/Vector containing numerous
       *               key values of Documents to remove from index
       */
      this.removeDocument = function(fieldName, fieldValue) {
         
         /**
          * private method that does the actual
          * removal in the index
          */
         var remove = function(name, value) {
            return reader["delete"](new lucene.index.Term(name, value));
         }
         
         checkWriteLock();
         try {
            var reader = getIndexReader();
            if (fieldValue instanceof java.util.Hashtable || fieldValue instanceof java.util.Vector) {
               var result = [];
               var e = fieldValue.elements();
               while (e.hasMoreElements())
                  result.push(remove(fieldName, e.nextElement()));
               return result;
            } else
               return remove(fieldName, fieldValue);
         } finally {
            reader.close();
         }
         return;
      };

      /**
       * optimize the index
       */
      this.optimize = function() {
         checkWriteLock();
         try {
            var writer = getIndexWriter();
            writer.optimize();
         } finally {
            writer.close();
         }
         return;
      };

      /**
       * return an array containing all field Names
       * indexed in this index
       * @return Object java Array
       */
      this.getFieldNames = function() {
         try {
            var reader = getIndexReader();
            var coll = reader.getFieldNames();
            // FIXME: should return a JS Array, not a Java Array
            return coll.toArray();
         } finally {
            reader.close();
         }
         return;
      };

      /**
       * check if the index is locked
       * @return Boolean
       */
      this.isLocked = function() {
         try {
            var reader = getIndexReader();
            return lucene.index.IndexReader.isLocked(reader.directory());
         } finally {
            reader.close();
         }
         return;
      };

      /**
       * unlock the index
       */
      this.unlock = function() {
         try {
            var reader = getIndexReader();
            lucene.index.IndexReader.unlock(reader.directory());
            return true;
         } finally {
            reader.close();
         }
         return;
      };

      /**
       * constructor function for Searcher objects
       */
      this.Searcher = function() {
         var s = new lucene.search.IndexSearcher(directory.getAbsolutePath());

         this.hits = null;

         /**
          * main search method. the resulting hits collection is
          * stored in the property hits. don't forget to do a close()
          * when finished processing the resulting hits, otherwise
          * the index files will stay locked!
          * @param Object instance of Search.Query
          * @param Object instance of QueryFilter
          * @return Int number of hits
          */
         this.search = function(query, filter) {
            if (filter)
               this.hits = s.search(query.getQuery(), filter.getFilter());
            else
               this.hits = s.search(query.getQuery());
            return (this.hits != null ? this.hits.length() : 0);
         };

         /**
          * closes the wrapped IndexSearcher
          */
         this.close = function() {
            s.close();
            return;
         };
         
         return this;
      }

      /**
       * return an Array containing all terms of an index
       * @param String field name (optional)
       * @param String field value (optional)
       * @return Object Array containing terms
       */
      this.getTerms = function(field, str) {
         try {
            var reader = getIndexReader();
            var e;
            if (field && str)
               e = reader.terms(new lucene.index.Term(field, str));
            else
               e = reader.terms();
            var arr = new Array();
            while (e.next())
               arr.push(e.term());
            e.close();
            return arr;
         } finally {
            reader.close();
         }
         return;
      };

      /**
       * close the directory of this index to
       * future operations
       */
      this.close = function() {
         checkWriteLock();
         try {
            var reader = getIndexReader();
            var dir = reader.directory();
            dir.close();
         } finally {
            reader.close();
         }
         return;
      };

      return this;
   };

   /**
    * constructor function for Document objects that wrap
    * a Lucene Document object
    * @param Object (optional) Lucene Document object
    */
   this.Document = function(document) {
      if (!document)
         var document = new lucene.document.Document();

      this.toString = function() {
         return "[Document Object]";
      };

      /**
       * adds a field to this document.
       * @param String Name of the field
       * @param String Value of the field
       * @param Object Parameter object (optional) containing
       *               the following properties:
       *               .store (Boolean)
       *               .index (Boolean)
       *               .tokenize (Boolean)
       */
      this.addField = function(name, value, param) {
         if (!param)
            param = {store: true, index: true, tokenize: true};
         if (value === null)
            value = "";
         // if value is a date convert it
         if (value instanceof Date)
            value = lucene.document.DateField.timeToString(value.getTime());
         var f = new lucene.document.Field(String(name),
                                           String(value),
                                           param.store,
                                           param.index,
                                           param.tokenize);
         document.add(f);
         return;
      };
   
      /**
       * return a single document field
       * @param String name of the field
       * @return Object containing the following parameters:
       *                .name (String) name of the Field
       *                .boost (Int) boost factor
       *                .indexed (Boolean) true if Field is indexed, false otherwise
       *                .stored (Boolean) true if Field is stored, false otherwise
       *                .tokenized (Boolean) true if Field is tokenized, false otherwise
       *                .value (String) value of the Field
       */
      this.getField = function(name) {
         var f = document.getField(name);
         return ({name: name,
                  boost: f.getBoost(),
                  indexed: f.isIndexed(),
                  stored: f.isStored(),
                  tokenized: f.isTokenized(),
                  value: f.stringValue()});
      };
   
      /**
       * return a single document field as Date Object
       * @param String name of the field
       */
      this.getDateField = function(name) {
         var f = document.getField(name);
         return ({name: name,
                  boost: f.getBoost(),
                  indexed: f.isIndexed(),
                  stored: f.isStored(),
                  tokenized: f.isTokenized(),
                  value: new Date(lucene.document.DateField.stringToTime(f.stringValue()))});
      };
      
      /**
       * return the fields of a document
       */
      this.getFields = function() {
         var e = document.fields();
         var result = [];
         while (e.hasMoreElements()) {
            result.push(this.getField(e.nextElement().name()));
         }
         return result;
      };
      
      /**
       * Boost manipulation methods
       */
      this.getBoost = function() {
         return document.getBoost();
      };
      this.setBoost = function(boost) {
         document.setBoost(boost);
         return;
      };
      /**
       * return the Lucene Document object wrapped
       * by this javascript Document object
       */
      this.getDocument = function() {
         return document;
      };

      return this;
   };

   /**
    * private constructor for Query objects
    * contains basic methods inherited by other types of Query objects
    */
   var Query = function(wrappedQuery) {
      this.toString = function() {
         return "[" + wrappedQuery.toString() + "]";
      };
      this.getBoost = function() {
         return wrappedQuery.getBoost();
      };
      this.setBoost = function(fact) {
         wrappedQuery.setBoost(fact);
         return;
      };
      this.getQuery = function() {
         return wrappedQuery;
      };
      return;
   };

   /**
    * Term Query constructor
    * @param String name of the field
    * @param String query string
    * @return Object TermQuery object
    */
   this.TermQuery = function(field, str) {
      var t = new lucene.index.Term(field, str);
      var wrappedQuery = new lucene.search.TermQuery(t);
      // hack to inherit the properties of the private Query constructor
      this.base = Query;
      this.base(wrappedQuery);
      delete this.base;
      return this;
   };
   this.TermQuery.prototype = new Query;

   /**
    * Boolean Query constructor
    * @param String name of the field
    * @param String query string
    * @param String clause to use ("or"|"not", default is "and")
    * @return Object PhraseQuery object
    */
   this.BooleanQuery = function(field, str, clause) {
      var wrappedQuery = new lucene.search.BooleanQuery();

      /**
       * add a term to the wrappedQuery object. this method can be called
       * with two, three or four arguments, eg.:
       * addTerm("fieldname", "querystring")
       * addTerm("fieldname", "querystring", "and")
       * addTerm("fieldname", "querystring", Search.getAnalyzer("de"))
       * addTerm("fieldname", "querystring", "not", Search.getAnalyzer("simple"))
       *
       * @param Object either a String or an Array containing Strings
       *               that determine the index field(s) to match
       * @param String string to match
       * @param String boolean clause ("or"|"not", default is "and")
       * @param Object instance of lucene.analysis.Analyzer
       */
      this.addTerm = function(field, str, clause, analyzer) {
         if (arguments.length == 3 && arguments[2] instanceof lucene.analysis.Analyzer) {
            analyzer = arguments[2];
            clause = null;
         }
         if (!analyzer)
            analyzer = self.getAnalyzer();

         var q;
         try {
            if (field instanceof Array)
               q = lucene.queryParser.MultiFieldQueryParser.parse(str, field, analyzer);
            else
               q = lucene.queryParser.QueryParser.parse(str, field, analyzer);
         } catch (e) {
            return;
         }
         
         switch (clause) {
            case "or":
               wrappedQuery.add(q, false, false);
               break;
            case "not":
               wrappedQuery.add(q, false, true);
               break;
            default:
               wrappedQuery.add(q, true, false);
         }
         return;
      };
   
      /**
       * "merge" a query object with a query object passed as
       * argument
       * @param Object Query object
       * @param String boolean clause ("or"|"not", default is "and")
       */
      this.addQuery = function(q, clause) {
         switch (clause) {
            case "or":
               wrappedQuery.add(q.getQuery(), false, false);
               break;
            case "not":
               wrappedQuery.add(q.getQuery(), false, true);
               break;
            default:
               wrappedQuery.add(q.getQuery(), true, false);
         }
         return;
      };
   
      /**
       * directly call addTerm if constructor was
       * called with arguments
       */
      if (field && str)
         this.addTerm(field, str, clause);
      // hack to inherit the properties of the private Query constructor
      this.base = Query;
      this.base(wrappedQuery);
      delete this.base;
      return this;
   };
   this.BooleanQuery.prototype = new Query;

   /**
    * Phrase Query constructor
    * @param String name of the field
    * @param String query string
    * @return Object PhraseQuery object
    */
   this.PhraseQuery = function(field, str) {
      var wrappedQuery = new lucene.search.PhraseQuery();

      /**
       * add a term to the end of the phrase query
       */
      this.addTerm = function(field, str) {
         var t = new lucene.index.Term(field, str);
         wrappedQuery.add(t);
      };
      if (field && str)
         this.addTerm(field, str);
      // hack to inherit the properties of the private Query constructor
      this.base = Query;
      this.base(wrappedQuery);
      delete this.base;
      return this;
   };
   this.PhraseQuery.prototype = new Query;

   /**
    * Range Query constructor
    * @param String name of the field
    * @param String min value (can be null)
    * @param String max value (can be null)
    * @param Boolean if true min/max values are included
    * @return Obj JS wrapper object
    */
   this.RangeQuery = function(field, from, to, inclusive) {
      if (!field)
         throw new Error("Missing field name in RangeQuery()");
      if (arguments.length < 4)
         inclusive = true;
      var t1 = t2 = null;
      if (from)
         t1 = new lucene.index.Term(field, from);
      if (to)
         t2 = new lucene.index.Term(field, to);
      var wrappedQuery = new lucene.search.RangeQuery(t1, t2, inclusive);
      // hack to inherit the properties of the private Query constructor
      this.base = Query;
      this.base(wrappedQuery);
      delete this.base;
      return this;
   };
   this.RangeQuery.prototype = new Query;

   /**
    * Fuzzy Query constructor
    * @param String name of the field
    * @param String query string
    * @return Object FuzzyQuery object
    */
   this.FuzzyQuery = function(field, str) {
      var t = new lucene.index.Term(field, str);
      var wrappedQuery = new lucene.search.FuzzyQuery(t);
      // hack to inherit the properties of the private Query constructor
      this.base = Query;
      this.base(wrappedQuery);
      delete this.base;
      return this;
   };
   this.FuzzyQuery.prototype = new Query;

   /**
    * Prefix Query constructor
    * @param String name of the field
    * @param String query string
    * @return Object PrefixQuery object
    */
   this.PrefixQuery = function(field, str) {
      var t = new lucene.index.Term(field, str);
      var wrappedQuery = new lucene.search.PrefixQuery(t);
      // hack to inherit the properties of the private Query constructor
      this.base = Query;
      this.base(wrappedQuery);
      delete this.base;
      return this;
   };
   this.PrefixQuery.prototype = new Query;

   /**
    * Wildcard Query constructor
    * @param String name of the field
    * @param String query string
    * @return Object WildcardQuery object
    */
   this.WildcardQuery = function(field, str) {
      var t = new lucene.index.Term(field, str);
      var  wrappedQuery = new lucene.search.WildcardQuery(t);
      // hack to inherit the properties of the private Query constructor
      this.base = Query;
      this.base(wrappedQuery);
      delete this.base;
      return this;
   };
   this.WildcardQuery.prototype = new Query;

   /**
    * constructor for QueryFilter objects
    * @param Object instance of Search.Query
    */
   this.QueryFilter = function(q) {
      var wrappedFilter = new lucene.search.QueryFilter(q.getQuery());

      this.getFilter = function() {
         return wrappedFilter;
      };
      
      this.toString = function() {
         return wrappedFilter.toString();
      };
      
      return this;
   };
   
   /**
    * return the directory of an index
    * @param String name of the index
    * @param Obj parent directory
    * @return Obj java.io.File object representing the index directory
    */
   var getIndexDirectory = function(name, dir) {
      if (arguments.length === 0)
         throw new Error("can't determine index directory");
      if (!dir)
         dir = new java.io.File(app.getServerDir(), "index/" + app.name);
      else
         dir = new java.io.File(dir.getAbsolutePath());
      dir = new java.io.File(dir, name);
      if (!dir.exists())
         dir.mkdirs();
      return dir;
   };

   this.toString = function() {
      return "[SearchEngine]";
   };

   /**
    * creates a new index and stores it in a property
    * of Search
    * @param String name of the index
    * @param Object Analyzer to use (instance of lucene.analysis.Analyzer)
    * @param Object base directory of the index (File object)
    * @return Object Index object
    */
   this.createIndex = function(name, dir, analyzer) {
      try {
         var fsDir = getIndexDirectory(name, dir);
      } catch (e) {
         throw new Error("Missing arguments for createIndex()");
      }
      var index = new Index(fsDir, analyzer ? analyzer : self.getAnalyzer());
      index.create(true);
      return index;
   };

   /**
    * mount an existing index
    * @param String name of the index
    * @param Object Analyzer to use (instance of lucene.analysis.Analyzer)
    * @param Object base directory of the index (File object)
    * @return Object Index object
    */
   this.mountIndex = function(name, dir, analyzer) {
      try {
         var fsDir = getIndexDirectory(name, dir);
      } catch (e) {
         throw new Error("Missing arguments in mountIndex()");
      }
      if (!lucene.index.IndexReader.indexExists(fsDir))
         throw new Error("No index found in " + dir.getAbsolutePath());
      return new Index(fsDir, analyzer ? analyzer : self.getAnalyzer());
   };

   return this;
}

Search = new SearchEngine();
