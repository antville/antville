/**
 * create a new layout based on a chosen parent layout
 * @param Object Object containing the submitted form values
 * @param Object Creator of the layout object
 */
function chooseNewLayout(param, creator) {
   if (!param.parent)
      throw new Exception("layoutParentMissing");
   var parentLayout = root.layouts.get(param.parent);
   if (!parentLayout)
      throw new Exception("layoutParentNotFound");
   var newLayout = new layout(this._parent, parentLayout.title, creator);
   newLayout.alias = buildAlias(parentLayout.alias, this);
   newLayout.setParentLayout(parentLayout);
   if (!this.add(newLayout))
      throw new Exception("layoutCreate");
   return new Message("layoutCreate", newLayout.title, newLayout);
}

/**
 * function deletes a layout
 * @param Obj Layout-HopObject to delete
 */
function deleteLayout(layout) {
   layout.deleteAll();
   var title = layout.title;
   if (!this.remove(layout))
      throw new Exception("layoutDelete", title);
   return new Message("layoutDelete", title);
}

/**
 * Set the layout with the alias passed as argument
 * to the default site layout
 */
function setDefaultLayout(alias) {
   if (this._parent.preferences.getProperty("layout") != alias)
      this._parent.preferences.setProperty("layout", alias);
   return;
}
