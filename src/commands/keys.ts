import { Command } from 'commander';
import ora from 'ora';
import { get, post, del } from '../api.js';
import { getActiveTenant } from '../config.js';
import { printTable, printJson, printSuccess, printError } from '../utils/output.js';

export const keysCmd = new Command('keys').description('Manage API keys (admin)');

function tid(opts: { tenant?: string }): string {
  const t = opts.tenant || getActiveTenant();
  if (!t) {
    printError('No active tenant. Use --tenant or `objectify tenants switch <id>`');
    process.exit(1);
  }
  return t;
}

keysCmd
  .command('list')
  .option('--tenant <id>', 'Tenant ID')
  .option('--json', 'JSON output')
  .action(async (opts) => {
    const spinner = ora('Loading...').start();
    try {
      const { data } = await get<Record<string, unknown>[]>(`/admin/tenants/${tid(opts)}/keys`);
      spinner.stop();
      if (opts.json) {
        printJson(data);
        return;
      }
      printTable(Array.isArray(data) ? data : [], ['key_id', 'label', 'scopes', 'status', 'created_at']);
    } catch (e) {
      spinner.stop();
      printError(String(e));
    }
  });

keysCmd
  .command('create')
  .option('--tenant <id>', 'Tenant ID')
  .option('--name <n>', 'Key label')
  .option('--scopes <s>', 'Scopes (comma-separated)', '*')
  .action(async (opts) => {
    const spinner = ora('Creating...').start();
    try {
      const { data } = await post<{ key: { key_id: string }; token: string }>(`/admin/tenants/${tid(opts)}/keys`, {
        label: opts.name,
        scopes: opts.scopes.split(','),
      });
      spinner.stop();
      printSuccess(`Key created: ${data.key.key_id}`);
      console.log(`Token (shown once, store it now): ${data.token}`);
    } catch (e) {
      spinner.stop();
      printError(String(e));
    }
  });

keysCmd
  .command('revoke <keyId>')
  .option('--tenant <id>', 'Tenant ID')
  .action(async (keyId, opts) => {
    try {
      await del(`/admin/tenants/${tid(opts)}/keys/${keyId}`);
      printSuccess('Revoked.');
    } catch (e) {
      printError(String(e));
    }
  });
