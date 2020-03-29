#!/usr/bin/env sh

. tools/build/init.sh

# Build dependencies
yarn build

package_name=antville-$npm_package_version

mkdir -p $dist_dir

echo Generating .tbz package…

cd $export_dir
tar -cjf $dist_dir/$package_name.tbz antville

echo Generating .zip package…

zip -lqr $dist_dir/$package_name.zip antville
