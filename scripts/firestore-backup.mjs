import { createRequire } from 'node:module';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { decryptBackup, encryptBackup } from './backup-crypto.mjs';

const PROJECT_ID = 'onepiecetcglt';
const DATABASE = '(default)';
const ROOT = `projects/${PROJECT_ID}/databases/${DATABASE}/documents`;
const API = 'https://firestore.googleapis.com/v1';
const command = process.argv[2];
const fileArgument = process.argv[3];
const apply = process.argv.includes('--apply');

function usage() {
  console.log(`Usage:
  npm run backup:firestore
  npm run backup:verify -- <encrypted-file>
  npm run backup:restore -- <encrypted-file>          # dry run
  npm run backup:restore -- <encrypted-file> --apply  # writes data`);
}

async function promptSecret(label) {
  if (!process.stdin.isTTY || !process.stdout.isTTY) throw new Error('Run this command in an interactive terminal so the passphrase is not echoed or stored.');
  process.stdout.write(label);
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  return new Promise((resolvePromise, reject) => {
    let value = '';
    const cleanup = () => {
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdin.removeListener('data', onData);
      process.stdout.write('\n');
    };
    const onData = input => {
      for (const character of input) {
        if (character === '\u0003') {
          cleanup();
          reject(new Error('Cancelled.'));
          return;
        } else if (character === '\r' || character === '\n') {
          cleanup();
          resolvePromise(value);
          return;
        } else if (character === '\u007f' || character === '\b') {
          value = value.slice(0, -1);
        } else if (character >= ' ') {
          value += character;
        }
      }
    };
    process.stdin.on('data', onData);
  });
}

async function getAccessToken() {
  const require = createRequire(import.meta.url);
  const auth = require('../node_modules/firebase-tools/lib/auth.js');
  const scopes = require('../node_modules/firebase-tools/lib/scopes.js');
  const account = auth.getGlobalDefaultAccount();
  if (!account?.tokens?.refresh_token) throw new Error('Firebase CLI login is required. Run: npx firebase login');
  const tokens = await auth.getAccessToken(account.tokens.refresh_token, [
    scopes.EMAIL,
    scopes.OPENID,
    scopes.CLOUD_PROJECTS_READONLY,
    scopes.FIREBASE_PLATFORM,
    scopes.CLOUD_PLATFORM,
  ]);
  return tokens.access_token;
}

async function request(token, path, init = {}) {
  const response = await fetch(`${API}/${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(init.headers ?? {}) },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`Firestore API ${response.status}: ${body.error?.message ?? response.statusText}`);
  return body;
}

async function listCollectionIds(token, parent) {
  const ids = [];
  let pageToken;
  do {
    const body = await request(token, `${parent}:listCollectionIds`, {
      method: 'POST', body: JSON.stringify({ pageSize: 1000, pageToken }),
    });
    ids.push(...(body.collectionIds ?? []));
    pageToken = body.nextPageToken;
  } while (pageToken);
  return ids;
}

async function listDocuments(token, parent, collectionId) {
  const documents = [];
  let pageToken;
  do {
    const query = new URLSearchParams({ pageSize: '1000', showMissing: 'false' });
    if (pageToken) query.set('pageToken', pageToken);
    const body = await request(token, `${parent}/${encodeURIComponent(collectionId)}?${query}`);
    documents.push(...(body.documents ?? []));
    pageToken = body.nextPageToken;
  } while (pageToken);
  return documents;
}

async function readAllDocuments(token) {
  const queue = [ROOT];
  const visited = new Set();
  const documents = [];
  while (queue.length) {
    const parent = queue.shift();
    if (visited.has(parent)) continue;
    visited.add(parent);
    for (const collectionId of await listCollectionIds(token, parent)) {
      for (const document of await listDocuments(token, parent, collectionId)) {
        documents.push({ name: document.name, fields: document.fields ?? {} });
        queue.push(document.name);
      }
    }
  }
  return documents.sort((left, right) => left.name.localeCompare(right.name));
}

async function loadEncryptedBackup(path) {
  const passphrase = await promptSecret('Backup passphrase: ');
  const envelope = JSON.parse(await readFile(path, 'utf8'));
  const payload = decryptBackup(envelope, passphrase);
  if (payload.projectId !== PROJECT_ID || payload.database !== DATABASE || !Array.isArray(payload.documents)) {
    throw new Error('Backup metadata does not match this Firebase project.');
  }
  return payload;
}

async function createBackup() {
  const first = await promptSecret('New backup passphrase (minimum 12 characters): ');
  const second = await promptSecret('Confirm backup passphrase: ');
  if (first !== second) throw new Error('Passphrases do not match.');
  const token = await getAccessToken();
  const documents = await readAllDocuments(token);
  const createdAt = new Date().toISOString();
  const payload = { schemaVersion: 1, projectId: PROJECT_ID, database: DATABASE, createdAt, documents };
  const destination = resolve(fileArgument ?? `.backups/firestore-${createdAt.replace(/[:.]/g, '-')}.json.enc`);
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, `${JSON.stringify(encryptBackup(payload, first), null, 2)}\n`, { mode: 0o600 });
  console.log(`Encrypted backup created: ${destination}`);
  console.log(`Documents: ${documents.length}`);
  console.log('Keep the passphrase separately; it cannot be recovered from the file.');
}

async function verifyBackup() {
  if (!fileArgument) throw new Error('Provide the encrypted backup path.');
  const payload = await loadEncryptedBackup(resolve(fileArgument));
  console.log(`Valid encrypted backup for ${payload.projectId}; ${payload.documents.length} documents; created ${payload.createdAt}.`);
}

async function restoreBackup() {
  if (!fileArgument) throw new Error('Provide the encrypted backup path.');
  const payload = await loadEncryptedBackup(resolve(fileArgument));
  const prefix = `${ROOT}/`;
  if (payload.documents.some(document => typeof document.name !== 'string' || !document.name.startsWith(prefix) || typeof document.fields !== 'object')) {
    throw new Error('Backup contains an invalid document path or body.');
  }
  console.log(`Restore plan: upsert ${payload.documents.length} documents into ${PROJECT_ID}/${DATABASE}. Existing documents absent from the backup will remain.`);
  if (!apply) {
    console.log('Dry run only. Repeat with --apply to write the documents.');
    return;
  }
  const token = await getAccessToken();
  for (let index = 0; index < payload.documents.length; index += 500) {
    const batch = payload.documents.slice(index, index + 500);
    await request(token, `projects/${PROJECT_ID}/databases/${DATABASE}/documents:batchWrite`, {
      method: 'POST',
      body: JSON.stringify({ writes: batch.map(document => ({ update: document })) }),
    });
  }
  console.log(`Restore complete: ${payload.documents.length} documents upserted.`);
}

try {
  if (command === 'backup') await createBackup();
  else if (command === 'verify') await verifyBackup();
  else if (command === 'restore') await restoreBackup();
  else { usage(); process.exitCode = 1; }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
