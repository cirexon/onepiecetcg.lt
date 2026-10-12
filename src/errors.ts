import type { Lang } from './i18n';

const safeValidationMessages = new Set([
  'Select an existing player and leader for every result.'
]);

export function safeErrorMessage(error: unknown, lang: Lang) {
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code).replace(/^firestore\//, '') : '';
  const message = error instanceof Error ? error.message : '';
  if (safeValidationMessages.has(message)) return message;
  const lt = lang === 'lt';
  if (code.includes('permission-denied') || code.includes('unauthenticated')) return lt ? 'Neturite teisės atlikti šį veiksmą. Prisijunkite dar kartą arba kreipkitės į administratorių.' : 'You do not have permission for this action. Sign in again or contact an administrator.';
  if (code.includes('unavailable') || code.includes('network-request-failed')) return lt ? 'Paslauga laikinai nepasiekiama. Patikrinkite ryšį ir bandykite dar kartą.' : 'The service is temporarily unavailable. Check your connection and try again.';
  if (code.includes('resource-exhausted') || code.includes('quota-exceeded')) return lt ? 'Pasiektas paslaugos limitas. Bandykite vėliau.' : 'The service limit has been reached. Try again later.';
  return lt ? 'Veiksmo atlikti nepavyko. Bandykite dar kartą.' : 'The action could not be completed. Try again.';
}
