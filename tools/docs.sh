#!/usr/bin/env sh

. tools/init.sh

(
  echo Generating JSDoc files…

  yarn jsdoc -d $export_dir/antville/docs $export_dir/antville/code/**
)