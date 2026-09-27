import { AbortedError, TimeoutError } from '@/core/utils/async';

export type BleErrorCode =
  | 'poweredOff'
  | 'unauthorized'
  | 'unsupported'
  | 'permissionDenied'
  | 'timeout'
  | 'connectionFailed'
  | 'operationFailed'
  | 'notReached'
  | 'deviceNotFound'
  | 'aborted'
  | 'unknown';

export class BleError extends Error {
  readonly code: BleErrorCode;

  constructor(code: BleErrorCode, message?: string, options?: { cause?: unknown }) {
    super(message ?? code, options);
    this.name = 'BleError';
    this.code = code;
  }
}

export function toBleError(error: unknown, fallback: BleErrorCode = 'unknown'): BleError {
  if (error instanceof BleError) return error;
  if (error instanceof TimeoutError) return new BleError('timeout', error.message, { cause: error });
  if (error instanceof AbortedError) return new BleError('aborted', error.message, { cause: error });
  const message = error instanceof Error ? error.message : String(error);
  return new BleError(fallback, message, { cause: error });
}
