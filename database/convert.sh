#!/bin/bash

cd patches

for patch in *
do
   name=`echo $patch | sed 's/^antville_dbpatch-*/antville-patch-/g'`
   svn mv $patch $name
done

cd ..
