import { Command } from 'commander';
import ora from 'ora';
import { get, post, del } from '../api.js';
import { printTable, printJson, printSuccess, printError } from '../utils/output.js';

export const objectsCmd = new Command('objects').description('Manage objects');

objectsCmd
  .command('list <typeId>')
  .description('List objects')
  .option('--limit <n>', 'Limit', '20')
  .option('--cursor <c>', 'Cursor')
  .option('--json', 'JSON output')
  .action(async (typeId, opts) => {
    const spinner = ora('Loading...').start();
    try {
      const { data } = await get<{ results: Record<string, unknown>[] }>(`/v1/objects/${typeId}/list`, {
        limit: opts.limit,
        cursor: opts.cursor,
      });
      spinner.stop();
      if (opts.json) {
        printJson(data);
        return;
      }
      printTable(data.results ?? [], ['object_id', 'created_at', 'updated_at']);
    } catch (e) {
      spinner.stop();
      printError(String(e));
    }
  });

objectsCmd
  .command('get <typeId> <objectId>')
  .description('Get object details')
  .option('--json', 'JSON output')
  .action(async (typeId, objectId, _opts) => {
    try {
      const { data } = await get(`/v1/objects/${typeId}/${objectId}`);
      printJson(data);
    } catch (e) {
      printError(String(e));
    }
  });

objectsCmd
  .command('create <typeId>')
  .description('Create an object')
  .requiredOption('--data <json>', 'Properties JSON')
  .action(async (typeId, opts) => {
    const spinner = ora('Creating...').start();
    try {
      const properties = JSON.parse(opts.data);
      const { data } = await post(`/v1/objects/${typeId}`, { properties });
      spinner.stop();
      printSuccess(`Created: ${(data as Record<string, string>).object_id}`);
    } catch (e) {
      spinner.stop();
      printError(String(e));
    }
  });

objectsCmd
  .command('search <typeId>')
  .description('Search objects')
  .option('--filter <f>', 'Filter (property=value)')
  .option('--limit <n>', 'Limit', '20')
  .option('--json', 'JSON output')
  .action(async (typeId, opts) => {
    const spinner = ora('Searching...').start();
    try {
      const filters: unknown[] = [];
      if (opts.filter) {
        const [prop, ...rest] = opts.filter.split('=');
        filters.push({ property_id: prop, operator: 'eq', value: rest.join('=') });
      }
      const { data } = await post<{ results: Record<string, unknown>[] }>(`/v1/objects/${typeId}/search`, {
        filters,
        limit: parseInt(opts.limit),
      });
      spinner.stop();
      if (opts.json) {
        printJson(data);
        return;
      }
      printTable(data.results ?? [], ['object_id', 'created_at']);
    } catch (e) {
      spinner.stop();
      printError(String(e));
    }
  });

objectsCmd
  .command('delete <typeId> <objectId>')
  .description('Delete an object')
  .action(async (typeId, objectId) => {
    try {
      await del(`/v1/objects/${typeId}/${objectId}`);
      printSuccess('Deleted.');
    } catch (e) {
      printError(String(e));
    }
  });
