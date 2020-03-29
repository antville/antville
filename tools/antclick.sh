#!/usr/bin/env sh

. tools/init.sh

helma_package=https://github.com/antville/helma/releases/download/v20200321/helma-20200329.tgz

# Build dependencies
yarn build

(
  cd $export_dir
  mkdir -p antclick

  echo Downloading Helma package…

  $curl $helma_package

  package_file=$(basename $helma_package)

  # FIXME: Remove when Helma package is released (and uncomment line 12)
  #cp /home/tobi/Projects/helma/current/build/distributions/$package_file .

  echo Extracting Helma package…

  tar -xzf $package_file --strip-components=1 -C antclick

  cd antclick

  echo Removing unneeded files…

  rm -rf apps/* db/* docs extras
  rm -rf apps/antville/docs apps/antville/tools

  echo Copying Antville application into Helma installation…

  cp -r $export_dir/antville apps/
  cp $export_dir/antville/tools/antclick/apps.properties .

  echo Downloading H2 database…

  mkdir -p lib/ext
  cd lib/ext

  jar_path=com/h2database/h2/1.4.200/h2-1.4.200.jar
  jar_file=$(basename $jar_path)
  license_dir=../../licenses/$jar_file/META-INF

  $curl $jar_repo/$jar_path
  mkdir -p $license_dir
  curl -L# https://raw.githubusercontent.com/h2database/h2database/master/LICENSE.txt > $license_dir/LICENSE.txt

  cd -
  rm -f db/antville.mv.db

  echo Initializing Antville schema in H2 database…

  java -cp lib/ext/h2-1.4.200.jar org.h2.tools.RunScript \
      -continueOnError \
      -script apps/antville/db/postgre.sql \
      -url jdbc:h2:./db/antville \
      -user antville \
      -password antville

  echo Generating .tbz package…

  cd ..
  mkdir -p $dist_dir

  package_name=antclick-$npm_package_version

  tar -cjf $dist_dir/$package_name.tbz antclick

  echo Generating .zip package…

  zip -lqr $dist_dir/$package_name.zip antclick
)
