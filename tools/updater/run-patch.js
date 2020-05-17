#!/usr/bin/env node

const fs = require('fs');
const readline = require('readline');
const { execSync } = require('child_process');

const patchId = process.argv[2];

if (!patchId) {
  getId();
} else {
  applyPatch(patchId);
}

function getId(interface = getInterface()) {
  interface.question('Please enter a valid patch ID: ', id => {
    if (!id) return getId(interface);

    interface.close();
    applyPatch(id);
  });
}

function applyPatch(id) {
  const patchFile = `tools/updater/patch-${id}.js`;

  if (!fs.existsSync(patchFile)) {
    console.error(`Patch file ${patchFile} does not exist.`);
    return getId();
  }

  const interface = getInterface();
  const code = fs.readFileSync(patchFile).toString('utf8');

  console.info(code);

  interface.question('Apply the code displayed above? (y|N) ', answer => {
    interface.close();

    if (answer.toLowerCase() === 'y') {
      runHelma(code);
    } else {
      console.info('Patch aborted by user.');
    }
  });
}

function getInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

function runHelma(code) {
  const options = { cwd: '/opt/helma' };
  const javaCmd = 'java -cp launcher.jar helma.main.launcher.Commandline';
  const result = execSync(`/usr/bin/env ${javaCmd} antville.patch "${code}"`, options);
  console.info(result.toString('utf8'));
}
