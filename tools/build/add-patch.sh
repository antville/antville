#!/usr/bin/env sh

file_date=$(date +%Y%m%d)
file_path="tools/updater/patch-$file_date.js"

if [ -f "$file_path" ]; then
  echo "ERROR: Patch file at $file_path already exists; aborting"
  exit
fi

cat << EOF > $file_path
// Apply with enabled updater repository using \`yarn patch $file_date\`

var sql = new Sql();
EOF

echo "Created new patch file at $file_path"
