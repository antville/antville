#!/usr/bin/env node

const fs = require('fs');

const patchId = new Date()
  .toISOString()
  .replace(/^([\d-]+)T.+$/, '$1')
  .replace(/-/g, '');

const patchFile = `tools/updater/patch-${patchId}.js`;

if (fs.existsSync(patchFile)) {
  throw Error(`Patch file at ${patchFile} already exists; aborting.`)
}

fs.writeFileSync(patchFile, `// Apply with enabled updater repository using \`yarn patch ${patchFile}\`

var sql = new Sql();
`);

console.log(`Created new patch file at ${patchFile}.`);
