import { Command } from 'commander';
import ora from 'ora';
import { get, post } from '../api.js';
import { printTable, printJson, printSuccess, printError } from '../utils/output.js';

export const schemaCmd = new Command('schema').description('Manage object type schemas');

schemaCmd
  .command('list')
  .description('List all object types')
  .option('--json', 'JSON output')
  .action(async (opts) => {
    const spinner = ora('Loading types...').start();
    try {
      const { data } = await get<{ data: Record<string, unknown>[] }>('/v1/object-types');
      spinner.stop();
      if (opts.json) {
        printJson(data);
        return;
      }
      printTable(data.data || (data as unknown as Record<string, unknown>[]), ['object_type_id', 'name', 'created_at']);
    } catch (e) {
      spinner.stop();
      printError(String(e));
    }
  });

schemaCmd
  .command('get <typeId>')
  .description('Get object type details')
  .option('--json', 'JSON output')
  .action(async (typeId, opts) => {
    try {
      const { data } = await get(`/v1/object-types/${typeId}`);
      if (opts.json) {
        printJson(data);
        return;
      }
      console.log(data);
    } catch (e) {
      printError(String(e));
    }
  });

schemaCmd
  .command('create')
  .description('Create an object type')
  .requiredOption('--name <name>', 'Type name')
  .action(async (opts) => {
    const spinner = ora('Creating...').start();
    try {
      const { data } = await post('/v1/object-types', { name: opts.name });
      spinner.stop();
      printSuccess(`Created type: ${(data as Record<string, string>).object_type_id}`);
    } catch (e) {
      spinner.stop();
      printError(String(e));
    }
  });

schemaCmd
  .command('export')
  .description('Export all types as JSON')
  .action(async () => {
    try {
      const { data } = await get('/v1/object-types');
      printJson(data);
    } catch (e) {
      printError(String(e));
    }
  });
