import type { Query } from '@tanstack/react-query';
import type { Middleware, QueryHook } from 'react-query-kit';
import { skipToken } from '@tanstack/react-query';
import { getKey } from 'react-query-kit';

import { readDiskCachedQueryData, writeDiskCachedQueryData } from '@/lib/query-disk-cache';

/**
 * Hydrates each query from MMKV (placeholderData), then persists successful fetch results.
 * Scoped per authenticated user via {@link queryKeyToStorageKey}.
 *
 * Add to every {@link createQuery} as `use: [queryDiskCacheMiddleware]`.
 */
export const queryDiskCacheMiddleware: Middleware<QueryHook<any, any, Error>> = useQueryNext => (
  options,
  queryClient,
) => {
  if ((options as { variables?: unknown }).variables === skipToken)
    return useQueryNext(options, queryClient);

  const origFetcher = options.fetcher;
  if (!origFetcher)
    return useQueryNext(options, queryClient);

  const fullQueryKey = getKey(options.queryKey, options.variables);
  const cached = readDiskCachedQueryData(fullQueryKey);
  const userPlaceholderData = options.placeholderData;

  return useQueryNext(
    {
      ...options,
      placeholderData: (previousData: unknown, query: Query) => {
        if (previousData !== undefined)
          return previousData;
        if (userPlaceholderData !== undefined) {
          if (typeof userPlaceholderData === 'function') {
            const fromUser = (userPlaceholderData as (a: unknown, q: Query) => unknown)(
              previousData,
              query,
            );
            if (fromUser !== undefined)
              return fromUser;
          }
          else {
            return userPlaceholderData;
          }
        }
        return cached;
      },
      fetcher: async (variables, context) => {
        const data = await origFetcher(variables, context);
        writeDiskCachedQueryData(context.queryKey, data);
        return data;
      },
    },
    queryClient,
  );
};
