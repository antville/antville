#!/usr/bin/env sh

. tools/build/init.sh

(
  cd $helma_dir

  /usr/bin/env java -cp lib/rhino-*.jar \
      org.mozilla.javascript.tools.shell.Main \
      $hopkit_dir/scripts/PoParser.js \
      $base_dir/i18n \
      $base_dir/i18n
)
