import type { UseQueryResult } from '@tanstack/react-query';

/**
 * Use for full-screen / blocking loaders: the first in-flight fetch for a query does not count
 * (matches “no spinner on first screen visit”). After `isFetched`, hard loading can show if needed.
 */
export function shouldShowBlockingQuerySpinner(
  result: Pick<UseQueryResult, 'isLoading' | 'isFetched'>,
): boolean {
  return result.isLoading && result.isFetched;
}

export function shouldShowBlockingSpinnerAny(
  results: Array<Pick<UseQueryResult, 'isLoading' | 'isFetched'>>,
): boolean {
  return results.some(r => shouldShowBlockingQuerySpinner(r));
}
