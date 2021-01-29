#!/usr/local/bin/node

const pjson = require('../../package.json');
process.stdout.write(pjson.name + '-' + pjson.version);
