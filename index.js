#!/usr/bin/env node
const path = require('path');

if (process.argv.length < 3) {
  console.log('Please provide a config file');
  process.exit(0);
}

const configPath = path.resolve(process.cwd(), process.argv[2]);
const SPOTTYBOT_CONFIG = require(configPath);
process.env = { ...process.env, ...SPOTTYBOT_CONFIG };

const { main } = require('./dist');
main();
