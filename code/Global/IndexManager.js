/**
 * IndexManager is responsible for creating IndexQueues
 * on the fly and for flushing them if necessary
 */
function IndexManager() {
   // Hashtable containing all IndexQueue objects
   var queues = new java.util.Hashtable();
   // Vector containing those IndexQueue objects that
   // should be flushed
   var flushQueue = new java.util.Vector();
   // index rebuilding Array
   var rebuildQueue = new java.util.Vector();

   /**
    * returns an IndexQueue object for the given site
    * if none exists it is created on the fly
    */
   this.getQueue = function(site) {
      if (queues.containsKey(site._id))
         return queues.get(site._id);
      var q = new IndexQueue(site.getIndex(), site.alias);
      queues.put(site._id, q);
      return q;
   };

   /**
    * queues a IndexQueue object for flushing
    * @param Object a site's IndexQueue object
    */
   this.queueForFlushing = function(q) {
      if (!flushQueue.contains(q))
         flushQueue.add(q);
      return;
   };
   
   /**
    * add a site's index to the rebuilding queue
    * @param String alias of site
    */
   this.queueForRebuilding = function(alias) {
      if (!rebuildQueue.contains(alias))
         rebuildQueue.add(alias);
      return;
   };

   /**
    * flush all IndexQueues
    */
   this.flush = function() {
      var flush = flushQueue;
      flushQueue = new java.util.Vector();
      var e = flush.elements();
      var q;
      while (e.hasMoreElements()) {
         q = e.nextElement();
         // flush the queue only if it isn't locked
         // otherwise put it back into flushQueue
         if (q.isLocked() && !flushQueue.contains(q))
            flushQueue.add(q);
         else
            q.flush();
      }
      return;
   };
   
   /**
    * rebuild all indexes queued
    */
   this.rebuildIndexes = function() {
      if (rebuildQueue.size() > 0) {
         var rebuild = rebuildQueue;
         rebuildQueue = new java.util.Vector();
         var site;
         var e = rebuild.elements();
         while (e.hasMoreElements()) {
            site = root.get(e.nextElement());
            if (site != null) {
               site.rebuildIndex();
            }
         }
      }
      return;
   };

   this.toString = function() {
      return "[IndexManager (" + flushQueue.size() + " queues pending)]";
   };
   
   return this;
}

/**
 * constructor function for IndexQueue objects that
 * handle index updates asynchronously
 * @param Object instance of Search.Index
 * @param String name of the index queue (used for loggin only)
 */
function IndexQueue(index, name) {

   // the "queues"
   var added = new java.util.Hashtable();
   var removed = new java.util.Vector();

   // flag that is set during index rebuild to
   // prevent flushing until the rebuild process
   // is finished
   var lock = false;
   // flag that is set to true while queue is flushed
   var flushing = false;
   
   /**
    * add an object to the index queue
    * docObj == HopObject
    * docObj.key = Node.key
    * docObj.object = persistent HopObject to add to index
    */
   this.add = function(obj) {
      if (!added.contains(obj)) {
         var item = new HopObject();
         item.object = obj;
         item.key = obj._id;
         added.put(obj._id, item);
      }
      app.data.indexManager.queueForFlushing(this);
      return;
   };

   /**
    * remove an object from the index queue
    */
   this.remove = function(key) {
      if (!removed.contains(key)) {
         removed.add(key);
      }
      app.data.indexManager.queueForFlushing(this);
      return;
   };
   
   /**
    * "lock" the queue to prevent flushing
    * during index rebuild
    */
   this.lock = function() {
      lock = true;
      return;
   };

   /**
    * unlock the queue to allow flushing
    */
   this.unlock = function() {
      lock = false;
      return;
   };

   /**
    * return the lock status of the queue
    */
   this.isLocked = function() {
      return lock;
   };

   /**
    * return true if queue is currently flushed
    */
   this.isFlushing = function() {
      return flushing;
   };

   /**
    * returns the index this queue is working on
    */
   this.getIndex = function() {
      return index;
   };
   
   /**
    * set the index this queue should work on,
    * but only if the queue isn't locked or flushed
    */
   this.setIndex = function(newIndex) {
      var max = 60000;
      var elapsed = 0;
      while (elapsed < max) {
         if (!this.isFlushing()) {
            index = newIndex;
            return true;
         }
         java.lang.Thread.sleep(1000);
         elapsed += 1000;
      }
      return false;
   };

   /**
    * process all objects in the queue
    */
   this.flush = function() {
      if (added.size() > 0 || removed.size() > 0) {
         // set flushing flag
         flushing = true;
         var start = new Date();
         // for performance reasons pass all documents
         // to be added or removed as Vector to index
         var addDocs = added;
         added = new java.util.Hashtable();
         var removeDocs = removed;
         removed = new java.util.Vector();
      
         var documents = new java.util.Vector(addDocs.size());
         var e = addDocs.elements();
         var item;
         while (e.hasMoreElements()) {
            item = e.nextElement();
            if (item.object) {
               documents.add(item.object.getIndexDocument());
               removeDocs.add(item.key);
            }
         }
         if (removeDocs.size() > 0) {
            // remove documents in index
            try {
               index.removeDocument("id", removeDocs);
            } catch (e) {
               app.log("[" + name + "] Error while flushing queue: " + e.toString());
            }
         }
         if (documents.size() > 0) {
            try {
               index.addDocument(documents);
            } catch (e) {
               app.log("[" + name + "] Error while flushing queue: " + e.toString());
            }
         }
         // finally, optimize the index
         index.optimize();
         app.log("[" + name + "] flushed index queue (" + documents.size() + "/" + removeDocs.size() + " added/removed) in " + (new Date()).diff(start) + " ms");
         flushing = false;
      }
      return;
   };

   this.toString = function() {
      return "[Index Queue of '" + name + "' (" + added.size() + "/" + removed.size() + " adds/removes pending)]";
   };

   return this;
}