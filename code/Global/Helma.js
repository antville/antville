Helma = {
   toString: function() {
      return "[Helma JavaScript Extensions]";
   }
}


Helma.Image = function(arg) {
   var generator = new Packages.helma.image.ImageGenerator();
   return generator.createImage(arg);
}


Helma.File = function(path) {
   var BufferedReader         = java.io.BufferedReader;
   var File                   = java.io.File;
   var Reader                 = java.io.Reader;
   var Writer                 = java.io.Writer;
   var FileReader             = java.io.FileReader;
   var FileWriter             = java.io.FileWriter;
   var PrintWriter            = java.io.PrintWriter;
   var EOFException           = java.io.EOFException;
   var IOException            = java.io.IOException;
   var IllegalStateException  = java.lang.IllegalStateException

   var self = this;

   var file;
   try {
      if (arguments.length > 1)
         file = new File(path, arguments[1]);
      else
         file = new File(path);
   } catch (e) {
      throw(e);
   }

   var readerWriter;
   var atEOF = false;
   var lastLine = null;

   var setError = function(e) {
      this.lastError = e;
   };

   this.lastError = null;

   this.toString = function() {
      return file.toString();
   };

   this.getName = function() {
      var name = file.getName();
      return (name == null ? "" : name);
   };

   this.isOpened = function() {
      return (readerWriter != null);
   };

   this.open = function() {
      if (self.isOpened()) {
         setError(new IllegalStateException("File already open"));
         return false;
      }
      // We assume that the BufferedReader and PrintWriter creation
      // cannot fail except if the FileReader/FileWriter fails.
      // Otherwise we have an open file until the reader/writer
      // get garbage collected.
      try{
         if (file.exists()) {
            readerWriter = new BufferedReader(new FileReader(file));
         } else {
            readerWriter = new PrintWriter(new FileWriter(file));
         }
         return true;
      } catch (e) {
         setError(e);
         return false;
      }
      return;
   };

   this.exists = function() {
      return file.exists();
   };

   this.getParent = function() {
      return new Helma.File(file.getParent());
   };

   this.readln = function() {
      if (!self.isOpened()) {
         setError(new IllegalStateException("File not opened"));
         return null;
      }
      if (!(readerWriter instanceof BufferedReader)) {
         setError(new IllegalStateException("File not opened for reading"));
         return null;
      }
      if (atEOF) {
         setError(new EOFException());
         return null;
      }
      if (lastLine != null) {
         var line = lastLine;
         lastLine = null;
         return line;
      }
      var reader = readerWriter;
      // Here lastLine is null, return a new line
      try {
         var line = readerWriter.readLine();
         if (line == null) {
            atEOF = true;
            setError(new EOFException());
         }
         return line;
      } catch (e) {
         setError(e);
         return null;
      }
      return;
   };

   this.write = function(what) {
      if (!self.isOpened()) {
         setError(new IllegalStateException("File not opened"));
         return false;
      }
      if (!(readerWriter instanceof PrintWriter)) {
         setError(new IllegalStateException("File not opened for writing"));
         return false;
      }
      if (what != null) {
         readerWriter.print(what.toString());
      }
      return true;
   };

   this.writeln = function(what) {
      if (self.write(what)) {
         readerWriter.println();
         return true;
      }
      return false;
   };

   this.isAbsolute = function() {
      return file.isAbsolute();
   };

   this.remove = function() {
      if (self.isOpened()) {
         setError(new IllegalStateException("An openened file cannot be removed"));
         return false;
      }
      return file["delete"]();
   };

   this.list = function() {
      if (self.isOpened())
         return null;
      if (!file.isDirectory())
         return null;
      return file.list();   
   };

   this.flush = function() {
      if (!self.isOpened()) {
         setError(new IllegalStateException("File not opened"));
         return false;
      }
      if (readerWriter instanceof Writer) {
         try {
            readerWriter.flush();
         } catch (e) {
           setError(e);
           return false;
         }
      } else {
         setError(new IllegalStateException("File not opened for write"));
         return false; // not supported by reader
      }
      return true;
   };

   this.close = function() {
      if (!self.isOpened())
         return false;
      try {
         readerWriter.close();
         readerWriter = null;
         return true;
      } catch (e) {
         setError(e);
         readerWriter = null;
         return false;
      }
   };

   this.getPath = function() {
      var path = file.getPath();
      return (path == null ? "" : path);
   };

   this.error = function() {
      if (lastError == null) {
         return "";
      } else {
         var exceptionName = lastError.getClass().getName();
         var l = exceptionName.lastIndexOf(".");
         if (l > 0)
            exceptionName = exceptionName.substring(l + 1);
         return exceptionName + ": " + lastError.getMessage();
      }
   };

   this.clearError = function() {
      lastError = null;
      return;
   };

   this.canRead = function() {
      return file.canRead();
   };

   this.canWrite = function() {
      return file.canWrite();
   };

   this.getAbsolutePath = function() {
      var absolutPath = file.getAbsolutePath();
      return (absolutPath == null ? "" : absolutPath);
   };

   this.getLength = function() {
      return file.length();
   };

   this.isDirectory = function() {
      return file.isDirectory();
   };

   this.isFile = function() {
      return file.isFile();
   };

   this.lastModified = function() {
      return file.lastModified();
   };

   this.mkdir = function() {
      if (self.isOpened())
         return false;
      // don't do anything if file exists or use multi directory version
      return (file.exists() || file.mkdirs());   
   };

   this.renameTo = function(toFile) {
      if (toFile.file == null) {
         setError(new IllegalArgumentException("Uninitialized target File object"));
         return false;
      }
      if (self.isOpened()) {
         setError(new IllegalStateException("An openened file cannot be renamed"));
         return false;
      }
      if (toFile.readerWriter != null) {
         setError(new IllegalStateException("You cannot rename to an openened file"));
         return false;
      }
      return file.renameTo(toFile.file);
   };

   this.eof = function() {
      if (!self.isOpened()) {
         setError(new IllegalStateException("File not opened"));
         return true;
      }
      if (!(readerWriter instanceof BufferedReader)) {
         setError(new IllegalStateException("File not opened for read"));
         return true;
      }
      if (atEOF)
         return true;
      if (lastLine != null)
         return false;
      try {
         lastLine = readerWriter.readLine();
         if (lastLine == null)
            atEOF = true;
         return atEOF;
      } catch (e) {
         setError(e);
         return true;
      }
   };

   this.readAll = function() {
      // Open the file for readAll
      if (self.isOpened()) {
         setError(new IllegalStateException("File already open"));
         return null;
      }
      try { 
         if (file.exists()) {
            readerWriter = new BufferedReader(new FileReader(file));
         } else {
            setError(new IllegalStateException("File does not exist"));
            return null;
         }
         if (!file.isFile()) {
            setError(new IllegalStateException("File is not a regular file"));
            return null;
         }
      
         // read content line by line to setup proper eol
         var buffer = new java.lang.StringBuffer(file.length() * 1.10);
         while (true) {
            var line = readerWriter.readLine();
            if (line == null)
               break;
            if (buffer.length() > 0)
               buffer.append("\n");  // EcmaScript EOL
            buffer.append(line);
         }
     
         // Close the file
         readerWriter.close();
         readerWriter = null;
         return buffer.toString();
      } catch (e) {
         readerWriter = null;
         setError(e);
         return null;
      }
   };

   // DANGER! DANGER! HIGH VOLTAGE!
   // this method removes a directory recursively
   // without any warning or precautious measures
   this.removeDir = function() {
      if (!file.isDirectory())
         return false;
      var arr = file.list();
      for (var i=0; i<arr.length; i++) {
         var f = new Helma.File(file, arr[i]);
         if (f.isDirectory())
            f.removeDir();
         else
            f.remove();
      }
      file["delete"]();
      return true;
   };

   /**
    * recursivly lists all files below a given directory
    * @returns array containing the absolute paths of the files
    */
   this.listRecursive = function() {
      if (!file.isDirectory())
         return false;
      var result = [file.getAbsolutePath()];
      var arr = file.list();
      for (var i=0; i<arr.length; i++) {
         var f = new Helma.File(file, arr[i]);
         if (f.isDirectory())
            result = result.concat(f.listRecursive());
         else
            result.push(f.getAbsolutePath());
      }
      return result;
   }

   /**
    * function makes a copy of a file over partitions
    * @param StringOrFile full path of the new file
    */
   this.hardCopy = function(dest) {
      var inStream = new java.io.BufferedInputStream(new java.io.FileInputStream(file));
      var outStream = new java.io.BufferedOutputStream(new java.io.FileOutputStream(dest));
      var buffer = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, 4096);
      var bytesRead = 0;
      while ((bytesRead = inStream.read(buffer, 0, buffer.length)) != -1) {
         outStream.write(buffer, 0, bytesRead);
      }
      outStream.flush();
      inStream.close();
      outStream.close();
      return true;
   }

   /**
    * function moves a file to a new destination directory
    * @param String full path of the new file
    * @return Boolean true in case file could be moved, false otherwise
    */
   this.move = function(dest) {
      // instead of using the standard File method renameTo()
      // do a hardCopy and then remove the source file. This way
      // file locking shouldn't be an issue
      self.hardCopy(dest);
      // remove the source file
      file["delete"]();
      return true;
   }

   return this;
}

Helma.File.separator = java.io.File.separator;
