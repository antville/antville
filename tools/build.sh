#!/usr/bin/env bash

. tools/init.sh

# Build dependencies
yarn export
yarn jars

(
  cd $export_dir/antville

  echo Installing dependencies…

  yarn install

  echo Building client-side scripts…

  prefix=static/scripts/main.min
  yarn browserify build/client/main.js -o $prefix.js -d -p [minifyify --map /$prefix.map.json --output $prefix.map.json]
  yarn lessc --clean-css build/client/main.less static/styles/main.min.css

  prefix=static/scripts/editor.min
  yarn browserify build/client/editor.js -o $prefix.js -d -p [minifyify --map /$prefix.map.json --output $prefix.map.json]
  yarn lessc --clean-css build/client/editor.less static/styles/editor.min.css

  echo Copying statcic files…

  cp -Rp ./node_modules/uikit/dist/fonts static/

  echo Generate license file…

  # FIXME: Add output of this command to somewhere…
  yarn licenses generate-disclaimer > /dev/null

  echo Removing unneeded dependencies…

  find node_modules/* -maxdepth 0 -not \( -path */string-strip-html -o -path */marked \) -print0 | xargs -0 rm -rf
  rm -rf node_modules/.[^.]*
)
