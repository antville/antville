#!/usr/bin/env sh

. tools/build/init.sh

rm -rf $source_dir
mkdir -p $source_dir

(
  echo Cloning repository…

  cd $source_dir
  git clone $antville_repo antville

  export_dir=$export_dir/antville

  echo Exporting application…

  cd antville
  git checkout develop
  git checkout-index -f -a --prefix=$export_dir/

  hash=$(git rev-parse --short HEAD)

  cd $export_dir
  root_js_file=code/Root/Root.js

  sed -i "s|<v>0</v>|$npm_package_version|g" $root_js_file
  sed -i "s|<h>0</h>|$hash|g" $root_js_file
  sed -i "s|<d/>|$(date +"%b %d, %Y")|g" $root_js_file

  echo Removing unneeded files…

  #rm -rf .git* build.xml build docs i18n/*.po*
)
