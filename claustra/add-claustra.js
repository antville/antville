#!/usr/bin/env node

const fs = require('fs');
const readline = require('readline');

const name = process.argv[2];

if (!name) {
  getName();
} else {
  createClaustra(name);
}

function getName(interface = getInterface()) {
  interface.question('Please enter the name of the new claustra: ', name => {
    if (!name) return getName(interface);

    interface.close();
    createClaustra(name);
  });
}

function createClaustra(name) {
  const firstLetter = name.substr(0, 1).toUpperCase();
  const title = firstLetter + name.substr(1);
  const claustraDir = `claustra/${name.toLowerCase()}/${title}`;

  if (fs.existsSync(claustraDir)) {
    return console.error(`ERROR: Claustra at ${claustraDir} already exists; aborting`);
  }

  fs.mkdirSync(claustraDir, { recursive: true });
  fs.mkdirSync(`${claustraDir}/../Claustra`, { recursive: true });

  fs.writeFileSync(`${claustraDir}/${title}.properties`, '#sites = collection(Site)');
  fs.writeFileSync(`${claustraDir}/../Claustra/Claustra.properties`, `${name} = mountpoint(${title})`);

  fs.writeFileSync(`${claustraDir}/${title}.js`, [
    `${title}.prototype.main_action = function () {`,
    '  //res.debug(this.sites.count());',
    '}'
  ].join('\n'));

  console.info(`Created new claustra at ${claustraDir}`);
}

function getInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}
