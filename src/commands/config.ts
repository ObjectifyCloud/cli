import { Command } from 'commander';
import { setBaseUrl, getBaseUrl } from '../config.js';
import { printSuccess, printError } from '../utils/output.js';

export const configCmd = new Command('config').description('Manage CLI configuration');

configCmd
  .command('set <key> <value>')
  .description('Set a config value (base-url)')
  .action((key, value) => {
    if (key === 'base-url') {
      setBaseUrl(value);
      printSuccess(`Base URL set to ${value}`);
    } else {
      printError(`Unknown config key: ${key}. Available: base-url`);
    }
  });

configCmd
  .command('get <key>')
  .description('Get a config value')
  .action((key) => {
    if (key === 'base-url') console.log(getBaseUrl());
    else printError(`Unknown config key: ${key}`);
  });
