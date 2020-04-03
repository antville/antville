#!/usr/bin/env sh

. tools/build/init.sh

(
  cd $helma_dir

  # Root.extractMessages is currently located in Global/i18n.js
  /usr/bin/env java -cp launcher.jar \
      helma.main.launcher.Commandline \
      antville.extractMessages \
      $hopkit_dir/scripts/MessageParser.js \
      'code compat' \
      $base_dir/i18n/antville.pot
)
