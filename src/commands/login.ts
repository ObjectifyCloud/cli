import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import * as readline from 'node:readline';
import { api } from '../api.js';
import { setToken, getBaseUrl } from '../config.js';
import { printSuccess, printError } from '../utils/output.js';

function promptHidden(question: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stderr });
    process.stderr.write(question);
    const stdin = process.stdin;
    const wasRaw = stdin.isRaw;
    if (typeof stdin.setRawMode === 'function') stdin.setRawMode(true);
    let buf = '';
    const onData = (ch: Buffer) => {
      const c = ch.toString('utf8');
      if (c === '\n' || c === '\r' || c === '\u0004') {
        if (typeof stdin.setRawMode === 'function') stdin.setRawMode(wasRaw ?? false);
        stdin.removeListener('data', onData);
        rl.close();
        process.stderr.write('\n');
        resolve(buf);
      } else if (c === '\u0003') {
        process.exit(130);
      } else if (c === '\u007f' || c === '\b') {
        buf = buf.slice(0, -1);
      } else {
        buf += c;
      }
    };
    stdin.on('data', onData);
  });
}

export const loginCmd = new Command('login')
  .description('Authenticate with the Objectify API')
  .option('--api-key <key>', 'Authenticate with an API key')
  .option('--admin-key <key>', 'Authenticate with admin key')
  .option('--email <email>', 'Email for owner login')
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

    let email = opts.email;
    if (!email) {
      const rl = readline.createInterface({ input: process.stdin, output: process.stderr });
      email = await new Promise<string>((resolve) => rl.question('Email: ', (a) => { rl.close(); resolve(a.trim()); }));
    }
    if (!email) { printError('Email is required'); process.exit(1); }

    const password = await promptHidden('Password: ');
    if (!password) { printError('Password is required'); process.exit(1); }

    const spinner = ora('Logging in...').start();
    try {
      const { data } = await api<{ token: string }>('POST', '/owner/login', {
        body: { email, password },
        baseUrl: getBaseUrl(),
      });
      setToken(data.token, 'jwt');
      spinner.stop();
      printSuccess(`Logged in as ${chalk.bold(email)}`);
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
