#!/usr/bin/env node
import { Command } from 'commander';
import { loginCmd, logoutCmd, whoamiCmd } from './commands/login.js';
import { schemaCmd } from './commands/schema.js';
import { objectsCmd } from './commands/objects.js';
import { tenantsCmd } from './commands/tenants.js';
import { filesCmd } from './commands/files.js';
import { keysCmd } from './commands/keys.js';
import { healthCmd } from './commands/health.js';
import { configCmd } from './commands/config.js';

const program = new Command()
  .name('objectify')
  .description('CLI for the Objectify Objects Platform API')
  .version('0.1.0');

program.addCommand(loginCmd);
program.addCommand(logoutCmd);
program.addCommand(whoamiCmd);
program.addCommand(schemaCmd);
program.addCommand(objectsCmd);
program.addCommand(tenantsCmd);
program.addCommand(filesCmd);
program.addCommand(keysCmd);
program.addCommand(healthCmd);
program.addCommand(configCmd);

program.parse();
