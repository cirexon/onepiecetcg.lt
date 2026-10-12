import { readFile, readdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const lock = JSON.parse(await readFile(resolve(root, 'package-lock.json'), 'utf8'));
const groups = new Map();
const records = [];
const licenseFallbacks = new Map();

for (const [packagePath, metadata] of Object.entries(lock.packages)) {
  if (!packagePath || metadata.dev) continue;
  const directory = resolve(root, packagePath);
  const files = await readdir(directory);
  const licenseFile = files.find(file => /^licen[cs]e(?:[-.]|$)/i.test(file))
    ?? files.find(file => /^copying(?:[-.]|$)/i.test(file));
  const name = packagePath.replace(/^node_modules\//, '');
  const licenseText = licenseFile
    ? (await readFile(resolve(directory, licenseFile), 'utf8'))
        .replace(/\r\n/g, '\n')
        .split('\n')
        .map(line => line.trimEnd())
        .join('\n')
        .trim()
    : null;
  if (licenseText) licenseFallbacks.set(metadata.license, licenseText);
  records.push({ name, version: metadata.version, license: metadata.license, licenseText });
}

const missing = [];
for (const record of records) {
  const licenseText = record.licenseText ?? licenseFallbacks.get(record.license);
  if (!licenseText) {
    missing.push(`${record.name}@${record.version}`);
    continue;
  }
  const key = createHash('sha256').update(licenseText).digest('hex');
  const group = groups.get(key) ?? { licenseText, packages: [] };
  group.packages.push(`${record.name}@${record.version} (${record.license})`);
  groups.set(key, group);
}

if (missing.length) throw new Error(`Missing license files: ${missing.join(', ')}`);

const output = [
  'ONE PIECE TCG LIETUVA - THIRD-PARTY SOFTWARE NOTICES',
  '',
  'Generated from package-lock.json. Production dependencies are grouped when their license text is identical.',
  ''
];

for (const group of [...groups.values()].sort((a, b) => a.packages[0].localeCompare(b.packages[0]))) {
  output.push('='.repeat(80), ...group.packages.sort(), '-'.repeat(80), group.licenseText, '');
}

await writeFile(resolve(root, 'public', 'THIRD_PARTY_NOTICES.txt'), `${output.join('\n').trimEnd()}\n`, 'utf8');
console.log(`Wrote notices for ${[...groups.values()].reduce((count, group) => count + group.packages.length, 0)} production packages.`);
