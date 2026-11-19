import { Command } from 'commander';
import ora from 'ora';
import { get, post } from '../api.js';
import { setActiveTenant } from '../config.js';
import { printTable, printJson, printSuccess, printError } from '../utils/output.js';

export const tenantsCmd = new Command('tenants').description('Manage tenants (admin)');

tenantsCmd
  .command('list')
  .option('--json', 'JSON output')
  .action(async (opts) => {
    const spinner = ora('Loading...').start();
    try {
      const { data } = await get<{ tenants: Record<string, unknown>[] }>('/admin/tenants');
      spinner.stop();
      if (opts.json) {
        printJson(data);
        return;
      }
      printTable(data.tenants ?? [], ['tenant_id', 'organization_name', 'plan_tier', 'created_at']);
    } catch (e) {
      spinner.stop();
      printError(String(e));
    }
  });

tenantsCmd
  .command('create')
  // The API takes only tenant_id (plus optional plan_limits/allowed_origins); it has no name or slug.
  .requiredOption('--tenant-id <id>', 'Tenant ID (letters, digits, hyphens, underscores)')
  .action(async (opts) => {
    const spinner = ora('Creating...').start();
    try {
      const { data } = await post<{ route: { tenant_id: string }; api_key: string }>('/admin/tenants', {
        tenant_id: opts.tenantId,
      });
      spinner.stop();
      printSuccess(`Created tenant: ${data.route.tenant_id}`);
      console.log(`API key (shown once, store it now): ${data.api_key}`);
    } catch (e) {
      spinner.stop();
      printError(String(e));
    }
  });

tenantsCmd.command('get <id>').action(async (id) => {
  try {
    const { data } = await get(`/admin/tenants/${id}`);
    printJson(data);
  } catch (e) {
    printError(String(e));
  }
});

tenantsCmd
  .command('switch <id>')
  .description('Set active tenant context')
  .action((id) => {
    setActiveTenant(id);
    printSuccess(`Active tenant: ${id}`);
  });
