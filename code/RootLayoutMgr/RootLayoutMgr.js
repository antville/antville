//
// The Antville Project
// http://code.google.com/p/antville
//
// Copyright 2001-2007 by The Antville People
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
// $LastChangedBy$
// $LastChangedDate$
// $URL$
//

/**
 * Set the layout with the alias passed as argument
 * to the default root layout
 */
RootLayoutMgr.prototype.setDefaultLayout = function(alias) {
   var l = root.layouts.get(alias);
   if (root.sys_layout != l)
      root.sys_layout = l;
   return;
};
/**
 * render a dropdown containing the available shareable system layouts
 * (this method also checks if any of the system layouts is already
 * in the chain of the selected layout, just to prevent a loop
 * between two layouts)
 * @see LayoutMgr/renderParentLayoutChooser
 * @param Object collection to work on
 * @param Object current Layout
 * @param String String to display as first option
 */
RootLayoutMgr.prototype.renderParentLayoutChooser = function(selLayout, firstOption) {
   var size = this.size();
   var parents = null;
   var selected = null;
   var options = [];
   for (var i=0;i<size;i++) {
      var l = this.get(i);
      var parents = l.getParents();
      if (!selLayout || (l != selLayout && !parents.containsKey(selLayout._id)))
         options.push({value: l.alias, display: l.title});
   }
   if (selLayout && selLayout.parent)
      selected = selLayout.parent.alias;
   Html.dropDown({name: "layout"}, options, selected, firstOption);
   return;
};
