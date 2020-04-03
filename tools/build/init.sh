#!/usr/bin/env sh

base_dir=$(pwd)
build_dir=$base_dir/build

dist_dir=$build_dir/dist
export_dir=$build_dir/export
source_dir=$build_dir/src

helma_dir=/opt/helma
hopkit_dir=$helma_dir/modules/jala/util/HopKit

jar_repo=https://repo1.maven.org/maven2
antville_repo=https://github.com/antville/antville.git
#antville_repo=/home/tobi/Projects/antville/current

curl="curl -LO#"
