import { KriptonioError } from '@kriptonio/sdk';

export function formatError(error: KriptonioError) {
  const parts = [];
  if (error.code) {
    parts.push(error.code);
  }

  if (error.message) {
    parts.push(error.message);
  }

  return parts.join('. ');
}
