import chalk from 'chalk';

export function printJson(data: unknown): void {
  console.log(JSON.stringify(data, null, 2));
}

export function printTable(rows: Record<string, unknown>[], columns?: string[]): void {
  if (!rows.length) {
    console.log(chalk.gray('No results.'));
    return;
  }
  const cols = columns || Object.keys(rows[0]);
  const widths = cols.map((c) => Math.max(c.length, ...rows.map((r) => String(r[c] ?? '').length)));

  const header = cols.map((c, i) => chalk.bold(c.padEnd(widths[i]))).join('  ');
  const sep = cols.map((_, i) => '─'.repeat(widths[i])).join('──');
  console.log(header);
  console.log(chalk.gray(sep));
  for (const row of rows) {
    console.log(cols.map((c, i) => String(row[c] ?? '').padEnd(widths[i])).join('  '));
  }
}

export function printSuccess(msg: string): void {
  console.log(chalk.green('✓'), msg);
}

export function printError(msg: string): void {
  console.error(chalk.red('✗'), msg);
}
