import { OpenMeteoError } from '../providers/openMeteo.js';

export function textResult(data: unknown, isError = false) {
  return {
    content: [
      {
        type: 'text' as const,
        text: typeof data === 'string' ? data : JSON.stringify(data, null, 2),
      },
    ],
    isError,
  };
}

export function fromCaught(err: unknown) {
  if (err instanceof OpenMeteoError) {
    return textResult(err.message, true);
  }

  const detail = err instanceof Error ? err.message : String(err);
  // Log técnico a stderr (stdout es el protocolo JSON-RPC).
  console.error('[learning-weather] unexpected error:', detail);
  return textResult(`Error inesperado: ${detail}`, true);
}
