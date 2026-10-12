import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'node:crypto';

const FORMAT = 'onepiecetcg-firestore-backup-v1';

function deriveKey(passphrase, salt) {
  if (passphrase.length < 12) throw new Error('Use a backup passphrase with at least 12 characters.');
  return scryptSync(passphrase, salt, 32, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
}

export function encryptBackup(value, passphrase) {
  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', deriveKey(passphrase, salt), iv);
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(value), 'utf8'), cipher.final()]);
  return {
    format: FORMAT,
    kdf: 'scrypt-N32768-r8-p1',
    cipher: 'aes-256-gcm',
    salt: salt.toString('base64'),
    iv: iv.toString('base64'),
    tag: cipher.getAuthTag().toString('base64'),
    ciphertext: ciphertext.toString('base64'),
  };
}

export function decryptBackup(envelope, passphrase) {
  if (!envelope || envelope.format !== FORMAT || envelope.cipher !== 'aes-256-gcm') {
    throw new Error('Unsupported or invalid backup file.');
  }
  const salt = Buffer.from(envelope.salt, 'base64');
  const iv = Buffer.from(envelope.iv, 'base64');
  const tag = Buffer.from(envelope.tag, 'base64');
  const decipher = createDecipheriv('aes-256-gcm', deriveKey(passphrase, salt), iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(Buffer.from(envelope.ciphertext, 'base64')), decipher.final()]);
  return JSON.parse(plaintext.toString('utf8'));
}
