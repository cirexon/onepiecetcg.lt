import { describe, expect, it } from 'vitest';
import { decryptBackup, encryptBackup } from '../scripts/backup-crypto.mjs';

describe('encrypted Firestore backups', () => {
  const payload = { projectId: 'onepiecetcglt', documents: [{ name: 'players/example', fields: { name: { stringValue: 'Example' } } }] };

  it('round trips data without exposing plaintext', () => {
    const envelope = encryptBackup(payload, 'a-long-local-test-passphrase');
    expect(JSON.stringify(envelope)).not.toContain('Example');
    expect(decryptBackup(envelope, 'a-long-local-test-passphrase')).toEqual(payload);
  });

  it('rejects an incorrect passphrase or modified ciphertext', () => {
    const envelope = encryptBackup(payload, 'a-long-local-test-passphrase');
    expect(() => decryptBackup(envelope, 'a-different-test-passphrase')).toThrow();
    const modified = { ...envelope, ciphertext: `${envelope.ciphertext.slice(0, -2)}AA` };
    expect(() => decryptBackup(modified, 'a-long-local-test-passphrase')).toThrow();
  });
});
