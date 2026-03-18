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
      const { data } = await get<{ data: Record<string, unknown>[] }>('/admin/tenants');
      spinner.stop();
      if (opts.json) { printJson(data); return; }
      printTable((data as any).data || [data], ['tenant_id', 'organization_name', 'plan_tier', 'created_at']);
    } catch (e) { spinner.stop(); printError(String(e)); }
  });

tenantsCmd
  .command('create')
  .requiredOption('--name <name>', 'Tenant name')
  .option('--slug <slug>', 'Slug')
  .action(async (opts) => {
    const spinner = ora('Creating...').start();
    try {
      const { data } = await post('/admin/tenants', { name: opts.name, slug: opts.slug });
      spinner.stop();
      printSuccess(`Created tenant: ${(data as Record<string, string>).tenant_id}`);
    } catch (e) { spinner.stop(); printError(String(e)); }
  });

tenantsCmd
  .command('get <id>')
  .action(async (id) => {
    try { const { data } = await get(`/admin/tenants/${id}`); printJson(data); }
    catch (e) { printError(String(e)); }
  });

tenantsCmd
  .command('switch <id>')
  .description('Set active tenant context')
  .action((id) => {
    setActiveTenant(id);
    printSuccess(`Active tenant: ${id}`);
  });
