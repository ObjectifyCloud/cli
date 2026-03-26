import { Command } from 'commander';
import ora from 'ora';
import { get, post, del } from '../api.js';
import { printTable, printJson, printSuccess, printError } from '../utils/output.js';

export const filesCmd = new Command('files').description('Manage files');

filesCmd
  .command('list')
  .option('--folder <f>', 'Filter by folder')
  .option('--json', 'JSON output')
  .action(async (opts) => {
    const spinner = ora('Loading...').start();
    try {
      const { data } = await post<Record<string, unknown>[]>('/v1/files/search', { folder: opts.folder });
      spinner.stop();
      if (opts.json) { printJson(data); return; }
      printTable(Array.isArray(data) ? data : [], ['file_id', 'filename', 'mime_type', 'size_bytes', 'folder']);
    } catch (e) { spinner.stop(); printError(String(e)); }
  });

filesCmd
  .command('get <fileId>')
  .action(async (fileId) => {
    try { const { data } = await get(`/v1/files/${fileId}`); printJson(data); }
    catch (e) { printError(String(e)); }
  });

filesCmd
  .command('download <fileId>')
  .option('--output <path>', 'Output path')
  .action(async (fileId, opts) => {
    const spinner = ora('Getting signed URL...').start();
    try {
      const { data } = await post<{ url: string }>(`/v1/files/${fileId}/signed-url`, {});
      spinner.stop();
      console.log(`Download URL: ${data.url}`);
      if (opts.output) {
        const fs = await import('fs');
        const res = await fetch(data.url);
        const buffer = Buffer.from(await res.arrayBuffer());
        fs.writeFileSync(opts.output, buffer);
        printSuccess(`Saved to ${opts.output}`);
      }
    } catch (e) { spinner.stop(); printError(String(e)); }
  });

filesCmd
  .command('delete <fileId>')
  .action(async (fileId) => {
    try { await del(`/v1/files/${fileId}`); printSuccess('Deleted.'); }
    catch (e) { printError(String(e)); }
  });
