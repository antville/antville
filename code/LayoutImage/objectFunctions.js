/**
 * return the url of the layout image (overwrites
 * getUrl() of image)
 * @see image/objectFunctions.js
 */
function getUrl() {
   var buf = this.layout.getStaticUrl();
   buf.append(this.filename);
   buf.append(".");
   buf.append(this.fileext);
   return buf.toString();
}

