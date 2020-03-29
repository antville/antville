#!/usr/bin/env sh

. tools/init.sh

jar_dir=$export_dir/antville/lib
license_dir=$export_dir/antville/licenses

echo $license_dir

(
  mkdir -p $jar_dir
  mkdir -p $license_dir

  cd $jar_dir

  echo Downloading jdom.jar…

  jar_path=jdom/jdom/1.0/jdom-1.0.jar
  jar_file=$(basename $jar_path)

  $curl $jar_repo/$jar_path
  unzip -lp $jar_file META-INF/LICENSE.txt > $license_dir/jdom.txt

  echo Downloading lesscss.jar

  jar_path=org/lesscss/lesscss/1.7.0.1.1/lesscss-1.7.0.1.1.jar
  jar_file=$(basename $jar_path)

  $curl $jar_repo/$jar_path
  unzip -lp $jar_file META-INF/LICENSE.txt > $license_dir/lesscss.txt

  echo Downloading rome.jar…

  $curl $jar_repo/rome/rome/1.0/rome-1.0.jar
  curl -L# https://raw.githubusercontent.com/rometools/rome/master/LICENSE > $license_dir/rome.txt
)
