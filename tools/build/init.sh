#!/usr/bin/env sh

base_dir=$(pwd)
build_dir=$base_dir/build
work_dir=$build_dir/work

dist_dir=$work_dir/dist
export_dir=$work_dir/export
source_dir=$work_dir/src

jar_repo=https://repo1.maven.org/maven2
antville_repo=https://github.com/antville/antville.git
#antville_repo=/home/tobi/Projects/antville/current

curl="curl -LO#"
