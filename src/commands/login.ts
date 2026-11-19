import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import * as readline from 'node:readline';
import { api } from '../api.js';
import { setToken, getBaseUrl, clearToken } from '../config.js';
import { printSuccess, printError } from '../utils/output.js';

// Reads stdin directly (no readline, which echoes what it reads to a TTY). A paste or pipe delivers the
// password and its newline in one chunk, so scan every character; stdin ending also finishes the prompt.
export function promptHidden(question: string, stdin: NodeJS.ReadStream = process.stdin): Promise<string> {
  return new Promise((resolve) => {
    process.stderr.write(question);
    const wasRaw = stdin.isRaw;
    if (typeof stdin.setRawMode === 'function') stdin.setRawMode(true);
    let buf = '';
    const finish = () => {
      if (typeof stdin.setRawMode === 'function') stdin.setRawMode(wasRaw ?? false);
      stdin.removeListener('data', onData);
      stdin.removeListener('end', finish);
      stdin.pause();
      process.stderr.write('\n');
      resolve(buf);
    };
    const onData = (chunk: Buffer) => {
      for (const c of chunk.toString('utf8')) {
        if (c === '\n' || c === '\r' || c === '\u0004') return finish();
        if (c === '\u0003') process.exit(130);
        if (c === '\u007f' || c === '\b') buf = buf.slice(0, -1);
        else buf += c;
      }
    };
    stdin.on('data', onData);
    stdin.on('end', finish);
    stdin.resume(); // the email prompt's rl.close() pauses stdin, and adding a 'data' listener does not undo that
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
      email = await new Promise<string>((resolve) =>
        rl.question('Email: ', (a) => {
          rl.close();
          resolve(a.trim());
        }),
      );
    }
    if (!email) {
      printError('Email is required');
      process.exit(1);
    }

    const password = await promptHidden('Password: ');
    if (!password) {
      printError('Password is required');
      process.exit(1);
    }

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

export const logoutCmd = new Command('logout').description('Clear stored credentials').action(() => {
  clearToken();
  printSuccess('Logged out.');
});

export const whoamiCmd = new Command('whoami').description('Show current authentication info').action(async () => {
  const { getAuthInfo } = await import('../config.js');
  const info = getAuthInfo();
  console.log(chalk.bold('Base URL:'), info.baseUrl);
  console.log(
    chalk.bold('Auth:'),
    info.token ? `${info.tokenType} (${info.token.slice(0, 12)}...)` : chalk.gray('not authenticated'),
  );
  if (info.activeTenant) console.log(chalk.bold('Tenant:'), info.activeTenant);
});
