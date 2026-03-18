import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { api } from '../api.js';
import { setToken, getBaseUrl } from '../config.js';
import { printSuccess, printError } from '../utils/output.js';

export const loginCmd = new Command('login')
  .description('Authenticate with the Objectify API')
  .option('--api-key <key>', 'Authenticate with an API key')
  .option('--admin-key <key>', 'Authenticate with admin key')
  .option('--email <email>', 'Email for owner login')
  .option('--password <password>', 'Password for owner login')
  .action(async (opts) => {
    if (opts.apiKey) {
      setToken(opts.apiKey, 'api_key');
      printSuccess('API key saved.');
      return;
    }
    if (opts.adminKey) {
      setToken(opts.adminKey, 'admin_key');
      printSuccess('Admin key saved.');
      return;
    }

    if (!opts.email || !opts.password) {
      printError('Provide --email and --password, or --api-key, or --admin-key');
      process.exit(1);
    }

    const spinner = ora('Logging in...').start();
    try {
      const { data } = await api<{ access_token: string }>('POST', '/owner/login', {
        body: { email: opts.email, password: opts.password },
        baseUrl: getBaseUrl(),
      });
      setToken(data.access_token, 'jwt');
      spinner.stop();
      printSuccess(`Logged in as ${chalk.bold(opts.email)}`);
    } catch (err) {
      spinner.stop();
      printError(String(err));
      process.exit(1);
    }
  });

export const logoutCmd = new Command('logout')
  .description('Clear stored credentials')
  .action(() => {
    const { clearToken } = require('../config.js');
    clearToken();
    printSuccess('Logged out.');
  });

export const whoamiCmd = new Command('whoami')
  .description('Show current authentication info')
  .action(async () => {
    const { getAuthInfo } = await import('../config.js');
    const info = getAuthInfo();
    console.log(chalk.bold('Base URL:'), info.baseUrl);
    console.log(chalk.bold('Auth:'), info.token ? `${info.tokenType} (${info.token.slice(0, 12)}...)` : chalk.gray('not authenticated'));
    if (info.activeTenant) console.log(chalk.bold('Tenant:'), info.activeTenant);
  });
