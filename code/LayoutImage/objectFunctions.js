/**
 * return the url of the layout image (overwrites
 * getUrl() of image)
 * @see image/objectFunctions.js
 */
function getUrl() {
   res.push();
   this.layout.staticUrl();
   res.write(this.filename);
   res.write(".");
   res.write(this.fileext);
   return res.pop();
}

/**
 * return the image file on disk
 * @return Object File object
 */
function getFile() {
   return new Helma.File(this.layout.getStaticPath(), this.filename + "." + this.fileext);
}
