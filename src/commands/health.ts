import { Command } from 'commander';
import chalk from 'chalk';
import { get } from '../api.js';
import { getBaseUrl } from '../config.js';

export const healthCmd = new Command('health').description('Check API health').action(async () => {
  const base = getBaseUrl();
  try {
    const start = Date.now();
    const { data } = await get<{ status: string }>('/health');
    const ms = Date.now() - start;
    console.log(chalk.green('✓'), `${base} — ${(data as Record<string, string>).status} (${ms}ms)`);
  } catch (e) {
    console.log(chalk.red('✗'), `${base} — ${e}`);
    process.exit(1);
  }
});
